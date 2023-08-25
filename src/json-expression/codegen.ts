import * as util from './util';
import {Codegen} from '../util/codegen/Codegen';
import {deepEqual} from '../json-equal/deepEqual';
import {$$deepEqual} from '../json-equal/$$deepEqual';
import {$$find} from '../json-pointer/codegen/find';
import {toPath, validateJsonPointer} from '../json-pointer';
import {ExprBetweenEqEq, ExprBetweenEqNe, ExprBetweenNeEq, ExprBetweenNeNe, evaluate} from '.';
import {emitStringMatch} from '../util/codegen/util/helpers';
import type * as types from './types';

const isExpression = (expr: unknown): expr is types.Expr => expr instanceof Array && typeof expr[0] === 'string';
const toBoxed = (value: unknown): unknown => (value instanceof Array ? [value] : value);

const linkable = {
  get: util.get,
  throwOnUndef: util.throwOnUndef,
  deepEqual,
  type: util.type,
  str: util.str,
  starts: util.starts,
  contains: util.contains,
  ends: util.ends,
  isInContainer: util.isInContainer,
  substr: util.substr,
  slash: util.slash,
  betweenNeNe: util.betweenNeNe,
  betweenEqNe: util.betweenEqNe,
  betweenNeEq: util.betweenNeEq,
  betweenEqEq: util.betweenEqEq,
};

export type JsonExpressionFn = (ctx: types.JsonExpressionExecutionContext) => unknown;

