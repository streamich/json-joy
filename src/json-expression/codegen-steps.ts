/**
 * Represents an expression {@link types.Expr} which was evaluated by codegen and
 * which value is already know at compilation time, hence it can be emitted
 * as a literal.
 */
export class Literal {
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
export class Expression {
  constructor(public val: string) {}

  public toString() {
    return this.val;
  }
}

export type ExpressionResult = Literal | Expression;
