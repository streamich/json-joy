import type {Expr, ExprAnd, ExprBool, ExprEquals, ExprGet, ExprIf, ExprInt, ExprNot, ExprNotEquals, ExprNum, ExprOr, ExprType, JsonExpressionCodegenContext, JsonExpressionExecutionContext} from './types';
import {Codegen} from '../util/codegen/Codegen';
import {deepEqual} from '../json-equal/deepEqual';
import {toPath, get as get_} from '../json-pointer';
import {$$deepEqual} from '../json-equal/$$deepEqual';
import {$$find} from '../json-pointer/codegen/find';
import {parseJsonPointer, validateJsonPointer} from '../json-pointer';

const isExpression = (expr: unknown): expr is Expr => (expr instanceof Array) && (typeof expr[0] === 'string');
// const isLiteral = (expr: unknown): boolean => !isExpression(expr);

const get = (path: string, data: unknown) => get_(data, toPath(path));

const type = (value: unknown): string => {
  if (value === null) return 'null';
  if (value instanceof Array) return 'array'
  return typeof value;
};

const linkable = {
  get,
  deepEqual,
  type,
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
  protected codegen: Codegen<JsonExpressionFn, typeof linkable>;

  public constructor(protected options: JsonExpressionCodegenOptions) {
    this.codegen = new Codegen<JsonExpressionFn, typeof linkable>({
      arguments: 'ctx',
      prologue: 'var data = ctx.data;',
      epilogue: '',
      linkable,
    });
  }

  protected onGet(expr: ExprGet): ExpressionResult {
    const path = this.onExpression(expr[1]);
    if (path instanceof Literal) {
      if (typeof path.val !== 'string') throw new Error('Invalid JSON pointer.');
      validateJsonPointer(path.val);
      const fn = $$find(parseJsonPointer(path.val));
      const d = this.codegen.addConstant(fn);
      return new Expression(`${d}(data)`);
    } else {
      this.codegen.link('get');
      return new Expression(`get(${path}, data)`);
    }
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
    this.codegen.link('deepEqual');
    return new Expression(`deepEqual(${this.onExpression(a as Expr)}, ${this.onExpression(b as Expr)})`);
  }

  protected onNotEquals([, a, b]: ExprNotEquals): ExpressionResult {
    const res = this.onEquals(['eq', a, b]);
    if (res instanceof Literal) return new Literal(!res.val);
    return new Expression(`!(${res})`);
  }

  protected onNot([, a]: ExprNot): ExpressionResult {
    const res = this.onExpression(a);
    if (res instanceof Literal) return new Literal(!res.val);
    return new Expression(`!(${res})`);
  }

  protected onIf([, a, b, c]: ExprIf): ExpressionResult {
    const condition = this.onExpression(a);
    if (condition instanceof Literal)
      return condition.val ? this.onExpression(b) : this.onExpression(c);
    return new Expression(`${condition} ? ${this.onExpression(b)} : ${this.onExpression(c)}`);
  }

  protected onAnd([, ...operands]: ExprAnd): ExpressionResult {
    const expressions: ExpressionResult[] = [];
    let allLiteral = true;
    for (let i = 0; i < operands.length; i++) {
      const expression = this.onExpression(operands[i]);
      if (!(expression instanceof Literal)) allLiteral = false;
      expressions.push(expression);
    }
    if (allLiteral) {
      for (let i = 0; i < expressions.length; i++) {
        const expression = expressions[i];
        if (!expression.val) return new Literal(false);
      }
      return new Literal(true);
    }
    return new Expression(expressions.map(expr => `!!(${expr})`).join(' && '));
  }

  protected onOr([, ...operands]: ExprOr): ExpressionResult {
    const expressions: ExpressionResult[] = [];
    let allLiteral = true;
    for (let i = 0; i < operands.length; i++) {
      const expression = this.onExpression(operands[i]);
      if (!(expression instanceof Literal)) allLiteral = false;
      expressions.push(expression);
    }
    if (allLiteral) {
      for (let i = 0; i < expressions.length; i++) {
        const expression = expressions[i];
        if (expression.val) return new Literal(true);
      }
      return new Literal(false);
    }
    return new Expression(expressions.map(expr => `!!(${expr})`).join(' || '));
  }

  protected onType([, operand]: ExprType): ExpressionResult {
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(type(expression.val));
    this.codegen.link('type');
    return new Expression(`type(${expression})`);
  }

  protected onBool([, operand]: ExprBool): ExpressionResult {
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(!!expression.val);
    return new Expression(`!!(${expression})`);
  }

  protected onNum([, operand]: ExprNum): ExpressionResult {
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(+(expression.val as number) || 0);
    return new Expression(`+(${expression}) || 0`);
  }

  protected onInt([, operand]: ExprInt): ExpressionResult {
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(~~(expression.val as number));
    return new Expression(`+(${expression})`);
  }

  protected onExpression(expr: Expr | unknown): ExpressionResult {
    if (!isExpression(expr)) {
      if (expr instanceof Array) {
        if (expr.length !== 1 || !(expr[0] instanceof Array))
          throw new Error('Expected array literal to be boxed as single array element.');
        return new Literal(expr[0]);
      } else return new Literal(expr);
    }
    switch(expr[0]) {
      case '=':
      case 'get': return this.onGet(expr as ExprGet);
      case '==':
      case 'eq': return this.onEquals(expr as ExprEquals);
      case '!=':
      case 'ne': return this.onNotEquals(expr as ExprNotEquals);
      case '?':
      case 'if': return this.onIf(expr as ExprIf);
      case '&&':
      case 'and': return this.onAnd(expr as ExprAnd);
      case '||':
      case 'or': return this.onOr(expr as ExprOr);
      case '!':
      case 'not': return this.onNot(expr as ExprNot);
      case 'type': return this.onType(expr as ExprType);
      case 'bool': return this.onBool(expr as ExprBool);
      case 'num': return this.onNum(expr as ExprNum);
      case 'int': return this.onInt(expr as ExprInt);
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
