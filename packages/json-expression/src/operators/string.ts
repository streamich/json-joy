import {Expression, type ExpressionResult, Literal} from '../codegen-steps';
import * as util from '../util';
import type * as types from '../types';

const binaryOperands = (
  expr: types.BinaryExpression<any>,
  ctx: types.OperatorEvalCtx,
): [left: unknown, right: unknown] => {
  const left = ctx.eval(expr[1], ctx);
  const right = ctx.eval(expr[2], ctx);
  return [left, right];
};

const createValidationOperator = <E extends types.Expr>(name: string, validate: (value: unknown) => boolean) => {
  return [
    name + '?',
    [],
    1,
    (expr: E, ctx) => {
      const email = ctx.eval(expr[1], ctx);
      return validate(email);
    },
    (ctx: types.OperatorCodegenCtx<E>): ExpressionResult => {
      ctx.link(validate, 'is_' + name);
      return new Expression(`is_${name}(${ctx.operands[0]})`);
    },
  ] as types.OperatorDefinition<E>;
};

export const stringOperators: types.OperatorDefinition<any>[] = [
  [
    '.',
    ['cat'],
    -1,
    (expr: types.ExprCat, ctx) => {
      return expr.slice(1).reduce((acc, e) => acc + util.str(ctx.eval(e, ctx)), '');
    },
    (ctx: types.OperatorCodegenCtx<types.ExprCat>): ExpressionResult => {
      ctx.link(util.str, 'str');
      const parts: string[] = [];
      for (const operand of ctx.operands) {
        if (operand instanceof Literal) {
          parts.push(JSON.stringify(util.str(operand.val)));
        } else if (operand instanceof Expression) {
          parts.push(`str(${operand})`);
        }
      }
      return new Expression(parts.join('+'));
    },
  ] as types.OperatorDefinition<types.ExprCat>,

  [
    'contains',
    [],
    2,
    (expr: types.ExprContains, ctx) => {
      const [outer, inner] = binaryOperands(expr, ctx);
      return util.contains(outer, inner);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprContains>): ExpressionResult => {
      ctx.link(util.contains, 'contains');
      const js = `contains(${ctx.operands[0]},${ctx.operands[1]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprContains>,

  [
    'starts',
    [],
    2,
    (expr: types.ExprStarts, ctx) => {
      const [outer, inner] = binaryOperands(expr, ctx);
      return util.starts(outer, inner);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprStarts>): ExpressionResult => {
      ctx.link(util.starts, 'starts');
      const js = `starts(${ctx.operands[0]},${ctx.operands[1]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprStarts>,

  [
    'ends',
    [],
    2,
    (expr: types.ExprEnds, ctx) => {
      const [outer, inner] = binaryOperands(expr, ctx);
      return util.ends(outer, inner);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprEnds>): ExpressionResult => {
      ctx.link(util.ends, 'ends');
      const js = `ends(${ctx.operands[0]},${ctx.operands[1]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprEnds>,

  [
    'substr',
    [],
    3,
    (expr: types.ExprSubstr, ctx) => {
      const str = ctx.eval(expr[1], ctx);
      const start = ctx.eval(expr[2], ctx);
      const end = ctx.eval(expr[3], ctx);
      return util.substr(str, start, end);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprSubstr>): ExpressionResult => {
      ctx.link(util.substr, 'substr');
      const js = `substr(${ctx.operands[0]},${ctx.operands[1]},${ctx.operands[2]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprSubstr>,

  [
    'matches',
    [],
    2,
    (expr: types.ExprEnds, ctx) => {
      let pattern = expr[2];
      if (pattern instanceof Array && pattern.length === 1) pattern = pattern[0];
      if (typeof pattern !== 'string')
        throw new Error('"matches" second argument should be a regular expression string.');
      if (!ctx.createPattern)
        throw new Error('"matches" operator requires ".createPattern()" option to be implemented.');
      const fn = ctx.createPattern(pattern);
      const outer = ctx.eval(expr[1], ctx);
      return fn(util.str(outer));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprEnds>): ExpressionResult => {
      const pattern = ctx.operands[1];
      if (!(pattern instanceof Literal) || typeof pattern.val !== 'string')
        throw new Error('"matches" second argument should be a regular expression string.');
      if (!ctx.createPattern)
        throw new Error('"matches" operator requires ".createPattern()" option to be implemented.');
      const fn = ctx.createPattern(pattern.val);
      const d = ctx.link(fn);
      ctx.link(util.str, 'str');
      const subject = ctx.operands[0];
      return new Expression(`${d}(str(${subject}))`);
    },
  ] as types.OperatorDefinition<types.ExprEnds>,

  createValidationOperator<types.ExprIsEmail>('email', util.isEmail),
  createValidationOperator<types.ExprIsHostname>('hostname', util.isHostname),
  createValidationOperator<types.ExprIsIp4>('ip4', util.isIp4),
  createValidationOperator<types.ExprIsIp6>('ip6', util.isIp6),
  createValidationOperator<types.ExprIsUuid>('uuid', util.isUuid),
  createValidationOperator<types.ExprIsUri>('uri', util.isUri),
  createValidationOperator<types.ExprIsDuration>('duration', util.isDuration),
  createValidationOperator<types.ExprIsDate>('date', util.isDate),
  createValidationOperator<types.ExprIsTime>('time', util.isTime),
  createValidationOperator<types.ExprIsDateTime>('dateTime', util.isDateTime),
];
