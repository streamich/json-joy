import * as util from './util';
import {Codegen} from '../util/codegen/Codegen';
import {Expression, ExpressionResult, Literal} from './codegen-steps';
import {createEvaluate} from './createEvaluate';
import {JavaScript} from '../util/codegen';
import type * as types from './types';
import {Vars} from './Vars';

const toBoxed = (value: unknown): unknown => (value instanceof Array ? [value] : value);

const linkable = {
  get: util.get,
  throwOnUndef: util.throwOnUndef,
  str: util.str,
  isInContainer: util.isInContainer,
  substr: util.substr,
  slash: util.slash,
  mod: util.mod,
};

export type JsonExpressionFn = (ctx: types.JsonExpressionExecutionContext) => unknown;

export interface JsonExpressionCodegenOptions extends types.JsonExpressionCodegenContext {
  expression: types.Expr;
  operators: types.OperatorMap;
}

export class JsonExpressionCodegen {
  protected codegen: Codegen<JsonExpressionFn, typeof linkable>;
  protected evaluate: ReturnType<typeof createEvaluate>;

  public constructor(protected options: JsonExpressionCodegenOptions) {
    this.codegen = new Codegen<JsonExpressionFn, typeof linkable>({
      args: ['ctx'],
      prologue: 'var vars = ctx.vars;',
      epilogue: '',
      linkable,
    });
    this.evaluate = createEvaluate({...options});
  }

  protected onIn(expr: types.ExprIn): ExpressionResult {
    if (expr.length > 3) throw new Error('"in" operator expects two operands.');
    const [, a, b] = expr;
    const container = this.onExpression(b);
    const what = this.onExpression(a);
    if (container instanceof Literal) {
      if (!(container.val instanceof Array)) throw new Error('"in" operator expects second operand to be an array.');
      if (what instanceof Literal) return new Literal(util.isInContainer(what.val, container.val));
      if (container.val.length === 0) return new Literal(false);
      if (container.val.length === 1) return this.onExpression(['==', a, toBoxed(container.val[0])]);
    }
    this.codegen.link('isInContainer');
    return new Expression(`isInContainer(${what}, ${container})`);
  }

  private linkedOperandDeps: Set<string> = new Set();
  private linkOperandDeps = (dependency: unknown, name?: string): string => {
    if (name) {
      if (this.linkedOperandDeps.has(name)) return name;
      this.linkedOperandDeps.add(name);
    } else {
      name = this.codegen.getRegister();
    }
    this.codegen.linkDependency(dependency, name);
    return name;
  };

  private operatorConst = (js: JavaScript<unknown>): string => {
    return this.codegen.addConstant(js);
  };

  protected onExpression(expr: types.Expr | unknown): ExpressionResult {
    if (expr instanceof Array) {
      if (expr.length === 1) return new Literal(expr[0]);
    } else return new Literal(expr);

    const def = this.options.operators.get(expr[0]);
    if (def) {
      const [name, , arity, , codegen, impure] = def;
      util.assertArity(name, arity, expr);
      const operands = expr.slice(1).map((operand) => this.onExpression(operand));
      if (!impure) {
        const allLiterals = operands.every((expr) => expr instanceof Literal);
        if (allLiterals) {
          const result = this.evaluate(expr, {vars: new Vars(undefined)});
          return new Literal(result);
        }
      }
      const ctx: types.OperatorCodegenCtx<types.Expression> = {
        expr,
        operands,
        createPattern: this.options.createPattern,
        operand: (operand: types.Expression) => this.onExpression(operand),
        link: this.linkOperandDeps,
        const: this.operatorConst,
      };
      return codegen(ctx);
    }

    switch (expr[0]) {
      case 'in':
        return this.onIn(expr as types.ExprIn);
    }
    return new Literal(false);
  }

  public run(): this {
    const expr = this.onExpression(this.options.expression);
    this.codegen.js(`return ${expr};`);
    return this;
  }

  public generate() {
    return this.codegen.generate();
  }

  public compile() {
    const fn = this.codegen.compile();
    return (ctx: types.JsonExpressionExecutionContext) => {
      try {
        return fn(ctx);
      } catch (err) {
        if (err instanceof Error) throw err;
        const error = new Error('Expression evaluation error.');
        (<any>error).value = err;
        throw error;
      }
    };
  }
}
