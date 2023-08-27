import * as util from './util';
import {Codegen} from '../util/codegen/Codegen';
import {$$find} from '../json-pointer/codegen/find';
import {toPath, validateJsonPointer} from '../json-pointer';
import {emitStringMatch} from '../util/codegen/util/helpers';
import {Expression, ExpressionResult, Literal} from './codegen-steps';
import {createEvaluate} from './createEvaluate';
import {JavaScript} from '../util/codegen';
import type * as types from './types';

const toBoxed = (value: unknown): unknown => (value instanceof Array ? [value] : value);

const linkable = {
  get: util.get,
  throwOnUndef: util.throwOnUndef,
  type: util.type,
  str: util.str,
  starts: util.starts,
  contains: util.contains,
  ends: util.ends,
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
      prologue: 'var data = ctx.data;',
      epilogue: '',
      linkable,
    });
    this.evaluate = createEvaluate({operators: options.operators});
  }

  protected onGet(expr: types.ExprGet): ExpressionResult {
    if (expr.length < 2 || expr.length > 3) throw new Error('"get" operator expects two or three operands.');
    const path = this.onExpression(expr[1]);
    const def = expr[2] === undefined ? undefined : this.onExpression(expr[2]);
    if (def !== undefined && !util.isLiteral(expr[2]))
      throw new Error('"get" operator expects a default value to be a literal.');
    this.codegen.link('throwOnUndef');
    if (path instanceof Literal) {
      if (typeof path.val !== 'string') throw new Error('Invalid JSON pointer.');
      validateJsonPointer(path.val);
      const fn = $$find(toPath(path.val));
      const d = this.codegen.addConstant(fn);
      return new Expression(`throwOnUndef(${d}(data), ${def})`);
    } else {
      this.codegen.link('get');
      return new Expression(`throwOnUndef(get(${path}, data), ${def})`);
    }
  }

  protected onIf(expr: types.ExprIf): ExpressionResult {
    if (expr.length !== 4) throw new Error('"if" operator expects three operands.');
    const [, a, b, c] = expr;
    const condition = this.onExpression(a);
    if (condition instanceof Literal) return condition.val ? this.onExpression(b) : this.onExpression(c);
    return new Expression(`${condition} ? ${this.onExpression(b)} : ${this.onExpression(c)}`);
  }

  protected onType(expr: types.ExprType): ExpressionResult {
    if (expr.length !== 2) throw new Error('"type" operator expects one operand.');
    const [, operand] = expr;
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(util.type(expression.val));
    this.codegen.link('type');
    return new Expression(`type(${expression})`);
  }

  protected onBool(expr: types.ExprBool): ExpressionResult {
    if (expr.length !== 2) throw new Error('"bool" operator expects one operand.');
    const [, operand] = expr;
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(!!expression.val);
    return new Expression(`!!(${expression})`);
  }

  protected onNum(expr: types.ExprNum): ExpressionResult {
    if (expr.length !== 2) throw new Error('"num" operator expects one operand.');
    const [, operand] = expr;
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(+(expression.val as number) || 0);
    return new Expression(`+(${expression}) || 0`);
  }

  protected onInt(expr: types.ExprInt): ExpressionResult {
    if (expr.length !== 2) throw new Error('"int" operator expects one operand.');
    const [, operand] = expr;
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(~~(expression.val as number));
    return new Expression(`+(${expression})`);
  }

  protected onStr(expr: types.ExprStr): ExpressionResult {
    if (expr.length !== 2) throw new Error('"str" operator expects one operand.');
    const [, operand] = expr;
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(util.str(expression.val));
    this.codegen.link('str');
    return new Expression(`str(${expression})`);
  }

  protected onStarts(expr: types.ExprStarts): ExpressionResult {
    if (expr.length !== 3) throw new Error('"starts" operator expects two operands.');
    const [, a, b] = expr;
    const outer = this.onExpression(a);
    const inner = this.onExpression(b);
    if (inner instanceof Literal) {
      if (outer instanceof Literal) return new Literal(util.starts(outer.val, inner.val));
      else {
        const rOuter = this.codegen.var();
        return new Expression(`(${rOuter} = ${outer.toString()}, (${emitStringMatch(rOuter, '0', '' + inner.val)}))`);
      }
    } else {
      this.codegen.link('starts');
      return new Expression(`starts(${outer}, ${inner})`);
    }
  }

  protected onContains(expr: types.ExprContains): ExpressionResult {
    if (expr.length !== 3) throw new Error('"contains" operator expects two operands.');
    const [, a, b] = expr;
    const outer = this.onExpression(a);
    const inner = this.onExpression(b);
    if (outer instanceof Literal && inner instanceof Literal) return new Literal(util.contains(outer.val, inner.val));
    this.codegen.link('contains');
    return new Expression(`contains(${outer}, ${inner})`);
  }

  protected onEnds(expr: types.ExprEnds): ExpressionResult {
    if (expr.length !== 3) throw new Error('"ends" operator expects two operands.');
    const [, a, b] = expr;
    const outer = this.onExpression(a);
    const inner = this.onExpression(b);
    if (inner instanceof Literal) {
      if (outer instanceof Literal) return new Literal(util.ends(outer.val, inner.val));
      else {
        const rOuter = this.codegen.var();
        const rStart = this.codegen.var();
        const match = '' + inner.val;
        return new Expression(
          `(${rOuter} = ${outer.toString()}, ${rStart} = ${rOuter}.length - ${match.length}, (${emitStringMatch(
            rOuter,
            rStart,
            match,
          )}))`,
        );
      }
    } else {
      this.codegen.link('ends');
      return new Expression(`ends(${outer}, ${inner})`);
    }
  }

  protected onMatches(expr: types.ExprMatches): ExpressionResult {
    if (expr.length !== 3) throw new Error('"matches" operator expects two operands.');
    const [, a, pattern] = expr;
    if (typeof pattern !== 'string')
      throw new Error('"matches" second argument should be a regular expression string.');
    const subject = this.onExpression(a);
    if (!this.options.createPattern)
      throw new Error('"matches" operator requires ".createPattern()" option to be implemented.');
    const fn = this.options.createPattern(pattern);
    if (subject instanceof Literal) return new Literal(fn(util.str(subject.val)));
    const d = this.codegen.linkDependency(fn);
    this.codegen.link('str');
    return new Expression(`${d}(str(${subject}))`);
  }

  protected onDefined(expr: types.ExprDefined): ExpressionResult {
    if (expr.length > 2) throw new Error('"defined" operator expects one operand.');
    const [, pointer] = expr;
    if (typeof pointer !== 'string') throw new Error('Invalid JSON pointer.');
    validateJsonPointer(pointer);
    const fn = $$find(toPath(pointer));
    const d = this.codegen.addConstant(fn);
    return new Expression(`${d}(data) !== undefined`);
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

  protected onCat(expr: types.ExprCat): ExpressionResult {
    if (expr.length <= 2) throw new Error('"cat" operator expects at least two operands.');
    const [, ...operands] = expr;
    const expressions = operands.map((operand) => this.onExpression(operand));
    let areAllLiteral = true;
    for (let i = 0; i < expressions.length; i++) {
      const expression = expressions[i];
      if (!(expression instanceof Literal)) {
        areAllLiteral = false;
        break;
      }
    }
    if (areAllLiteral) return new Literal(expressions.map((expr) => util.str(expr.val)).join(''));
    this.codegen.link('str');
    const params = expressions.map((expr) => `str(${expr})`);
    return new Expression(params.join(' + '));
  }

  protected onSubstr(expr: types.ExprSubstr): ExpressionResult {
    if (expr.length < 3 || expr.length > 4) throw new Error('"substr" operator expects two or three operands.');
    const str = this.onExpression(expr[1]);
    const from = this.onExpression(expr[2]);
    const length = expr[3] ? this.onExpression(expr[3]) : new Literal(0);
    if (str instanceof Literal && from instanceof Literal && length instanceof Literal)
      return new Literal(util.substr(str.val, from.val, length.val));
    this.codegen.link('substr');
    return new Expression(`substr(${str}, ${from}, ${length})`);
  }

  private linkedOperandDeps: Set<string> = new Set();
  private linkOperandDeps = (name: string, dependency: unknown): void => {
    if (this.linkedOperandDeps.has(name)) return;
    this.linkedOperandDeps.add(name);
    this.codegen.linkDependency(dependency, name);
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
      const [name,, arity,, codegen, impure] = def;
      util.assertArity(name, arity, expr);
      const operands = expr.slice(1).map((operand) => this.onExpression(operand));
      if (!impure) {
        const allLiterals = operands.every((expr) => expr instanceof Literal);
        if (allLiterals) {
          const result = this.evaluate(expr, {data: undefined})
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
      case '=':
      case 'get':
        return this.onGet(expr as types.ExprGet);
      case '?':
      case 'if':
        return this.onIf(expr as types.ExprIf);
      case 'type':
        return this.onType(expr as types.ExprType);
      case 'bool':
        return this.onBool(expr as types.ExprBool);
      case 'num':
        return this.onNum(expr as types.ExprNum);
      case 'int':
        return this.onInt(expr as types.ExprInt);
      case 'str':
        return this.onStr(expr as types.ExprStr);
      case 'starts':
        return this.onStarts(expr as types.ExprStarts);
      case 'contains':
        return this.onContains(expr as types.ExprContains);
      case 'ends':
        return this.onEnds(expr as types.ExprEnds);
      case 'matches':
        return this.onMatches(expr as types.ExprMatches);
      case 'defined':
        return this.onDefined(expr as types.ExprDefined);
      case 'in':
        return this.onIn(expr as types.ExprIn);
      case '.':
      case 'cat':
        return this.onCat(expr as types.ExprCat);
      case 'substr':
        return this.onSubstr(expr as types.ExprSubstr);
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
    return this.codegen.compile();
  }
}
