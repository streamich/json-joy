import type {
  Expr,
  ExprAnd,
  ExprAsterisk,
  ExprBool,
  ExprCat,
  ExprCeil,
  ExprContains,
  ExprDefined,
  ExprEnds,
  ExprEquals,
  ExprFloor,
  ExprGet,
  ExprGreaterThan,
  ExprGreaterThanOrEqual,
  ExprIf,
  ExprIn,
  ExprInt,
  ExprLessThan,
  ExprLessThanOrEqual,
  ExprMatches,
  ExprMax,
  ExprMin,
  ExprMinus,
  ExprMod,
  ExprNot,
  ExprNotEquals,
  ExprNum,
  ExprOr,
  ExprPlus,
  ExprRound,
  ExprSlash,
  ExprStarts,
  ExprStr,
  ExprSubstr,
  ExprType,
  JsonExpressionCodegenContext,
  JsonExpressionExecutionContext,
} from './types';
import {Codegen} from '../util/codegen/Codegen';
import {deepEqual} from '../json-equal/deepEqual';
import {$$deepEqual} from '../json-equal/$$deepEqual';
import {$$find} from '../json-pointer/codegen/find';
import {toPath, validateJsonPointer} from '../json-pointer';
import {
  get,
  throwOnUndef,
  str,
  type,
  starts,
  contains,
  ends,
  isInContainer,
  substr,
  num,
  slash,
  isLiteral,
  betweenNeNe,
  betweenEqNe,
  betweenNeEq,
  betweenEqEq,
} from './util';
import {ExprBetweenEqEq, ExprBetweenEqNe, ExprBetweenNeEq, ExprBetweenNeNe} from '.';

const isExpression = (expr: unknown): expr is Expr => expr instanceof Array && typeof expr[0] === 'string';
const toBoxed = (value: unknown): unknown => (value instanceof Array ? [value] : value);

const linkable = {
  get,
  throwOnUndef,
  deepEqual,
  type,
  str,
  starts,
  contains,
  ends,
  isInContainer,
  substr,
  slash,
  betweenNeNe,
  betweenEqNe,
  betweenNeEq,
  betweenEqEq,
};

export type JsonExpressionFn = (ctx: JsonExpressionExecutionContext) => unknown;

/**
 * Represents an expression {@link Expr} which was evaluated by codegen and
 * which value is already know at compilation time, hence it can be emitted
 * as a literal.
 */
class Literal {
  constructor(public val: unknown) {}

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
  constructor(public val: string) {}

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
    if (expr.length < 2 || expr.length > 3) throw new Error('"get" operator expects two or three operands.');
    const path = this.onExpression(expr[1]);
    const def = expr[2] === undefined ? undefined : this.onExpression(expr[2]);
    if (def !== undefined && !isLiteral(expr[2]))
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

  protected onEqualsLiteralLiteral(a: Literal, b: Literal): ExpressionResult {
    return new Literal(deepEqual(a.val, b.val));
  }

  protected onEqualsLiteralExpression(literal: Literal, expression: Expression): ExpressionResult {
    const fn = $$deepEqual(literal.val);
    const d = this.codegen.addConstant(fn);
    return new Expression(`${d}(${expression})`);
  }

