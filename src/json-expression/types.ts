import type {JavaScript} from '../util/codegen';
import type {ExpressionResult} from './codegen-steps';

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

// Boolean expressions
export type BooleanExpression = ExprAnd | ExprOr | ExprNot;

export type ExprAnd = VariadicExpression<'and' | '&&'>;
export type ExprOr = VariadicExpression<'or' | '||'>;
export type ExprNot = UnaryExpression<'not' | '!'>;

// Type expressions
export type TypeExpression = ExprType | ExprBool | ExprNum | ExprInt | ExprStr;

export type ExprType = UnaryExpression<'type'>;
export type ExprBool = UnaryExpression<'bool'>;
export type ExprNum = UnaryExpression<'num'>;
export type ExprInt = UnaryExpression<'int'>;
export type ExprStr = UnaryExpression<'str'>;

// String expressions
export type StringExpression = ExprCat | ExprContains | ExprStarts | ExprEnds | ExprMatches | ExprSubstr;

export type ExprCat = VariadicExpression<'cat' | '.'>;
export type ExprContains = BinaryExpression<'contains'>;
export type ExprStarts = BinaryExpression<'starts'>;
export type ExprEnds = BinaryExpression<'ends'>;
export type ExprMatches = BinaryExpression<'matches'>;
export type ExprSubstr = TernaryExpression<'substr'>;

export type ExprGet = [fn: '=' | 'get', path: unknown, def?: unknown];
export type ExprIf = [fn: '?' | 'if', test: unknown, then: unknown, otherwise: unknown];
export type ExprDefined = [fn: 'defined', path: unknown];
// export type ExprUndefined = [fn: 'undefined', expression: unknown];
export type ExprIn = [fn: 'in', what: unknown, list: unknown];

export type Expr =
  | ArithmeticExpression
  | ComparisonExpression
  | BooleanExpression
  | TypeExpression
  | StringExpression
  | ExprGet
  | ExprEquals
  | ExprNotEquals
  | ExprIf
  | ExprDefined
  | ExprIn;

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

export type OperatorEval<E extends Expression> = (expr: E, ctx: OperatorEvalCtx) => unknown;

export interface OperatorEvalCtx extends JsonExpressionExecutionContext, JsonExpressionCodegenContext {
  eval: OperatorEval<Expression>;
}

export interface OperatorCodegenCtx<E extends Expression> extends JsonExpressionCodegenContext {
  expr: E;
  operands: ExpressionResult[];
  operand: (operand: Expression) => ExpressionResult;
  link: (value: unknown, name?: string) => string;
  const: (js: JavaScript<unknown>) => string;
}

export type OperatorMap = Map<string | number, OperatorDefinition<Expression>>;
