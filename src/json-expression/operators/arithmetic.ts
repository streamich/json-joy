import {ExprPlus, OperatorDefinition} from "../types";
import * as util from '../util';

export const arithmeticOperators: OperatorDefinition<any>[] = [
  [
    '+',
    ['add'],
    2,
    (expr: ExprPlus, ctx) => {
      // util.assertVariadicArity('+', expr);
      return expr.slice(1).reduce((acc, e) => util.num(ctx.eval(e, ctx)) + acc, 0);
    },
  ] as OperatorDefinition<ExprPlus>,
];
