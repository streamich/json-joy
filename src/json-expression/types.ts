import type {JavaScript} from "../util/codegen";
import type {ExpressionResult} from "./codegen-steps";

export type Literal<T> = T | LiteralExpression<T>;
export type LiteralExpression<O> = [constant: O];
export type UnaryExpression<O, A1 extends Expression = Expression> = [operator: O, operand1: A1];
export type BinaryExpression<O, A1 extends Expression = Expression, A2 extends Expression = Expression> = [
  operator: O,
  operand1: A1,
  operand2: A2,
];
export type TernaryExpression<
  O,
  A1 extends Expression = Expression,
  A2 extends Expression = Expression,
  A3 extends Expression = Expression,
> = [operator: O, operand1: A1, operand2: A2, operand3: A3];
export type VariadicExpression<O, A extends Expression = Expression> = [operator: O, ...operands: A[]];

export type Expression =
  | Literal<any>
  | UnaryExpression<any, any>
  | BinaryExpression<any, any, any>
  | TernaryExpression<any, any, any, any>
  | VariadicExpression<any, any>;

// Arithmetic expressions
export type ArithmeticExpression =
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
export type ExprTrunc = UnaryExpression<'trunc'>;
export type ExprAbs = UnaryExpression<'abs'>;
export type ExprSqrt = UnaryExpression<'sqrt'>;
export type ExprExp = UnaryExpression<'exp'>;
export type ExprLn = UnaryExpression<'ln'>;
export type ExprLog = BinaryExpression<'log'>;
export type ExprLog10 = UnaryExpression<'log10'>;
export type ExprPow = BinaryExpression<'pow' | '**' | '^'>;

// Comparison expressions
export type ComparisonExpression =
  | ExprEquals
  | ExprNotEquals
  | ExprLessThan
  | ExprLessThanOrEqual
  | ExprGreaterThan
  | ExprGreaterThanOrEqual
  | ExprBetweenNeNe
  | ExprBetweenEqNe
  | ExprBetweenNeEq
  | ExprBetweenEqEq;

export type ExprEquals = BinaryExpression<'eq' | '=='>;
export type ExprNotEquals = BinaryExpression<'ne' | '!='>;
export type ExprGreaterThan = BinaryExpression<'gt' | '>'>;
export type ExprGreaterThanOrEqual = BinaryExpression<'ge' | '>='>;
export type ExprLessThan = BinaryExpression<'lt' | '<'>;
export type ExprLessThanOrEqual = BinaryExpression<'le' | '<='>;
export type ExprBetweenEqEq = TernaryExpression<'between' | '=><='>;
export type ExprBetweenNeNe = TernaryExpression<'><'>;
export type ExprBetweenEqNe = TernaryExpression<'=><'>;
export type ExprBetweenNeEq = TernaryExpression<'><='>;

// Logical expressions
export type BooleanExpression = ExprAnd | ExprOr | ExprNot;

export type ExprAnd = VariadicExpression<'and' | '&&'>;
export type ExprOr = VariadicExpression<'or' | '||'>;
export type ExprNot = UnaryExpression<'not' | '!'>;


export type ExprGet = [fn: '=' | 'get', path: unknown, def?: unknown];
export type ExprIf = [fn: '?' | 'if', test: unknown, then: unknown, otherwise: unknown];



export type ExprType = [fn: 'type', expression: unknown];
export type ExprBool = [fn: 'bool', expression: unknown];
export type ExprNum = [fn: 'num', expression: unknown];
export type ExprInt = [fn: 'int', expression: unknown];
export type ExprStr = [fn: 'str', expression: unknown];

// String expressions
export type ExprStarts = [fn: 'starts', outer: unknown, inner: unknown];
export type ExprContains = [fn: 'contains', outer: unknown, inner: unknown];
export type ExprEnds = [fn: 'ends', outer: unknown, inner: unknown];
export type ExprMatches = [fn: 'matches', subject: unknown, pattern: string];
export type ExprCat = [fn: '.' | 'cat', ...expressions: unknown[]];
export type ExprSubstr = [fn: 'substr', str: unknown, from: unknown, length?: unknown];


export type ExprDefined = [fn: 'defined', path: unknown];
// export type ExprUndefined = [fn: 'undefined', expression: unknown];
export type ExprIn = [fn: 'in', what: unknown, list: unknown];

export type Expr =
  | ArithmeticExpression
  | ComparisonExpression
  | BooleanExpression
  | ExprGet
  | ExprEquals
  | ExprNotEquals
  | ExprIf
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
  | ExprSubstr;

export interface JsonExpressionExecutionContext {
  data: unknown;
}

export interface JsonExpressionCodegenContext {
  createPattern?: (pattern: string) => (value: string) => boolean;
}

export type JsonExpressionContext = JsonExpressionExecutionContext & JsonExpressionCodegenContext;

export type OperatorDefinition<E extends Expression> = [
  /** Canonical operator name. */
  name: string,

  /** Alternative names for this operator. */
  aliases: Array<string | number>,

  /** Operator arity. -1 means operator is variadic. */
  arity: -1 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,

  /** Evaluates an expression with this operator. */
  eval: OperatorEval<E>,

  /** Compile expression to executable JavaScript. */
  codegen: (ctx: OperatorCodegenCtx<E>) => ExpressionResult,

  /**
   * Whether this expression has side effects. For example, data retrieval
   * expressions or random value generation is considered impure.
   */
  impure?: boolean,
];

export type OperatorEval<E extends Expression> = (
  expr: E,
  ctx: OperatorEvalCtx,
) => unknown;

export interface OperatorEvalCtx extends JsonExpressionExecutionContext, JsonExpressionCodegenContext {
  eval: OperatorEval<Expression>;
}

export interface OperatorCodegenCtx<E extends Expression> extends JsonExpressionCodegenContext {
  expr: E;
  operands: ExpressionResult[];
  operand: (operand: Expression) => ExpressionResult;
  link: (name: string, value: unknown) => void;
  const: (js: JavaScript<unknown>) => string;
}

export type OperatorMap = Map<string | number, OperatorDefinition<Expression>>;
