export type ExprGet = [fn: '=' | 'get', path: unknown, def?: unknown];
export type ExprEquals = [fn: '==' | 'eq', expr1: unknown, expr2: unknown];
export type ExprNotEquals = [fn: '!=' | 'ne', expr1: unknown, expr2: unknown];

export type ExprIf = [fn: '?' | 'if', test: unknown, then: unknown, els: unknown];
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
export type ExprMin = [fn: 'min', ...expressions: unknown[]];
export type ExprMax = [fn: 'max', ...expressions: unknown[]];
export type ExprPlus = [fn: '+', ...expressions: unknown[]];
export type ExprMinus = [fn: '-', ...expressions: unknown[]];
export type ExprAsterisk = [fn: '*', ...expressions: unknown[]];
export type ExprSlash = [fn: '/', expr1: unknown, expr2: unknown];
export type ExprMod = [fn: '%' | 'mod', expr1: unknown, expr2: unknown];
export type ExprRound = [fn: 'round', expr: unknown];
export type ExprCeil = [fn: 'ceil', expr: unknown];
export type ExprFloor = [fn: 'floor', expr: unknown];

// export type ExprJsonParse = [fn: 'json.parse', expr: unknown];

export type Expr =
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
  | ExprBetweenEqEq
  | ExprMin
  | ExprMax
  | ExprPlus
  | ExprMinus
  | ExprAsterisk
  | ExprSlash
  | ExprMod
  | ExprRound
  | ExprCeil
  | ExprFloor
  ;

export interface JsonExpressionExecutionContext {
  data: unknown;
}

export interface JsonExpressionCodegenContext {
  createPattern?: (pattern: string) => (value: string) => boolean;
}
