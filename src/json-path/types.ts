/**
 * JSONPath types and interfaces based on RFC 9535
 * https://www.rfc-editor.org/rfc/rfc9535.html
 */

/**
 * Base interface for all JSONPath selectors
 */
export interface Selector {
  type: string;
}

/**
 * Named selector for property access
 * Examples: .name, ['key'], ["quoted-key"]
 */
export interface NamedSelector extends Selector {
  type: 'name';
  name: string;
}

/**
 * Index selector for array element access
 * Examples: [0], [42], [-1]
 */
export interface IndexSelector extends Selector {
  type: 'index';
  index: number;
}

/**
 * Slice selector for array slicing
 * Examples: [start:end], [start:end:step], [:end], [start:]
 */
export interface SliceSelector extends Selector {
  type: 'slice';
  start?: number;
  end?: number;
  step?: number;
}

/**
 * Wildcard selector for selecting all elements
 * Examples: .*, [*]
 */
export interface WildcardSelector extends Selector {
  type: 'wildcard';
}

/**
 * Recursive descent selector
 * Examples: ..name, ..[0], ..*
 */
export interface RecursiveDescentSelector extends Selector {
  type: 'recursive-descent';
  selector: AnySelector;
}

/**
 * Filter expression for conditional selection
 * Examples: [?(@.price < 10)], [?(@.author == 'Tolkien')]
 */
export interface FilterSelector extends Selector {
  type: 'filter';
  expression: FilterExpression;
}

/**
 * Union of all selector types
 */
export type AnySelector =
  | NamedSelector
  | IndexSelector
  | SliceSelector
  | WildcardSelector
  | RecursiveDescentSelector
  | FilterSelector;

/**
 * JSONPath segment containing one or more selectors
 */
export interface PathSegment {
  selectors: AnySelector[];
  recursive?: boolean;
}

/**
 * Complete JSONPath expression
 */
export interface JSONPath {
  segments: PathSegment[];
}

/**
 * Filter expression types
 */
export type FilterExpression =
  | ComparisonExpression
  | LogicalExpression
  | ExistenceExpression
  | FunctionExpression
  | ParenExpression
  | NegationExpression;

export interface ComparisonExpression {
  type: 'comparison';
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=';
  left: ValueExpression;
  right: ValueExpression;
}

export interface LogicalExpression {
  type: 'logical';
  operator: '&&' | '||';
  left: FilterExpression;
  right: FilterExpression;
}

export interface ExistenceExpression {
  type: 'existence';
  path: JSONPath;
}

export interface FunctionExpression {
  type: 'function';
  name: string;
  args: (ValueExpression | FilterExpression | JSONPath)[];
}

export interface ParenExpression {
  type: 'paren';
  expression: FilterExpression;
}

export interface NegationExpression {
  type: 'negation';
  expression: FilterExpression;
}

/**
 * Value expressions in filters
 */
export type ValueExpression =
  | CurrentNodeExpression
  | RootNodeExpression
  | LiteralExpression
  | PathExpression
  | FunctionExpression;

export interface CurrentNodeExpression {
  type: 'current';
}

export interface RootNodeExpression {
  type: 'root';
}

export interface LiteralExpression {
  type: 'literal';
  value: string | number | boolean | null;
}

export interface PathExpression {
  type: 'path';
  path: JSONPath;
}

/**
 * Parse result
 */
export interface ParseResult {
  success: boolean;
  path?: JSONPath;
  error?: string;
  position?: number;
}
