/**
 * JsExpression monad allows to write JS expression as strings which depend on each
 * other and tracks whether an expression was used or not.
 *
 * ```ts
 * const expr = new JsExpression(() => 'r0');
 * const subExpr = expr.chain((expr) => `${expr}["key"]`);
 *
 * expr.wasUsed; // false
 * subExpr.use(); // r0["key"]
 * expr.wasUsed; // true
 * subExpr.wasUsed; // true
 * ```
 */
export class JsExpression {
  private _wasUsed: boolean = false;
  private _expression?: string;
  private _listeners: ((expr: string) => void)[] = [];

  constructor(private expression: () => string) {}

  public get wasUsed(): boolean {
    return this._wasUsed;
  }

  public use(): string {
    if (this._wasUsed) return this._expression!;
    this._wasUsed = true;
    const expression = (this._expression = this.expression());
    for (const listener of this._listeners) listener(expression);
    return expression;
  }

  public chain(use: (expr: string) => string): JsExpression {
    return new JsExpression(() => use(this.use()));
  }

  public addListener(listener: (expr: string) => void): void {
    this._listeners.push(listener);
  }
}
