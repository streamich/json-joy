/**
 * JSONPath types and interfaces based on RFC 9535
 * https://www.rfc-editor.org/rfc/rfc9535.html
 */

/**
 * Base interface for all JSONPath selectors
 */
export interface ISelector {
  type: string;
}

/**
 * Named selector for property access
 * Examples: .name, ['key'], ["quoted-key"]
 */
export interface INamedSelector extends ISelector {
  type: 'name';
  name: string;
}

/**
 * Index selector for array element access
 * Examples: [0], [42], [-1]
 */
export interface IIndexSelector extends ISelector {
  type: 'index';
  index: number;
}

/**
 * Slice selector for array slicing
 * Examples: [start:end], [start:end:step], [:end], [start:]
 */
export interface ISliceSelector extends ISelector {
  type: 'slice';
  start?: number;
  end?: number;
  step?: number;
}

/**
 * Wildcard selector for selecting all elements
 * Examples: .*, [*]
 */
export interface IWildcardSelector extends ISelector {
  type: 'wildcard';
}

/**
 * Recursive descent selector
 * Examples: ..name, ..[0], ..*
 */
export interface IRecursiveDescentSelector extends ISelector {
  type: 'recursive-descent';
  selector: IAnySelector;
}

/**
 * Filter expression for conditional selection
 * Examples: [?(@.price < 10)], [?(@.author == 'Tolkien')]
 */
export interface IFilterSelector extends ISelector {
  type: 'filter';
  expression: IFilterExpression;
}

/**
 * Union of all selector types
 */
export type IAnySelector =
  | INamedSelector
  | IIndexSelector
  | ISliceSelector
  | IWildcardSelector
  | IRecursiveDescentSelector
  | IFilterSelector;

/**
 * JSONPath segment containing one or more selectors
 */
export interface IPathSegment {
  selectors: IAnySelector[];
  recursive?: boolean;
}

/**
 * Complete JSONPath expression
 */
export interface IJSONPath {
  segments: IPathSegment[];
}

/**
 * Filter expression types
 */
export type IFilterExpression =
  | IComparisonExpression
  | ILogicalExpression
  | IExistenceExpression
  | IFunctionExpression
  | IParenExpression
  | INegationExpression;

export interface IComparisonExpression {
  type: 'comparison';
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=';
  left: IValueExpression;
  right: IValueExpression;
}

export interface ILogicalExpression {
  type: 'logical';
  operator: '&&' | '||';
  left: IFilterExpression;
  right: IFilterExpression;
}

export interface IExistenceExpression {
  type: 'existence';
  path: IJSONPath;
}

export interface IFunctionExpression {
  type: 'function';
  name: string;
  args: (IValueExpression | IFilterExpression | IJSONPath)[];
}

export interface IParenExpression {
  type: 'paren';
  expression: IFilterExpression;
}

export interface INegationExpression {
  type: 'negation';
  expression: IFilterExpression;
}

/**
 * Value expressions in filters
 */
export type IValueExpression =
  | ICurrentNodeExpression
  | IRootNodeExpression
  | ILiteralExpression
  | IPathExpression
  | IFunctionExpression;

export interface ICurrentNodeExpression {
  type: 'current';
}

export interface IRootNodeExpression {
  type: 'root';
}

export interface ILiteralExpression {
  type: 'literal';
  value: string | number | boolean | null;
}

export interface IPathExpression {
  type: 'path';
  path: IJSONPath;
}

/**
 * Parse result
 */
export interface IParseResult {
  success: boolean;
  path?: IJSONPath;
  error?: string;
  position?: number;
}

export type NormalizedPath = (string | number)[];
