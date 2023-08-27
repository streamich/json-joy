import * as util from '../util';
import type {ExprPlus, OperatorCodegenCtx, OperatorDefinition} from "../types";
import {Expression, ExpressionResult, Literal} from '../codegen-steps';

export const arithmeticOperators: OperatorDefinition<any>[] = [
  [
    '+',
    ['add'],
    -1,
    (expr: ExprPlus, ctx) => {
      return expr.slice(1).reduce((acc, e) => util.num(ctx.eval(e, ctx)) + acc, 0);
    },
    (ctx: OperatorCodegenCtx<ExprPlus>): ExpressionResult => {
      const expr = ctx.expr;
      util.assertVariadicArity('+', expr);
      const expressions = expr.slice(1).map((operand) => ctx.operand(operand));
      const allLiterals = expressions.every((expr) => expr instanceof Literal);
      if (allLiterals) return new Literal(expressions.reduce((a, b) => a + util.num(b.val), 0));
      const params = expressions.map((expr) => `(+(${expr})||0)`);
      return new Expression(`${params.join(' + ')}`);
    },
  ] as OperatorDefinition<ExprPlus>,
];
