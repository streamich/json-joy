import type {Expr, ExprEquals, JsonExpressionCodegenContext, JsonExpressionExecutionContext} from './types';
import {Codegen} from '../util/codegen/Codegen';
import {deepEqual} from '../json-equal/deepEqual';
import {$$deepEqual} from '../json-equal/$$deepEqual';

const isExpression = (expr: unknown): expr is Expr => (expr instanceof Array) && (typeof expr[0] === 'string');
// const isLiteral = (expr: unknown): boolean => !isExpression(expr);

const linkable = {
  deepEqual,
};

export type JsonExpressionFn = (ctx: JsonExpressionExecutionContext) => unknown;

/**
 * Represents an expression {@link Expr} which was evaluated by codegen and
 * which value is already know at compilation time, hence it can be emitted
 * as a literal.
 */
class Literal {
  constructor (public val: unknown) {}

  public toString() {
    return JSON.stringify(this.val);
  }
}

/**
 * Represents an expression {@link Expr} which was evaluated by codegen and
 * which value is not yet known at compilation time, hence its value will
 * be evaluated at runtime.
 */
class Expression {
  constructor (public val: string) {}

  public toString() {
    return this.val;
  }
}

type ExpressionResult = Literal | Expression;

export interface JsonExpressionCodegenOptions extends JsonExpressionCodegenContext {
  expression: Expr;
}

export class JsonExpressionCodegen {
  protected codegen: Codegen<JsonExpressionFn>;

  protected linked: {[key: string]: 1} = {};

  public constructor(protected options: JsonExpressionCodegenOptions) {
    this.codegen = new Codegen<JsonExpressionFn>({
      epilogue: '',
    });
  }

  protected link(name: keyof typeof linkable): void {
    if (this.linked[name]) return;
    this.linked[name] = 1;
    this.codegen.linkDependency(linkable[name], name);
  }

  protected onEqualsLiteralLiteral(a: unknown, b: unknown): ExpressionResult {
    return new Literal(deepEqual(a, b));
  }

  protected onEqualsLiteralExpression(literal: unknown, expression: Expr): ExpressionResult {
    const expr = this.onExpression(expression);
    if (expr instanceof Literal) return new Literal(deepEqual(literal, expr.val));
    const fn = $$deepEqual(literal);
    const d = this.codegen.addConstant(fn);
    return new Expression(`${d}(${this.onExpression(expression)})`);
  }

  protected onEquals(expr: ExprEquals): ExpressionResult {
    const [, a, b] = expr;
    if (a === undefined || b === undefined)
      throw new Error('Equals operator expects two operands.');
    if (!isExpression(a) && !isExpression(b)) return this.onEqualsLiteralLiteral(a, b);
    if (isExpression(a)) return this.onEqualsLiteralExpression(b, a);
    if (isExpression(b)) return this.onEqualsLiteralExpression(a, b);
    this.link('deepEqual');
    return new Expression(`deepEqual(${this.onExpression(a as Expr)}, ${this.onExpression(b as Expr)})`);
  }

  protected onExpression(expr: Expr): ExpressionResult {
    const type = expr[0];
    switch(type) {
      case '==':
      case 'eq': return this.onEquals(expr as ExprEquals);
    }
    return new Literal(false);;
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
