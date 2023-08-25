export type Literal<T> = T | LiteralExpression<T>;
export type LiteralExpression<O> = [constant: O];
export type UnaryExpression<O, A1 extends Expression = Expression> = [operator: O, operand1: A1];
export type BinaryExpression<O, A1 extends Expression = Expression, A2 extends Expression = Expression> = [operator: O, operand1: A1, operand2: A2];
export type TernaryExpression<O, A1 extends Expression = Expression, A2 extends Expression = Expression, A3 extends Expression = Expression> = [operator: O, operand1: A1, operand2: A2, operand3: A3];
export type VariadicExpression<O, A extends Expression = Expression> = [operator: O, ...operands: A[]];

export type Expression =
  | Literal<any>
  | UnaryExpression<any, any>
  | BinaryExpression<any, any, any>
  | TernaryExpression<any, any, any, any>
  | VariadicExpression<any, any>;

// Arithmetic expressions
export type ExprArithmetic =
  | ExprPlus
  | ExprMinus
  | ExprAsterisk
  | ExprSlash
  | ExprMod
  | ExprMin
  | ExprMax
  | ExprRound
  | ExprCeil
  | ExprFloor
  | ExprAbs
  | ExprSqrt
  | ExprExp
  | ExprLn
  | ExprLog
  | ExprLog10
  | ExprPow
  | ExprTrunc;

export type ExprPlus = VariadicExpression<'add' | '+'>;
export type ExprMinus = VariadicExpression<'subtract' | '-'>;
export type ExprAsterisk = VariadicExpression<'multiply' | '*'>;
export type ExprSlash = VariadicExpression<'divide' | '/'>;
export type ExprMod = VariadicExpression<'mod' | '%'>;
export type ExprMin = VariadicExpression<'min'>;
export type ExprMax = VariadicExpression<'max'>;
export type ExprRound = UnaryExpression<'round'>;
export type ExprCeil = UnaryExpression<'ceil'>;
export type ExprFloor = UnaryExpression<'floor'>;
export type ExprAbs = UnaryExpression<'abs'>;
export type ExprSqrt = UnaryExpression<'sqrt'>;
export type ExprExp = UnaryExpression<'exp'>;
export type ExprLn = UnaryExpression<'ln'>;
export type ExprLog = BinaryExpression<'log'>;
export type ExprLog10 = UnaryExpression<'log10'>;
export type ExprPow = BinaryExpression<'pow' | '^'>;
export type ExprTrunc = BinaryExpression<'trunc'>;

export type ExprGet = [fn: '=' | 'get', path: unknown, def?: unknown];
export type ExprEquals = [fn: '==' | 'eq', expr1: unknown, expr2: unknown];
export type ExprNotEquals = [fn: '!=' | 'ne', expr1: unknown, expr2: unknown];

export type ExprIf = [fn: '?' | 'if', test: unknown, then: unknown, otherwise: unknown];
export type ExprAnd = [fn: '&&' | 'and', ...expressions: unknown[]];
export type ExprOr = [fn: '||' | 'or', ...expressions: unknown[]];
export type ExprNot = [fn: '!' | 'not', expression: unknown];

export type ExprType = [fn: 'type', expression: unknown];
export type ExprBool = [fn: 'bool', expression: unknown];
export type ExprNum = [fn: 'num', expression: unknown];
export type ExprInt = [fn: 'int', expression: unknown];
export type ExprStr = [fn: 'str', expression: unknown];

export type ExprStarts = [fn: 'starts', outer: unknown, inner: unknown];
export type ExprContains = [fn: 'contains', outer: unknown, inner: unknown];
export type ExprEnds = [fn: 'ends', outer: unknown, inner: unknown];
export type ExprDefined = [fn: 'defined', path: unknown];
// export type ExprUndefined = [fn: 'undefined', expression: unknown];
export type ExprIn = [fn: 'in', what: unknown, list: unknown];
export type ExprMatches = [fn: 'matches', subject: unknown, pattern: string];
export type ExprCat = [fn: '.' | 'cat', ...expressions: unknown[]];
export type ExprSubstr = [fn: 'substr', str: unknown, from: unknown, length?: unknown];

export type ExprLessThan = [fn: '<', expr1: unknown, expr2: unknown];
export type ExprLessThanOrEqual = [fn: '<=', expr1: unknown, expr2: unknown];
export type ExprGreaterThan = [fn: '>', expr1: unknown, expr2: unknown];
export type ExprGreaterThanOrEqual = [fn: '>=', expr1: unknown, expr2: unknown];
export type ExprBetweenNeNe = [fn: '><', what: unknown, min: unknown, max: unknown];
export type ExprBetweenEqNe = [fn: '=><', what: unknown, min: unknown, max: unknown];
export type ExprBetweenNeEq = [fn: '><=', what: unknown, min: unknown, max: unknown];
export type ExprBetweenEqEq = [fn: '=><=', what: unknown, min: unknown, max: unknown];

export type Expr =
  | ExprArithmetic
  | ExprGet
  | ExprEquals
  | ExprNotEquals
  | ExprIf
  | ExprAnd
  | ExprOr
  | ExprNot
  | ExprType
  | ExprBool
  | ExprNum
  | ExprInt
  | ExprStr
  | ExprStarts
  | ExprContains
  | ExprEnds
  | ExprDefined
  | ExprIn
  | ExprMatches
  | ExprMatches
  | ExprCat
  | ExprSubstr
  | ExprLessThan
  | ExprLessThanOrEqual
  | ExprGreaterThan
  | ExprGreaterThanOrEqual
  | ExprBetweenNeNe
  | ExprBetweenNeEq
  | ExprBetweenEqNe
  | ExprBetweenEqEq;

export interface JsonExpressionExecutionContext {
  data: unknown;
}

export interface JsonExpressionCodegenContext {
  createPattern?: (pattern: string) => (value: string) => boolean;
}
