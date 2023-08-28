import {Expression, ExpressionResult, Literal} from '../codegen-steps';
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
      const js = ctx.operands.map((expr) => `str(${expr})`).join('+');
      return new Expression(js);
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

  [
    'email?',
    [],
    1,
    (expr: types.ExprIsEmail, ctx) => {
      const email = ctx.eval(expr[1], ctx);
      return util.isEmail(email);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsEmail>): ExpressionResult => {
      ctx.link(util.isEmail, 'isEmail');
      return new Expression(`isEmail(${ctx.operands[0]})`);
    },
  ] as types.OperatorDefinition<types.ExprIsEmail>,

  [
    'hostname?',
    [],
    1,
    (expr: types.ExprIsHostname, ctx) => {
      const email = ctx.eval(expr[1], ctx);
      return util.isHostname(email);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsHostname>): ExpressionResult => {
      ctx.link(util.isHostname, 'isHostname');
      return new Expression(`isHostname(${ctx.operands[0]})`);
    },
  ] as types.OperatorDefinition<types.ExprIsHostname>,

  [
    'ip4?',
    [],
    1,
    (expr: types.ExprIsIp4, ctx) => {
      const email = ctx.eval(expr[1], ctx);
      return util.isIp4(email);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsIp4>): ExpressionResult => {
      ctx.link(util.isIp4, 'isIp4');
      return new Expression(`isIp4(${ctx.operands[0]})`);
    },
  ] as types.OperatorDefinition<types.ExprIsIp4>,

  [
    'ip6?',
    [],
    1,
    (expr: types.ExprIsIp6, ctx) => {
      const email = ctx.eval(expr[1], ctx);
      return util.isIp6(email);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsIp6>): ExpressionResult => {
      ctx.link(util.isIp6, 'isIp6');
      return new Expression(`isIp6(${ctx.operands[0]})`);
    },
  ] as types.OperatorDefinition<types.ExprIsIp6>,

  [
    'uuid?',
    [],
    1,
    (expr: types.ExprIsUuid, ctx) => {
      const email = ctx.eval(expr[1], ctx);
      return util.isUuid(email);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsUuid>): ExpressionResult => {
      ctx.link(util.isUuid, 'isUuid');
      return new Expression(`isUuid(${ctx.operands[0]})`);
    },
  ] as types.OperatorDefinition<types.ExprIsUuid>,

  [
    'uri?',
    [],
    1,
    (expr: types.ExprIsUri, ctx) => {
      const email = ctx.eval(expr[1], ctx);
      return util.isUri(email);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsUri>): ExpressionResult => {
      ctx.link(util.isUri, 'isUri');
      return new Expression(`isUri(${ctx.operands[0]})`);
    },
  ] as types.OperatorDefinition<types.ExprIsUri>,

  [
    'duration?',
    [],
    1,
    (expr: types.ExprIsDuration, ctx) => {
      const email = ctx.eval(expr[1], ctx);
      return util.isDuration(email);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsDuration>): ExpressionResult => {
      ctx.link(util.isDuration, 'isDuration');
      return new Expression(`isDuration(${ctx.operands[0]})`);
    },
  ] as types.OperatorDefinition<types.ExprIsDuration>,
];
