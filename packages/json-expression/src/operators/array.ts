import * as util from '../util';
import {Expression, type ExpressionResult, Literal} from '../codegen-steps';
import {deepEqualCodegen} from '@jsonjoy.com/util/lib/json-equal/deepEqualCodegen';
import type * as types from '../types';
import type {Vars} from '../Vars';

const {isArray} = Array;
const objectKeys = Object.keys;

/**
 * Creates a deep clone of any JSON-like object.
 *
 * @param obj Any plain POJO object.
 * @returns A deep copy of the object.
 */
export const clone = <T = unknown>(obj: T): T => {
  if (!obj) return obj;
  if (isArray(obj)) {
    const arr: unknown[] = [];
    const length = obj.length;
    for (let i = 0; i < length; i++) arr.push(clone(obj[i]));
    return arr as unknown as T;
  } else if (typeof obj === 'object') {
    const keys = objectKeys(obj!);
    const length = keys.length;
    const newObject: any = {};
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      newObject[key] = clone((obj as any)[key]);
    }
    return newObject;
  }
  return obj;
};

const createSubExpressionOperator = <N extends string>(
  name: N,
  fn: (arr: unknown[], varname: string, vars: Vars, run: () => unknown) => unknown,
) => {
  return [
    name,
    [],
    3,
    (expr: types.TernaryExpression<N>, ctx) => {
      const arr = util.asArr(ctx.eval(expr[1], ctx));
      const varname = util.asStr(util.asLiteral(expr[2]));
      const expression = expr[3];
      const run = () => ctx.eval(expression, ctx);
      return fn(arr, varname, ctx.vars, run);
    },
    (ctx: types.OperatorCodegenCtx<types.TernaryExpression<N>>): ExpressionResult => {
      ctx.link(util.asArr, 'asArr');
      ctx.link(fn, name);
      const varname = util.asStr(util.asLiteral(ctx.expr[2]));
      const d = ctx.link(ctx.subExpression(ctx.expr[3]));
      const operand1 = ctx.operands[0];
      const arr =
        operand1 instanceof Literal && operand1.val instanceof Array
          ? JSON.stringify(operand1.val)
          : `asArr(${operand1})`;
      const js = `${name}(${arr},${JSON.stringify(varname)},vars,function(){return ${d}(vars)})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.TernaryExpression<N>>;
};

export const arrayOperators: types.OperatorDefinition<any>[] = [
  [
    'concat',
    ['++'],
    -1,
    (expr: types.ExprConcat, ctx) => {
      const arrays = expr.slice(1).map((e) => ctx.eval(e, ctx));
      return util.concat(arrays);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprConcat>): ExpressionResult => {
      ctx.link(util.concat, 'concat');
      const js = `concat([(${ctx.operands.join('),(')})])`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprConcat>,

  [
    'push',
    [],
    -1,
    (expr: types.ExprPush, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      const arr = clone(util.asArr(operand1));
      for (let i = 2; i < expr.length; i++) arr.push(ctx.eval(expr[i], ctx));
      return arr;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprPush>): ExpressionResult => {
      const arrOperand = ctx.operands[0];
      let arr: Literal | Expression;
      if (arrOperand instanceof Literal) {
        arr = new Literal(clone(util.asArr(arrOperand.val)));
      } else {
        ctx.link(util.asArr, 'asArr');
        arr = new Expression(`asArr(${arrOperand})`);
      }
      const rArr = ctx.var('' + arr);
      const pushes: string[] = [];
      for (let i = 1; i < ctx.operands.length; i++) {
        const operand = ctx.operands[i];
        pushes.push(`(${rArr}.push(${operand}))`);
      }
      return new Expression(`(${pushes.join(',')},${rArr})`);
    },
  ] as types.OperatorDefinition<types.ExprPush>,

  [
    'head',
    [],
    2,
    (expr: types.ExprHead, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      const operand2 = ctx.eval(expr[2], ctx);
      return util.head(operand1, operand2);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprHead>): ExpressionResult => {
      ctx.link(util.head, 'head');
      const js = `head((${ctx.operands[0]}),(${ctx.operands[1]}))`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprHead>,

  [
    'sort',
    [],
    1,
    (expr: types.ExprSort, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      const arr = util.asArr(operand1);
      /** @todo use `.toSorted()`, once it is more common. */
      return [...arr].sort();
    },
    (ctx: types.OperatorCodegenCtx<types.ExprSort>): ExpressionResult => {
      ctx.link(util.asArr, 'asArr');
      const js = `[...asArr(${ctx.operands[0]})].sort()`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprSort>,

  [
    'reverse',
    [],
    1,
    (expr: types.ExprReverse, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      const arr = util.asArr(operand1);
      /** @todo use `.toReversed()`, once it is more common. */
      return [...arr].reverse();
    },
    (ctx: types.OperatorCodegenCtx<types.ExprReverse>): ExpressionResult => {
      ctx.link(util.asArr, 'asArr');
      const js = `[...asArr(${ctx.operands[0]})].reverse()`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprReverse>,

  [
    'in',
    [],
    2,
    (expr: types.ExprIn, ctx) => {
      const arr = ctx.eval(expr[1], ctx);
      const val = ctx.eval(expr[2], ctx);
      return util.isInArr(arr, val);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIn>): ExpressionResult => {
      const _arr = ctx.operands[0];
      const val = ctx.operands[1];
      if (val instanceof Literal) {
        const fnJs = deepEqualCodegen(val.val);
        const d = ctx.const(fnJs);
        ctx.link(util.isInArr2, 'isInArr2');
        const js = `isInArr2((${ctx.operands[0]}),${d})`;
        return new Expression(js);
      }
      ctx.link(util.isInArr, 'isInArr');
      const js = `isInArr((${ctx.operands[0]}),(${ctx.operands[1]}))`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIn>,

  [
    'fromEntries',
    [],
    1,
    (expr: types.ExprFromEntries, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      return util.fromEntries(operand1);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprFromEntries>): ExpressionResult => {
      ctx.link(util.fromEntries, 'fromEntries');
      const js = `fromEntries(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprFromEntries>,

  [
    'indexOf',
    [],
    2,
    (expr: types.ExprIndexOf, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      const operand2 = ctx.eval(expr[2], ctx);
      return util.indexOf(operand1, operand2);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIndexOf>): ExpressionResult => {
      const val = ctx.operands[1];
      if (val instanceof Literal) {
        const fnJs = deepEqualCodegen(val.val);
        const d = ctx.const(fnJs);
        ctx.link(util.indexOf2, 'indexOf2');
        const js = `indexOf2((${ctx.operands[0]}),${d})`;
        return new Expression(js);
      }
      ctx.link(util.indexOf, 'indexOf');
      const js = `indexOf((${ctx.operands[0]}),(${ctx.operands[1]}))`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIndexOf>,

  [
    'slice',
    [],
    3,
    (expr: types.ExprSlice, ctx) => {
      const operand1 = util.asArr(ctx.eval(expr[1], ctx));
      const operand2 = util.int(ctx.eval(expr[2], ctx));
      const operand3 = util.int(ctx.eval(expr[3], ctx));
      return operand1.slice(operand2, operand3);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprSlice>): ExpressionResult => {
      ctx.link(util.asArr, 'asArr');
      const js = `asArr(${ctx.operands[0]}).slice((${ctx.operands[1]}),(${ctx.operands[2]}))`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprSlice>,

  [
    'zip',
    [],
    2,
    (expr: types.ExprZip, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      const operand2 = ctx.eval(expr[2], ctx);
      return util.zip(operand1, operand2);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprZip>): ExpressionResult => {
      ctx.link(util.zip, 'zip');
      const js = `zip((${ctx.operands[0]}),(${ctx.operands[1]}))`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprZip>,

  createSubExpressionOperator<'filter'>('filter', util.filter),
  createSubExpressionOperator<'map'>('map', util.map),

  [
    'reduce',
    [],
    5,
    (expr: types.ExprReduce, ctx) => {
      const arr = util.asArr(ctx.eval(expr[1], ctx));
      const initialValue = ctx.eval(expr[2], ctx);
      const accname = util.asStr(util.asLiteral(expr[3]));
      const varname = util.asStr(util.asLiteral(expr[4]));
      const expression = expr[5];
      const run = () => ctx.eval(expression, ctx);
      return util.reduce(arr, initialValue, accname, varname, ctx.vars, run);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprReduce>): ExpressionResult => {
      ctx.link(util.asArr, 'asArr');
      ctx.link(util.reduce, 'reduce');
      const accname = util.asStr(util.asLiteral(ctx.expr[3]));
      const varname = util.asStr(util.asLiteral(ctx.expr[4]));
      const d = ctx.link(ctx.subExpression(ctx.expr[5]));
      const operand1 = ctx.operands[0];
      const arr =
        operand1 instanceof Literal && operand1.val instanceof Array
          ? JSON.stringify(operand1.val)
          : `asArr(${operand1})`;
      const js = `reduce((${arr}),(${ctx.operands[1]}),${JSON.stringify(accname)},${JSON.stringify(
        varname,
      )},vars,function(){return ${d}(vars)})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprReduce>,
];
