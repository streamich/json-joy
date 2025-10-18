import type {JavaScript} from '@jsonjoy.com/codegen';
import type {Vars} from './Vars';
import type {ExpressionResult} from './codegen-steps';
import type {JsonExpressionFn} from './codegen';

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
export type QuaternaryExpression<
  O,
  A1 extends Expression = Expression,
  A2 extends Expression = Expression,
  A3 extends Expression = Expression,
  A4 extends Expression = Expression,
> = [operator: O, operand1: A1, operand2: A2, operand3: A3, operand4: A4];
export type QuinaryExpression<
  O,
  A1 extends Expression = Expression,
  A2 extends Expression = Expression,
  A3 extends Expression = Expression,
  A4 extends Expression = Expression,
  A5 extends Expression = Expression,
> = [operator: O, operand1: A1, operand2: A2, operand3: A3, operand4: A4, operand5: A5];
export type VariadicExpression<O, A extends Expression = Expression> = [operator: O, ...operands: A[]];

export type Expression =
  | Literal<any>
  | UnaryExpression<any, any>
  | BinaryExpression<any, any, any>
  | TernaryExpression<any, any, any, any>
  | QuaternaryExpression<any, any, any, any, any>
  | QuinaryExpression<any, any, any, any, any, any>
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
export type ExprPow = BinaryExpression<'pow' | '**'>;

// Comparison expressions
export type ComparisonExpression =
  | ExprEquals
  | ExprNotEquals
  | ExprLessThan
  | ExprLessThanOrEqual
  | ExprGreaterThan
  | ExprGreaterThanOrEqual
  | ExprCmp
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
export type ExprCmp = BinaryExpression<'cmp'>;
export type ExprBetweenEqEq = TernaryExpression<'between' | '=><='>;
export type ExprBetweenNeNe = TernaryExpression<'><'>;
export type ExprBetweenEqNe = TernaryExpression<'=><'>;
export type ExprBetweenNeEq = TernaryExpression<'><='>;

// Logical expressions
export type LogicalExpression = ExprAnd | ExprOr | ExprNot;

export type ExprAnd = VariadicExpression<'and' | '&&'>;
export type ExprOr = VariadicExpression<'or' | '||'>;
export type ExprNot = UnaryExpression<'not' | '!'>;

// Container expressions
export type ContainerExpression = ExprLen | ExprMember;

export type ExprLen = UnaryExpression<'len'>;
export type ExprMember = BinaryExpression<'member' | '[]'>;

// Type expressions
export type TypeExpression =
  | ExprType
  | ExprBool
  | ExprNum
  | ExprStr
  | ExprIsUndefined
  | ExprIsNull
  | ExprIsBool
  | ExprIsNumber
  | ExprIsString
  | ExprIsBinary
  | ExprIsArray
  | ExprIsObject;

export type ExprType = UnaryExpression<'type'>;
export type ExprBool = UnaryExpression<'bool'>;
export type ExprNum = UnaryExpression<'num'>;
export type ExprStr = UnaryExpression<'str'>;
export type ExprIsUndefined = UnaryExpression<'und?'>;
export type ExprIsNull = UnaryExpression<'nil?'>;
export type ExprIsBool = UnaryExpression<'bool?'>;
export type ExprIsNumber = UnaryExpression<'num?'>;
export type ExprIsString = UnaryExpression<'str?'>;
export type ExprIsBinary = UnaryExpression<'bin?'>;
export type ExprIsArray = UnaryExpression<'arr?'>;
export type ExprIsObject = UnaryExpression<'obj?'>;

// String expressions
export type StringExpression =
  | ExprCat
  | ExprContains
  | ExprStarts
  | ExprEnds
  | ExprMatches
  | ExprSubstr
  | ExprIsEmail
  | ExprIsHostname
  | ExprIsIp4
  | ExprIsIp6
  | ExprIsUuid
  | ExprIsUri
  | ExprIsDuration
  | ExprIsDate
  | ExprIsTime
  | ExprIsDateTime;

