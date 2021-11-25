export type ExprGet = [fn: '=' | 'get', path: unknown];
export type ExprEquals = [fn: '==' | 'eq', expr1: unknown, expr2: unknown];
export type ExprNotEquals = [fn: '!=' | 'ne', expr1: unknown, expr2: unknown];

export type ExprAnd = [fn: '&&' | 'and', ...expressions: unknown[]];
export type ExprOr = [fn: '||' | 'or', ...expressions: unknown[]];
export type ExprNot = [fn: '!' | 'not', expression: unknown];

export type ExprType = [fn: 'type', expression: unknown];
export type ExprBool = [fn: 'bool', expression: unknown];
export type ExprNum = [fn: 'num', expression: unknown];
export type ExprInt = [fn: 'int', expression: unknown];
export type ExprStr = [fn: 'str', expression: unknown];

export type ExprStarts = [fn: 'starts', inner: unknown, outer: unknown];
export type ExprContains = [fn: 'contains', inner: unknown, outer: unknown];
export type ExprEnds = [fn: 'ends', inner: unknown, outer: unknown];
export type ExprDefined = [fn: 'defined', path: unknown];
// export type ExprUndefined = [fn: 'undefined', expression: unknown];
// export type ExprIn = [fn: 'in', list: unknown[], expression: unknown];
export type ExprMatches = [fn: 'matches', pattern: string, expression: unknown];

export type ExprLessThan = [fn: '<', expr1: unknown, expr2: unknown];
export type ExprLessThanOrEqual = [fn: '<=', expr1: unknown, expr2: unknown];
export type ExprGreaterThan = [fn: '>', expr1: unknown, expr2: unknown];
export type ExprGreaterThanOrEqual = [fn: '>=', expr1: unknown, expr2: unknown];

export type Expr =
  | ExprGet
  | ExprEquals
  | ExprNotEquals
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
  // | ExprIn
  | ExprMatches
  | ExprLessThan
  | ExprLessThanOrEqual
  | ExprGreaterThan
  | ExprGreaterThanOrEqual;
