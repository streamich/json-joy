import * as util from '../util';
import {Expression, type ExpressionResult} from '../codegen-steps';
import type * as types from '../types';

const toNum = util.num;

export const arithmeticOperators: types.OperatorDefinition<any>[] = [
  [
    '+',
    ['add'],
    -1,
    (expr: types.ExprPlus, ctx) => {
      return expr.slice(1).reduce((acc, e) => toNum(ctx.eval(e, ctx)) + acc, 0);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprPlus>): ExpressionResult => {
      const js = ctx.operands.map((expr) => `(+(${expr})||0)`).join('+');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprPlus>,

  [
    '-',
    ['subtract'],
    -1,
    (expr: types.ExprMinus, ctx) => {
      return expr.slice(2).reduce((acc, e) => acc - toNum(ctx.eval(e, ctx)), toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprMinus>): ExpressionResult => {
      const js = ctx.operands.map((expr) => `(+(${expr})||0)`).join('-');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprMinus>,

  [
    '*',
    ['multiply'],
    -1,
    (expr: types.ExprAsterisk, ctx) => {
      return expr.slice(1).reduce((acc, e) => toNum(ctx.eval(e, ctx)) * acc, 1);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprAsterisk>): ExpressionResult => {
      const js = ctx.operands.map((expr) => `(+(${expr})||0)`).join('*');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprAsterisk>,

  [
    '/',
    ['divide'],
    -1,
    (expr: types.ExprMinus, ctx) => {
      const start = toNum(ctx.eval(expr[1], ctx));
      return expr.slice(2).reduce((acc, e) => util.slash(acc, toNum(ctx.eval(e, ctx))), start);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprMinus>): ExpressionResult => {
      ctx.link(util.slash, 'slash');
      const params = ctx.operands.map((expr) => `(+(${expr})||0)`);
      let last: string = params[0];
      for (let i = 1; i < params.length; i++) last = `slash(${last}, ${params[i]})`;
      return new Expression(last);
    },
  ] as types.OperatorDefinition<types.ExprMinus>,

  [
    '%',
    ['mod'],
    -1,
    (expr: types.ExprMod, ctx) => {
      const start = toNum(ctx.eval(expr[1], ctx));
      return expr.slice(2).reduce((acc, e) => util.mod(acc, toNum(ctx.eval(e, ctx))), start);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprMod>): ExpressionResult => {
      ctx.link(util.mod, 'mod');
      const params = ctx.operands.map((expr) => `(+(${expr})||0)`);
      let last: string = params[0];
      for (let i = 1; i < params.length; i++) last = `mod(${last}, ${params[i]})`;
      return new Expression(last);
    },
  ] as types.OperatorDefinition<types.ExprMod>,

  [
    'min',
    [],
    -1,
    (expr: types.ExprMin, ctx) => {
      return Math.min(...expr.slice(1).map((e) => toNum(ctx.eval(e, ctx))));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprMin>): ExpressionResult => {
      const params = ctx.operands.map((expr) => `(+(${expr})||0)`);
      return new Expression(`+Math.min(${params.join(',')})||0`);
    },
  ] as types.OperatorDefinition<types.ExprMin>,

  [
    'max',
    [],
    -1,
    (expr: types.ExprMax, ctx) => {
      return Math.max(...expr.slice(1).map((e) => toNum(ctx.eval(e, ctx))));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprMax>): ExpressionResult => {
      const params = ctx.operands.map((expr) => `(+(${expr})||0)`);
      return new Expression(`+Math.max(${params.join(',')})||0`);
    },
  ] as types.OperatorDefinition<types.ExprMax>,

  [
    'round',
    [],
    1,
    (expr: types.ExprRound, ctx) => {
      return Math.round(toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprRound>): ExpressionResult => {
      return new Expression(`Math.round(+(${ctx.operands[0]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprRound>,

  [
    'ceil',
    [],
    1,
    (expr: types.ExprCeil, ctx) => {
      return Math.ceil(toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprCeil>): ExpressionResult => {
      return new Expression(`Math.ceil(+(${ctx.operands[0]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprCeil>,

  [
    'floor',
    [],
    1,
    (expr: types.ExprFloor, ctx) => {
      return Math.floor(toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprFloor>): ExpressionResult => {
      return new Expression(`Math.floor(+(${ctx.operands[0]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprFloor>,

  [
    'trunc',
    [],
    1,
    (expr: types.ExprTrunc, ctx) => {
      return Math.trunc(toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprTrunc>): ExpressionResult => {
      return new Expression(`Math.trunc(+(${ctx.operands[0]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprTrunc>,

  [
    'abs',
    [],
    1,
    (expr: types.ExprAbs, ctx) => {
      return Math.abs(toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprAbs>): ExpressionResult => {
      return new Expression(`Math.abs(+(${ctx.operands[0]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprAbs>,

  [
    'sqrt',
    [],
    1,
    (expr: types.ExprSqrt, ctx) => {
      return Math.sqrt(toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprSqrt>): ExpressionResult => {
      return new Expression(`Math.sqrt(+(${ctx.operands[0]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprSqrt>,

  [
    'exp',
    [],
    1,
    (expr: types.ExprExp, ctx) => {
      return Math.exp(toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprExp>): ExpressionResult => {
      return new Expression(`Math.exp(+(${ctx.operands[0]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprExp>,

  [
    'ln',
    [],
    1,
    (expr: types.ExprLn, ctx) => {
      return Math.log(toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprLn>): ExpressionResult => {
      return new Expression(`Math.log(+(${ctx.operands[0]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprLn>,

  [
    'log',
    [],
    2,
    (expr: types.ExprLog, ctx) => {
      const num = toNum(ctx.eval(expr[1], ctx));
      const base = toNum(ctx.eval(expr[2], ctx));
      return Math.log(num) / Math.log(base);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprLog>): ExpressionResult => {
      return new Expression(`Math.log(+(${ctx.operands[0]})||0)/Math.log(+(${ctx.operands[1]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprLog>,

  [
    'log10',
    [],
    1,
    (expr: types.ExprLog10, ctx) => {
      return Math.log10(toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprLog10>): ExpressionResult => {
      return new Expression(`Math.log10(+(${ctx.operands[0]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprLog10>,

  [
    '**',
    ['pow'],
    2,
    (expr: types.ExprPow, ctx) => {
      const num = toNum(ctx.eval(expr[1], ctx));
      const base = toNum(ctx.eval(expr[2], ctx));
      return num ** base;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprPow>): ExpressionResult => {
      return new Expression(`Math.pow(+(${ctx.operands[0]})||0,+(${ctx.operands[0]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprPow>,
];