export type ExprCat = VariadicExpression<'cat' | '.'>;
export type ExprContains = BinaryExpression<'contains'>;
export type ExprStarts = BinaryExpression<'starts'>;
export type ExprEnds = BinaryExpression<'ends'>;
export type ExprMatches = BinaryExpression<'matches'>;
export type ExprSubstr = TernaryExpression<'substr'>;
export type ExprIsEmail = UnaryExpression<'email?'>;
export type ExprIsHostname = UnaryExpression<'hostname?'>;
export type ExprIsIp4 = UnaryExpression<'ip4?'>;
export type ExprIsIp6 = UnaryExpression<'ip6?'>;
export type ExprIsUuid = UnaryExpression<'uuid?'>;
export type ExprIsUri = UnaryExpression<'uri?'>;
export type ExprIsDuration = UnaryExpression<'duration?'>;
export type ExprIsDate = UnaryExpression<'date?'>;
export type ExprIsTime = UnaryExpression<'time?'>;
export type ExprIsDateTime = UnaryExpression<'dateTime?'>;

// Binary expressions
export type BinaryExpressions = ExprU8 | ExprI8 | ExprU16 | ExprI16 | ExprU32 | ExprI32 | ExprF32 | ExprF64;

export type ExprU8 = BinaryExpression<'u8'>;
export type ExprI8 = BinaryExpression<'i8'>;
export type ExprU16 = BinaryExpression<'u16'>;
export type ExprI16 = BinaryExpression<'i16'>;
export type ExprU32 = BinaryExpression<'u32'>;
export type ExprI32 = BinaryExpression<'i32'>;
export type ExprF32 = BinaryExpression<'f32'>;
export type ExprF64 = BinaryExpression<'f64'>;

// Array expressions
export type ArrayExpression =
  | ExprConcat
  | ExprPush
  | ExprHead
  | ExprSort
  | ExprReverse
  | ExprIn
  | ExprFromEntries
  | ExprIndexOf
  | ExprSlice
  | ExprZip
  | ExprFilter
  | ExprMap
  | ExprReduce;

export type ExprConcat = VariadicExpression<'concat' | '++'>;
export type ExprPush = VariadicExpression<'push'>;
export type ExprHead = BinaryExpression<'head'>;
export type ExprSort = UnaryExpression<'sort'>;
export type ExprReverse = UnaryExpression<'reverse'>;
export type ExprIn = BinaryExpression<'in'>;
export type ExprFromEntries = UnaryExpression<'fromEntries'>;
export type ExprIndexOf = BinaryExpression<'indexOf'>;
export type ExprSlice = TernaryExpression<'slice'>;
export type ExprZip = BinaryExpression<'zip'>;
export type ExprFilter = TernaryExpression<'filter'>;
export type ExprMap = TernaryExpression<'map'>;
export type ExprReduce = QuinaryExpression<'reduce'>;

// Object expressions
export type ObjectExpression = ExprKeys | ExprValues | ExprEntries | ExprObjectSet | ExprObjectDel;

export type ExprKeys = UnaryExpression<'keys'>;
export type ExprValues = UnaryExpression<'values'>;
export type ExprEntries = UnaryExpression<'entries'>;
export type ExprObjectSet = VariadicExpression<'o.set'>;
export type ExprObjectDel = VariadicExpression<'o.del'>;

// Bitwise expressions
export type BitwiseExpression = ExprBitAnd | ExprBitOr | ExprBitXor | ExprBitNot;

export type ExprBitAnd = VariadicExpression<'bitAnd' | '&'>;
export type ExprBitOr = VariadicExpression<'bitOr' | '|'>;
export type ExprBitXor = VariadicExpression<'bitXor' | '^'>;
export type ExprBitNot = UnaryExpression<'bitNot' | '~'>;

// Branching expressions
export type BranchingExpression = ExprIf | ExprThrow;

export type ExprIf = TernaryExpression<'if' | '?'>;
export type ExprThrow = UnaryExpression<'throw'>;

// Input expressions
export type InputExpression = ExprGet | ExprDefined;

export type ExprGet = UnaryExpression<'get' | '$'> | BinaryExpression<'get' | '$'>;
export type ExprDefined = UnaryExpression<'get?' | '$?'>;

// JSON Patch expressions
export type JsonPatchExpression = JsonPatchAdd;

export type JsonPatchAdd = VariadicExpression<'jp.add'>;

export type Expr =
  | ArithmeticExpression
  | ComparisonExpression
  | LogicalExpression
  | TypeExpression
  | ContainerExpression
  | StringExpression
  | BinaryExpressions
  | ArrayExpression
  | ObjectExpression
  | BitwiseExpression
  | BranchingExpression
  | InputExpression
  | JsonPatchExpression;

export interface JsonExpressionExecutionContext {
  vars: Vars;
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
  arity: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | [min: number, max: number],
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
  subExpression: (expr: Expression) => JsonExpressionFn;
  var: (name: string) => string;
}

export type OperatorMap = Map<string | number, OperatorDefinition<Expression>>;