/**
 * Represents an expression {@link types.Expr} which was evaluated by codegen and
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
 * Represents an expression {@link types.Expr} which was evaluated by codegen and
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

export interface JsonExpressionCodegenOptions extends types.JsonExpressionCodegenContext {
  expression: types.Expr;
}

export class JsonExpressionCodegen {
  protected codegen: Codegen<JsonExpressionFn, typeof linkable>;

  public constructor(protected options: JsonExpressionCodegenOptions) {
    this.codegen = new Codegen<JsonExpressionFn, typeof linkable>({
      args: ['ctx'],
      prologue: 'var data = ctx.data;',
      epilogue: '',
      linkable,
    });
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

  protected onEqualsLiteralLiteral(a: Literal, b: Literal): ExpressionResult {
    return new Literal(deepEqual(a.val, b.val));
  }

  protected onEqualsLiteralExpression(literal: Literal, expression: Expression): ExpressionResult {
    const fn = $$deepEqual(literal.val);
    const d = this.codegen.addConstant(fn);
    return new Expression(`${d}(${expression})`);
  }

  protected onEquals(expr: types.ExprEquals): ExpressionResult {
    if (expr.length !== 3) throw new Error('"==" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return this.onEqualsLiteralLiteral(a, b);
    if (a instanceof Literal && b instanceof Expression) return this.onEqualsLiteralExpression(a, b);
    if (b instanceof Literal && a instanceof Expression) return this.onEqualsLiteralExpression(b, a);
    this.codegen.link('deepEqual');
    return new Expression(`deepEqual(${a}, ${b})`);
  }

  protected onNotEquals(expr: types.ExprNotEquals): ExpressionResult {
    if (expr.length !== 3) throw new Error('"!=" operator expects two operands.');
    const [, a, b] = expr;
    const res = this.onEquals(['eq', a, b]);
    if (res instanceof Literal) return new Literal(!res.val);
    return new Expression(`!(${res})`);
  }

  protected onNot(expr: types.ExprNot): ExpressionResult {
    if (expr.length > 2) throw new Error('"not" operator expects one operand.');
    const [, a] = expr;
    const res = this.onExpression(a);
    if (res instanceof Literal) return new Literal(!res.val);
    return new Expression(`!(${res})`);
  }

  protected onIf(expr: types.ExprIf): ExpressionResult {
    if (expr.length !== 4) throw new Error('"if" operator expects three operands.');
    const [, a, b, c] = expr;
    const condition = this.onExpression(a);
    if (condition instanceof Literal) return condition.val ? this.onExpression(b) : this.onExpression(c);
    return new Expression(`${condition} ? ${this.onExpression(b)} : ${this.onExpression(c)}`);
  }

  protected onAnd(expr: types.ExprAnd): ExpressionResult {
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

  protected onOr(expr: types.ExprOr): ExpressionResult {
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

  protected onLessThan(expr: types.ExprLessThan): ExpressionResult {
    if (expr.length !== 3) throw new Error('"<" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return new Literal(util.num(a.val) < util.num(b.val));
    return new Expression(`(+(${a})||0) < (+(${b})||0)`);
  }

  protected onLessThanOrEqual(expr: types.ExprLessThanOrEqual): ExpressionResult {
    if (expr.length !== 3) throw new Error('"<=" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return new Literal(util.num(a.val) <= util.num(b.val));
    return new Expression(`(+(${a})||0) <= (+(${b})||0)`);
  }

  protected onGreaterThan(expr: types.ExprGreaterThan): ExpressionResult {
    if (expr.length !== 3) throw new Error('">" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return new Literal(util.num(a.val) > util.num(b.val));
    return new Expression(`(+(${a})||0) > (+(${b})||0)`);
  }

  protected onGreaterThanOrEqual(expr: types.ExprGreaterThanOrEqual): ExpressionResult {
    if (expr.length !== 3) throw new Error('">=" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return new Literal(util.num(a.val) >= util.num(b.val));
    return new Expression(`(+(${a})||0) >= (+(${b})||0)`);
  }

  protected onBetweenNeNe(expr: ExprBetweenNeNe): ExpressionResult {
    if (expr.length !== 4) throw new Error('"><" operator expects three operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    const c = this.onExpression(expr[3]);
    if (a instanceof Literal && b instanceof Literal && c instanceof Literal)
      return new Literal(util.betweenNeNe(util.num(a.val), util.num(b.val), util.num(c.val)));
    this.codegen.link('betweenNeNe');
    return new Expression(`betweenNeNe((+(${a})||0), (+(${b})||0), (+(${c})||0))`);
  }

  protected onBetweenEqNe(expr: ExprBetweenEqNe): ExpressionResult {
    if (expr.length !== 4) throw new Error('"=><" operator expects three operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    const c = this.onExpression(expr[3]);
    if (a instanceof Literal && b instanceof Literal && c instanceof Literal)
      return new Literal(util.betweenEqNe(util.num(a.val), util.num(b.val), util.num(c.val)));
    this.codegen.link('betweenEqNe');
    return new Expression(`betweenEqNe((+(${a})||0), (+(${b})||0), (+(${c})||0))`);
  }

  protected onBetweenNeEq(expr: ExprBetweenNeEq): ExpressionResult {
    if (expr.length !== 4) throw new Error('"><=" operator expects three operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    const c = this.onExpression(expr[3]);
    if (a instanceof Literal && b instanceof Literal && c instanceof Literal)
      return new Literal(util.betweenNeEq(util.num(a.val), util.num(b.val), util.num(c.val)));
    this.codegen.link('betweenNeEq');
    return new Expression(`betweenNeEq((+(${a})||0), (+(${b})||0), (+(${c})||0))`);
  }

  protected onBetweenEqEq(expr: ExprBetweenEqEq): ExpressionResult {
    if (expr.length !== 4) throw new Error('"=><=" operator expects three operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    const c = this.onExpression(expr[3]);
    if (a instanceof Literal && b instanceof Literal && c instanceof Literal)
      return new Literal(util.betweenEqEq(util.num(a.val), util.num(b.val), util.num(c.val)));
    this.codegen.link('betweenEqEq');
    return new Expression(`betweenEqEq((+(${a})||0), (+(${b})||0), (+(${c})||0))`);
  }

  protected onMin(expr: types.ExprMin): ExpressionResult {
    if (expr.length < 3) throw new Error('"min" operator expects at least two operands.');
    const expressions = expr.slice(1).map((operand) => this.onExpression(operand));
    const allLiterals = expressions.every((expr) => expr instanceof Literal);
    if (allLiterals) return new Literal(util.num(Math.min(...expressions.map((expr) => expr.val as any))));
    const params = expressions.map((expr) => `${expr}`);
    return new Expression(`+Math.min(${params.join(', ')}) || 0`);
  }

  protected onMax(expr: types.ExprMax): ExpressionResult {
    if (expr.length < 3) throw new Error('"max" operator expects at least two operands.');
    const expressions = expr.slice(1).map((operand) => this.onExpression(operand));
    const allLiterals = expressions.every((expr) => expr instanceof Literal);
    if (allLiterals) return new Literal(util.num(Math.max(...expressions.map((expr) => expr.val as any))));
    const params = expressions.map((expr) => `${expr}`);
    return new Expression(`+Math.max(${params.join(', ')}) || 0`);
  }

  protected onPlus(expr: types.ExprPlus): ExpressionResult {
    if (expr.length < 3) throw new Error('"+" operator expects at least two operands.');
    const expressions = expr.slice(1).map((operand) => this.onExpression(operand));
    const allLiterals = expressions.every((expr) => expr instanceof Literal);
    if (allLiterals) return new Literal(expressions.reduce((a, b) => a + util.num(b.val), 0));
    const params = expressions.map((expr) => `(+(${expr})||0)`);
    return new Expression(`${params.join(' + ')}`);
  }

  protected onMinus(expr: types.ExprMinus): ExpressionResult {
    if (expr.length < 3) throw new Error('"-" operator expects at least two operands.');
    const expressions = expr.slice(1).map((operand) => this.onExpression(operand));
    const allLiterals = expressions.every((expr) => expr instanceof Literal);
    if (allLiterals) return new Literal(expressions.slice(1).reduce((a, b) => a - util.num(b.val), util.num(expressions[0].val)));
    const params = expressions.map((expr) => `(+(${expr})||0)`);
    return new Expression(`${params.join(' - ')}`);
  }

  protected onAsterisk(expr: types.ExprAsterisk): ExpressionResult {
    if (expr.length < 3) throw new Error('"*" operator expects at least two operands.');
    const expressions = expr.slice(1).map((operand) => this.onExpression(operand));
    const allLiterals = expressions.every((expr) => expr instanceof Literal);
    if (allLiterals) return new Literal(expressions.reduce((a, b) => a * util.num(b.val), 1));
    const params = expressions.map((expr) => `(+(${expr})||0)`);
    return new Expression(`${params.join(' * ')}`);
  }

  protected onSlash(expr: types.ExprSlash): ExpressionResult {
    if (expr.length < 3) throw new Error('"/" operator expects at least two operands.');
    const expressions = expr.slice(1).map((operand) => this.onExpression(operand));
    const allLiterals = expressions.every((expr) => expr instanceof Literal);
    if (allLiterals) return new Literal(evaluate(expr, {data: null}));
    const params = expressions.map((expr) => `(+(${expr})||0)`);
    let last: string = params[0];
    for (let i = 1; i < params.length; i++) last = `slash(${last}, ${params[i]})`;
    return new Expression(last);
  }

  protected onMod(expr: types.ExprMod): ExpressionResult {
    if (expr.length !== 3) throw new Error('"%" operator expects two operands.');
    const a = this.onExpression(expr[1]);
    const b = this.onExpression(expr[2]);
    if (a instanceof Literal && b instanceof Literal) return new Literal(util.num((a.val as any) % (b.val as any)));
    return new Expression(`+(${a} % ${b}) || 0`);
  }

  protected onRound(expr: types.ExprRound): ExpressionResult {
    if (expr.length !== 2) throw new Error('"round" operator expects one operand.');
    const a = this.onExpression(expr[1]);
    if (a instanceof Literal) return new Literal(Math.round(util.num(a.val)));
    return new Expression(`Math.round(+(${a}) || 0)`);
  }

  protected onCeil(expr: types.ExprCeil): ExpressionResult {
    if (expr.length !== 2) throw new Error('"ceil" operator expects one operand.');
    const a = this.onExpression(expr[1]);
    if (a instanceof Literal) return new Literal(Math.ceil(util.num(a.val)));
    return new Expression(`Math.ceil(+(${a}) || 0)`);
  }

  protected onFloor(expr: types.ExprFloor): ExpressionResult {
    if (expr.length !== 2) throw new Error('"floor" operator expects one operand.');
    const a = this.onExpression(expr[1]);
    if (a instanceof Literal) return new Literal(Math.floor(util.num(a.val)));
    return new Expression(`Math.floor(+(${a}) || 0)`);
  }

  protected onExpression(expr: types.Expr | unknown): ExpressionResult {
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
        return this.onGet(expr as types.ExprGet);
      case '==':
      case 'eq':
        return this.onEquals(expr as types.ExprEquals);
      case '!=':
      case 'ne':
        return this.onNotEquals(expr as types.ExprNotEquals);
      case '?':
      case 'if':
        return this.onIf(expr as types.ExprIf);
      case '&&':
      case 'and':
        return this.onAnd(expr as types.ExprAnd);
      case '||':
      case 'or':
        return this.onOr(expr as types.ExprOr);
      case '!':
      case 'not':
        return this.onNot(expr as types.ExprNot);
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
      case '<':
        return this.onLessThan(expr as types.ExprLessThan);
      case '<=':
        return this.onLessThanOrEqual(expr as types.ExprLessThanOrEqual);
      case '>':
        return this.onGreaterThan(expr as types.ExprGreaterThan);
      case '>=':
        return this.onGreaterThanOrEqual(expr as types.ExprGreaterThanOrEqual);
      case '><':
        return this.onBetweenNeNe(expr as ExprBetweenNeNe);
      case '=><':
        return this.onBetweenEqNe(expr as ExprBetweenEqNe);
      case '><=':
        return this.onBetweenNeEq(expr as ExprBetweenNeEq);
      case '=><=':
        return this.onBetweenEqEq(expr as ExprBetweenEqEq);
      case 'min':
        return this.onMin(expr as types.ExprMin);
      case 'max':
        return this.onMax(expr as types.ExprMax);
      case '+':
      case 'add':
        return this.onPlus(expr as types.ExprPlus);
      case '-':
      case 'subtract':
        return this.onMinus(expr as types.ExprMinus);
      case '*':
      case 'multiply':
        return this.onAsterisk(expr as types.ExprAsterisk);
      case '/':
      case 'divide':
        return this.onSlash(expr as types.ExprSlash);
      case '%':
      case 'mod':
        return this.onMod(expr as types.ExprMod);
      case 'round':
        return this.onRound(expr as types.ExprRound);
      case 'ceil':
        return this.onCeil(expr as types.ExprCeil);
      case 'floor':
        return this.onFloor(expr as types.ExprFloor);
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