  protected onEquals(expr: ExprEquals): ExpressionResult {
    if (expr.length !== 3) throw new Error('"==" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return this.onEqualsLiteralLiteral(a, b);
    if (a instanceof Literal && b instanceof Expression) return this.onEqualsLiteralExpression(a, b);
    if (b instanceof Literal && a instanceof Expression) return this.onEqualsLiteralExpression(b, a);
    this.codegen.link('deepEqual');
    return new Expression(`deepEqual(${a}, ${b})`);
  }

  protected onNotEquals(expr: ExprNotEquals): ExpressionResult {
    if (expr.length !== 3) throw new Error('"!=" operator expects two operands.');
    const [, a, b] = expr;
    const res = this.onEquals(['eq', a, b]);
    if (res instanceof Literal) return new Literal(!res.val);
    return new Expression(`!(${res})`);
  }

  protected onNot(expr: ExprNot): ExpressionResult {
    if (expr.length > 2) throw new Error('"not" operator expects one operand.');
    const [, a] = expr;
    const res = this.onExpression(a);
    if (res instanceof Literal) return new Literal(!res.val);
    return new Expression(`!(${res})`);
  }

  protected onIf(expr: ExprIf): ExpressionResult {
    if (expr.length !== 4) throw new Error('"if" operator expects three operands.');
    const [, a, b, c] = expr;
    const condition = this.onExpression(a);
    if (condition instanceof Literal) return condition.val ? this.onExpression(b) : this.onExpression(c);
    return new Expression(`${condition} ? ${this.onExpression(b)} : ${this.onExpression(c)}`);
  }

  protected onAnd(expr: ExprAnd): ExpressionResult {
    if (expr.length <= 2) throw new Error('"and" operator expects at least two operands.');
    const [, ...operands] = expr;
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
    return new Expression(expressions.map((expr) => `!!(${expr})`).join(' && '));
  }

  protected onOr(expr: ExprOr): ExpressionResult {
    if (expr.length <= 2) throw new Error('"or" operator expects at least two operands.');
    const [, ...operands] = expr;
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
    return new Expression(expressions.map((expr) => `!!(${expr})`).join(' || '));
  }

  protected onType(expr: ExprType): ExpressionResult {
    if (expr.length !== 2) throw new Error('"type" operator expects one operand.');
    const [, operand] = expr;
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(type(expression.val));
    this.codegen.link('type');
    return new Expression(`type(${expression})`);
  }

  protected onBool(expr: ExprBool): ExpressionResult {
    if (expr.length !== 2) throw new Error('"bool" operator expects one operand.');
    const [, operand] = expr;
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(!!expression.val);
    return new Expression(`!!(${expression})`);
  }

  protected onNum(expr: ExprNum): ExpressionResult {
    if (expr.length !== 2) throw new Error('"num" operator expects one operand.');
    const [, operand] = expr;
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(+(expression.val as number) || 0);
    return new Expression(`+(${expression}) || 0`);
  }

  protected onInt(expr: ExprInt): ExpressionResult {
    if (expr.length !== 2) throw new Error('"int" operator expects one operand.');
    const [, operand] = expr;
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(~~(expression.val as number));
    return new Expression(`+(${expression})`);
  }

  protected onStr(expr: ExprStr): ExpressionResult {
    if (expr.length !== 2) throw new Error('"str" operator expects one operand.');
    const [, operand] = expr;
    const expression = this.onExpression(operand);
    if (expression instanceof Literal) return new Literal(str(expression.val));
    this.codegen.link('str');
    return new Expression(`str(${expression})`);
  }

  protected onStarts(expr: ExprStarts): ExpressionResult {
    if (expr.length !== 3) throw new Error('"starts" operator expects two operands.');
    const [, a, b] = expr;
    const outer = this.onExpression(a);
    const inner = this.onExpression(b);
    if (outer instanceof Literal && inner instanceof Literal) return new Literal(starts(outer.val, inner.val));
    this.codegen.link('starts');
    return new Expression(`starts(${outer}, ${inner})`);
  }

  protected onContains(expr: ExprContains): ExpressionResult {
    if (expr.length !== 3) throw new Error('"contains" operator expects two operands.');
    const [, a, b] = expr;
    const outer = this.onExpression(a);
    const inner = this.onExpression(b);
    if (outer instanceof Literal && inner instanceof Literal) return new Literal(contains(outer.val, inner.val));
    this.codegen.link('contains');
    return new Expression(`contains(${outer}, ${inner})`);
  }

  protected onEnds(expr: ExprEnds): ExpressionResult {
    if (expr.length !== 3) throw new Error('"ends" operator expects two operands.');
    const [, a, b] = expr;
    const outer = this.onExpression(a);
    const inner = this.onExpression(b);
    if (outer instanceof Literal && inner instanceof Literal) return new Literal(ends(outer.val, inner.val));
    this.codegen.link('ends');
    return new Expression(`ends(${outer}, ${inner})`);
  }

  protected onMatches(expr: ExprMatches): ExpressionResult {
    if (expr.length !== 3) throw new Error('"matches" operator expects two operands.');
    const [, a, pattern] = expr;
    if (typeof pattern !== 'string')
      throw new Error('"matches" second argument should be a regular expression string.');
    const subject = this.onExpression(a);
    if (!this.options.createPattern)
      throw new Error('"matches" operator requires ".createPattern()" option to be implemented.');
    const fn = this.options.createPattern(pattern);
    if (subject instanceof Literal) return new Literal(fn(str(subject.val)));
    const d = this.codegen.linkDependency(fn);
    this.codegen.link('str');
    return new Expression(`${d}(str(${subject}))`);
  }

  protected onDefined(expr: ExprDefined): ExpressionResult {
    if (expr.length > 2) throw new Error('"defined" operator expects one operand.');
    const [, pointer] = expr;
    if (typeof pointer !== 'string') throw new Error('Invalid JSON pointer.');
    validateJsonPointer(pointer);
    const fn = $$find(toPath(pointer));
    const d = this.codegen.addConstant(fn);
    return new Expression(`${d}(data) !== undefined`);
  }

  protected onIn(expr: ExprIn): ExpressionResult {
    if (expr.length > 3) throw new Error('"in" operator expects two operands.');
    const [, a, b] = expr;
    const container = this.onExpression(b);
    const what = this.onExpression(a);
    if (container instanceof Literal) {
      if (!(container.val instanceof Array)) throw new Error('"in" operator expects second operand to be an array.');
      if (what instanceof Literal) return new Literal(isInContainer(what.val, container.val));
      if (container.val.length === 0) return new Literal(false);
      if (container.val.length === 1) return this.onExpression(['==', a, toBoxed(container.val[0])]);
    }
    this.codegen.link('isInContainer');
    return new Expression(`isInContainer(${what}, ${container})`);
  }

  protected onCat(expr: ExprCat): ExpressionResult {
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
    if (areAllLiteral) return new Literal(expressions.map((expr) => str(expr.val)).join(''));
    this.codegen.link('str');
    const params = expressions.map((expr) => `str(${expr})`);
    return new Expression(params.join(' + '));
  }

  protected onSubstr(expr: ExprSubstr): ExpressionResult {
    if (expr.length < 3 || expr.length > 4) throw new Error('"substr" operator expects two or three operands.');
    const str = this.onExpression(expr[1]);
    const from = this.onExpression(expr[2]);
    const length = expr[3] ? this.onExpression(expr[3]) : new Literal(0);
    if (str instanceof Literal && from instanceof Literal && length instanceof Literal)
      return new Literal(substr(str.val, from.val, length.val));
    this.codegen.link('substr');
    return new Expression(`substr(${str}, ${from}, ${length})`);
  }

  protected onLessThan(expr: ExprLessThan): ExpressionResult {
    if (expr.length !== 3) throw new Error('"<" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return new Literal(num(a.val) < num(b.val));
    return new Expression(`(+(${a})||0) < (+(${b})||0)`);
  }

  protected onLessThanOrEqual(expr: ExprLessThanOrEqual): ExpressionResult {
    if (expr.length !== 3) throw new Error('"<=" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return new Literal(num(a.val) <= num(b.val));
    return new Expression(`(+(${a})||0) <= (+(${b})||0)`);
  }

  protected onGreaterThan(expr: ExprGreaterThan): ExpressionResult {
    if (expr.length !== 3) throw new Error('">" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return new Literal(num(a.val) > num(b.val));
    return new Expression(`(+(${a})||0) > (+(${b})||0)`);
  }

  protected onGreaterThanOrEqual(expr: ExprGreaterThanOrEqual): ExpressionResult {
    if (expr.length !== 3) throw new Error('">=" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return new Literal(num(a.val) >= num(b.val));
    return new Expression(`(+(${a})||0) >= (+(${b})||0)`);
  }

  protected onBetweenNeNe(expr: ExprBetweenNeNe): ExpressionResult {
    if (expr.length !== 4) throw new Error('"><" operator expects three operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    const c = this.onExpression(expr[3]);
    if (a instanceof Literal && b instanceof Literal && c instanceof Literal)
      return new Literal(betweenNeNe(num(a.val), num(b.val), num(c.val)));
    this.codegen.link('betweenNeNe');
    return new Expression(`betweenNeNe((+(${a})||0), (+(${b})||0), (+(${c})||0))`);
  }

  protected onBetweenEqNe(expr: ExprBetweenEqNe): ExpressionResult {
    if (expr.length !== 4) throw new Error('"=><" operator expects three operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    const c = this.onExpression(expr[3]);
    if (a instanceof Literal && b instanceof Literal && c instanceof Literal)
      return new Literal(betweenEqNe(num(a.val), num(b.val), num(c.val)));
    this.codegen.link('betweenEqNe');
    return new Expression(`betweenEqNe((+(${a})||0), (+(${b})||0), (+(${c})||0))`);
  }

  protected onBetweenNeEq(expr: ExprBetweenNeEq): ExpressionResult {
    if (expr.length !== 4) throw new Error('"><=" operator expects three operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    const c = this.onExpression(expr[3]);
    if (a instanceof Literal && b instanceof Literal && c instanceof Literal)
      return new Literal(betweenNeEq(num(a.val), num(b.val), num(c.val)));
    this.codegen.link('betweenNeEq');
    return new Expression(`betweenNeEq((+(${a})||0), (+(${b})||0), (+(${c})||0))`);
  }

  protected onBetweenEqEq(expr: ExprBetweenEqEq): ExpressionResult {
    if (expr.length !== 4) throw new Error('"=><=" operator expects three operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    const c = this.onExpression(expr[3]);
    if (a instanceof Literal && b instanceof Literal && c instanceof Literal)
      return new Literal(betweenEqEq(num(a.val), num(b.val), num(c.val)));
    this.codegen.link('betweenEqEq');
    return new Expression(`betweenEqEq((+(${a})||0), (+(${b})||0), (+(${c})||0))`);
  }

  protected onMin(expr: ExprMin): ExpressionResult {
    if (expr.length < 3) throw new Error('"min" operator expects at least two operands.');
    const expressions = expr.slice(1).map((operand) => this.onExpression(operand));
    const allLiterals = expressions.every((expr) => expr instanceof Literal);
    if (allLiterals) return new Literal(num(Math.min(...expressions.map((expr) => expr.val as any))));
    const params = expressions.map((expr) => `${expr}`);
    return new Expression(`+Math.min(${params.join(', ')}) || 0`);
  }

  protected onMax(expr: ExprMax): ExpressionResult {
    if (expr.length < 3) throw new Error('"max" operator expects at least two operands.');
    const expressions = expr.slice(1).map((operand) => this.onExpression(operand));
    const allLiterals = expressions.every((expr) => expr instanceof Literal);
    if (allLiterals) return new Literal(num(Math.max(...expressions.map((expr) => expr.val as any))));
    const params = expressions.map((expr) => `${expr}`);
    return new Expression(`+Math.max(${params.join(', ')}) || 0`);
  }

  protected onPlus(expr: ExprPlus): ExpressionResult {
    if (expr.length < 3) throw new Error('"+" operator expects at least two operands.');
    const expressions = expr.slice(1).map((operand) => this.onExpression(operand));
    const allLiterals = expressions.every((expr) => expr instanceof Literal);
    if (allLiterals) return new Literal(expressions.reduce((a, b) => a + num(b.val), 0));
    const params = expressions.map((expr) => `(+(${expr})||0)`);
    return new Expression(`${params.join(' + ')}`);
  }

  protected onMinus(expr: ExprMinus): ExpressionResult {
    if (expr.length < 3) throw new Error('"-" operator expects at least two operands.');
    const expressions = expr.slice(1).map((operand) => this.onExpression(operand));
    const allLiterals = expressions.every((expr) => expr instanceof Literal);
    if (allLiterals) return new Literal(expressions.slice(1).reduce((a, b) => a - num(b.val), num(expressions[0].val)));
    const params = expressions.map((expr) => `(+(${expr})||0)`);
    return new Expression(`${params.join(' - ')}`);
  }

  protected onAsterisk(expr: ExprAsterisk): ExpressionResult {
    if (expr.length < 3) throw new Error('"*" operator expects at least two operands.');
    const expressions = expr.slice(1).map((operand) => this.onExpression(operand));
    const allLiterals = expressions.every((expr) => expr instanceof Literal);
    if (allLiterals) return new Literal(expressions.reduce((a, b) => a * num(b.val), 1));
    const params = expressions.map((expr) => `(+(${expr})||0)`);
    return new Expression(`${params.join(' * ')}`);
  }

  protected onSlash(expr: ExprSlash): ExpressionResult {
    if (expr.length !== 3) throw new Error('"/" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return new Literal(slash(a.val, b.val));
    this.codegen.link('slash');
    return new Expression(`slash(${a}, ${b})`);
  }

  protected onMod(expr: ExprMod): ExpressionResult {
    if (expr.length !== 3) throw new Error('"%" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return new Literal(num((a.val as any) % (b.val as any)));
    return new Expression(`+(${a} % ${b}) || 0`);
  }

  protected onRound(expr: ExprRound): ExpressionResult {
    if (expr.length !== 2) throw new Error('"round" operator expects one operand.');
    const a = this.onExpression(expr[1]);
    if (a instanceof Literal) return new Literal(Math.round(num(a.val)));
    return new Expression(`Math.round(+(${a}) || 0)`);
  }

  protected onCeil(expr: ExprCeil): ExpressionResult {
    if (expr.length !== 2) throw new Error('"ceil" operator expects one operand.');
    const a = this.onExpression(expr[1]);
    if (a instanceof Literal) return new Literal(Math.ceil(num(a.val)));
    return new Expression(`Math.ceil(+(${a}) || 0)`);
  }

  protected onFloor(expr: ExprFloor): ExpressionResult {
    if (expr.length !== 2) throw new Error('"floor" operator expects one operand.');
    const a = this.onExpression(expr[1]);
    if (a instanceof Literal) return new Literal(Math.floor(num(a.val)));
    return new Expression(`Math.floor(+(${a}) || 0)`);
  }

  protected onExpression(expr: Expr | unknown): ExpressionResult {
    if (!isExpression(expr)) {
      if (expr instanceof Array) {
        if (expr.length !== 1 || !(expr[0] instanceof Array))
          throw new Error('Expected array literal to be boxed as single array element.');
        return new Literal(expr[0]);
      } else return new Literal(expr);
    }
    switch (expr[0]) {
      case '=':
      case 'get':
        return this.onGet(expr as ExprGet);
      case '==':
      case 'eq':
        return this.onEquals(expr as ExprEquals);
      case '!=':
      case 'ne':
        return this.onNotEquals(expr as ExprNotEquals);
      case '?':
      case 'if':
        return this.onIf(expr as ExprIf);
      case '&&':
      case 'and':
        return this.onAnd(expr as ExprAnd);
      case '||':
      case 'or':
        return this.onOr(expr as ExprOr);
      case '!':
      case 'not':
        return this.onNot(expr as ExprNot);
      case 'type':
        return this.onType(expr as ExprType);
      case 'bool':
        return this.onBool(expr as ExprBool);
      case 'num':
        return this.onNum(expr as ExprNum);
      case 'int':
        return this.onInt(expr as ExprInt);
      case 'str':
        return this.onStr(expr as ExprStr);
      case 'starts':
        return this.onStarts(expr as ExprStarts);
      case 'contains':
        return this.onContains(expr as ExprContains);
      case 'ends':
        return this.onEnds(expr as ExprEnds);
      case 'matches':
        return this.onMatches(expr as ExprMatches);
      case 'defined':
        return this.onDefined(expr as ExprDefined);
      case 'in':
        return this.onIn(expr as ExprIn);
      case '.':
      case 'cat':
        return this.onCat(expr as ExprCat);
      case 'substr':
        return this.onSubstr(expr as ExprSubstr);
      case '<':
        return this.onLessThan(expr as ExprLessThan);
      case '<=':
        return this.onLessThanOrEqual(expr as ExprLessThanOrEqual);
      case '>':
        return this.onGreaterThan(expr as ExprGreaterThan);
      case '>=':
        return this.onGreaterThanOrEqual(expr as ExprGreaterThanOrEqual);
      case '><':
        return this.onBetweenNeNe(expr as ExprBetweenNeNe);
      case '=><':
        return this.onBetweenEqNe(expr as ExprBetweenEqNe);
      case '><=':
        return this.onBetweenNeEq(expr as ExprBetweenNeEq);
      case '=><=':
        return this.onBetweenEqEq(expr as ExprBetweenEqEq);
      case 'min':
        return this.onMin(expr as ExprMin);
      case 'max':
        return this.onMax(expr as ExprMax);
      case '+':
        return this.onPlus(expr as ExprPlus);
      case '-':
        return this.onMinus(expr as ExprMinus);
      case '*':
        return this.onAsterisk(expr as ExprAsterisk);
      case '/':
        return this.onSlash(expr as ExprSlash);
      case '%':
      case 'mod':
        return this.onMod(expr as ExprMod);
      case 'round':
        return this.onRound(expr as ExprRound);
      case 'ceil':
        return this.onCeil(expr as ExprCeil);
      case 'floor':
        return this.onFloor(expr as ExprFloor);
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
