import {Expression, type ExpressionResult, Literal} from '../codegen-steps';
import * as util from '../util';
import * as jsonPointer from '@jsonjoy.com/json-pointer';
import type {Vars} from '../Vars';
import {$$find} from '@jsonjoy.com/json-pointer/lib/codegen/find';
import type * as types from '../types';

const get = (vars: Vars, varname: unknown) => {
  if (typeof varname !== 'string') throw new Error('varname must be a string.');
  const [name, pointer] = util.parseVar(varname);
  jsonPointer.validateJsonPointer(pointer);
  const data = vars.get(name);
  const path = jsonPointer.toPath(pointer);
  const value = jsonPointer.get(data, path);
  return value;
};

export const inputOperators: types.OperatorDefinition<any>[] = [
  [
    '$',
    ['get'],
    [1, 2],
    (expr: types.ExprGet, ctx: types.OperatorEvalCtx) => {
      const varname = ctx.eval(expr[1], ctx);
      const defval = ctx.eval(expr[2], ctx);
      const value = get(ctx.vars, varname);
      return util.throwOnUndef(value, defval);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprGet>): ExpressionResult => {
      ctx.link(util.throwOnUndef, 'throwOnUndef');
      const varname = ctx.operands[0];
      if (varname instanceof Literal) {
        if (typeof varname.val !== 'string') throw new Error('varname must be a string.');
        const [name, pointer] = util.parseVar(varname.val);
        if (!pointer) return new Expression(!name ? 'vars.env' : `vars.get(${JSON.stringify(name)})`);
        jsonPointer.validateJsonPointer(pointer);
        const hasDefaultValue = ctx.expr.length === 3;
        const defaultValue = hasDefaultValue ? ctx.operands[1] : undefined;
        const fn = $$find(jsonPointer.toPath(pointer));
        const find = ctx.const(fn);
        const data = `vars.get(${JSON.stringify(name)})`;
        return new Expression(`throwOnUndef(${find}(${data}),(${defaultValue}))`);
      }
      ctx.link(get, 'get');
      return new Expression(`throwOnUndef(get(vars,(${varname})),(${ctx.operands[1]}))`);
    },
    /* has side-effects */ true,
  ] as types.OperatorDefinition<types.ExprGet>,

  [
    '$?',
    ['get?'],
    1,
    (expr: types.ExprDefined, ctx: types.OperatorEvalCtx) => {
      const varname = ctx.eval(expr[1], ctx);
      const value = get(ctx.vars, varname);
      return value !== undefined;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprDefined>): ExpressionResult => {
      const varname = ctx.operands[0];
      if (varname instanceof Literal) {
        if (typeof varname.val !== 'string') throw new Error('varname must be a string.');
        const [name, pointer] = util.parseVar(varname.val);
        jsonPointer.validateJsonPointer(pointer);
        const fn = $$find(jsonPointer.toPath(pointer));
        const find = ctx.const(fn);
        const data = `vars.get(${JSON.stringify(name)})`;
        return new Expression(`${find}(${data})!==undefined`);
      }
      ctx.link(get, 'get');
      return new Expression(`get(vars,(${varname}))!==undefined`);
    },
    /* has side-effects */ true,
  ] as types.OperatorDefinition<types.ExprDefined>,
];
