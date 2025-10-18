import {Expression, type ExpressionResult} from '../codegen-steps';
import * as util from '../util';
import type * as types from '../types';

export const typeOperators: types.OperatorDefinition<any>[] = [
  [
    'type',
    [],
    1,
    (expr: types.ExprNot, ctx) => {
      return util.type(ctx.eval(expr[1], ctx));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprNot>): ExpressionResult => {
      ctx.link(util.type, 'type');
      const js = `type(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprNot>,

  [
    'bool',
    [],
    1,
    (expr: types.ExprBool, ctx) => {
      return !!ctx.eval(expr[1], ctx);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprBool>): ExpressionResult => {
      const js = `!!${ctx.operands[0]}`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprBool>,

  [
    'num',
    [],
    1,
    (expr: types.ExprNum, ctx) => {
      return util.num(ctx.eval(expr[1], ctx));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprNum>): ExpressionResult => {
      const js = `+(${ctx.operands[0]})||0`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprNum>,

  [
    'str',
    [],
    1,
    (expr: types.ExprStr, ctx) => {
      return util.str(ctx.eval(expr[1], ctx));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprStr>): ExpressionResult => {
      ctx.link(util.str, 'str');
      const js = `str(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprStr>,

  [
    'len',
    [],
    1,
    (expr: types.ExprStr, ctx) => {
      return util.len(ctx.eval(expr[1], ctx));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprStr>): ExpressionResult => {
      ctx.link(util.len, 'len');
      const js = `len(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprStr>,

  [
    'und?',
    [],
    1,
    (expr: types.ExprIsUndefined, ctx) => {
      return ctx.eval(expr[1], ctx) === undefined;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsUndefined>): ExpressionResult => {
      const js = `(${ctx.operands[0]})===undefined`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIsUndefined>,

  [
    'nil?',
    [],
    1,
    (expr: types.ExprIsNull, ctx) => {
      return ctx.eval(expr[1], ctx) === null;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsNull>): ExpressionResult => {
      const js = `(${ctx.operands[0]})===null`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIsNull>,

  [
    'bool?',
    [],
    1,
    (expr: types.ExprIsBool, ctx) => {
      return typeof ctx.eval(expr[1], ctx) === 'boolean';
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsBool>): ExpressionResult => {
      const js = `typeof(${ctx.operands[0]})==='boolean'`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIsBool>,

  [
    'num?',
    [],
    1,
    (expr: types.ExprIsNumber, ctx) => {
      return typeof ctx.eval(expr[1], ctx) === 'number';
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsNumber>): ExpressionResult => {
      const js = `typeof(${ctx.operands[0]})==='number'`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIsNumber>,

  [
    'str?',
    [],
    1,
    (expr: types.ExprIsString, ctx) => {
      return typeof ctx.eval(expr[1], ctx) === 'string';
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsString>): ExpressionResult => {
      const js = `typeof(${ctx.operands[0]})==='string'`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIsString>,

  [
    'bin?',
    [],
    1,
    (expr: types.ExprIsBinary, ctx) => {
      return ctx.eval(expr[1], ctx) instanceof Uint8Array;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsBinary>): ExpressionResult => {
      const js = `(${ctx.operands[0]})instanceof Uint8Array`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIsBinary>,

  [
    'arr?',
    [],
    1,
    (expr: types.ExprIsArray, ctx) => {
      return ctx.eval(expr[1], ctx) instanceof Array;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsArray>): ExpressionResult => {
      const js = `(${ctx.operands[0]})instanceof Array`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIsArray>,

  [
    'obj?',
    [],
    1,
    (expr: types.ExprIsObject, ctx) => {
      return util.type(ctx.eval(expr[1], ctx)) === 'object';
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIsObject>): ExpressionResult => {
      ctx.link(util.type, 'type');
      const js = `type(${ctx.operands[0]})==='object'`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIsObject>,
];
