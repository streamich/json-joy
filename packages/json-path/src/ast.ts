import type * as types from './types';

export class Ast {
  public static path = (segments: types.IPathSegment[]): types.IJSONPath => new JSONPath(segments);
  public static segment = (selectors: types.IAnySelector[], recursive?: boolean): types.IPathSegment =>
    new PathSegment(selectors, recursive);

  public static selector = class selector {
    public static named = (name: string): types.INamedSelector => new Named(name);
    public static index = (index: number): types.IIndexSelector => new Index(index);
    public static slice = (start?: number, end?: number, step?: number): types.ISliceSelector =>
      new Slice(start, end, step);
    public static wildcard = (): types.IWildcardSelector => new Wildcard();
    public static recursiveDescent = (selector: types.IAnySelector): types.IRecursiveDescentSelector =>
      new RecursiveDescent(selector);
    public static filter = (expression: types.IFilterExpression): types.IFilterSelector => new Filter(expression);
  };

  public static expression = class expression {
    public static comparison = (
      operator: types.IComparisonExpression['operator'],
      left: types.IValueExpression,
      right: types.IValueExpression,
    ): types.IComparisonExpression => new ComparisonExpression(operator, left, right);
    public static logical = (
      operator: types.ILogicalExpression['operator'],
      left: types.IFilterExpression,
      right: types.IFilterExpression,
    ): types.ILogicalExpression => new LogicalExpression(operator, left, right);
    public static existence = (path: types.IJSONPath): types.IExistenceExpression => new ExistenceExpression(path);
    public static function = (
      name: string,
      args: (types.IValueExpression | types.IFilterExpression | types.IJSONPath)[],
    ): types.IFunctionExpression => new FunctionExpression(name, args);
    public static paren = (expression: types.IFilterExpression): types.IParenExpression =>
      new ParenthesizedExpression(expression);
    public static negation = (expression: types.IFilterExpression): types.INegationExpression =>
      new NegationExpression(expression);
  };

  public static value = class value {
    public static current = (): types.ICurrentNodeExpression => new CurrentNodeExpression();
    public static root = (): types.IRootNodeExpression => new RootNodeExpression();
    public static literal = (value: string | number | boolean | null): types.ILiteralExpression =>
      new LiteralExpression(value);
    public static path = (path: types.IJSONPath): types.IPathExpression => new PathExpression(path);
    public static function = (
      name: string,
      args: (types.IValueExpression | types.IFilterExpression | types.IJSONPath)[],
    ): types.IFunctionExpression => new FunctionExpression(name, args);
  };
}

class Named implements types.INamedSelector {
  public readonly type = 'name' as const;
  constructor(public readonly name: string) {}
}

class Index implements types.IIndexSelector {
  public readonly type = 'index' as const;
  constructor(public readonly index: number) {}
}

class Slice implements types.ISliceSelector {
  public readonly type = 'slice' as const;
  constructor(
    public readonly start?: number,
    public readonly end?: number,
    public readonly step?: number,
  ) {}
}

class Wildcard implements types.IWildcardSelector {
  public readonly type = 'wildcard' as const;
}

class RecursiveDescent implements types.IRecursiveDescentSelector {
  public readonly type = 'recursive-descent' as const;
  constructor(public readonly selector: types.IAnySelector) {}
}

class Filter implements types.IFilterSelector {
  public readonly type = 'filter' as const;
  constructor(public readonly expression: types.IFilterExpression) {}
}

class PathSegment implements types.IPathSegment {
  constructor(
    public readonly selectors: types.IAnySelector[],
    public readonly recursive?: boolean,
  ) {}
}

class JSONPath implements types.IJSONPath {
  constructor(public readonly segments: types.IPathSegment[]) {}
}

class ComparisonExpression implements types.IComparisonExpression {
  public readonly type = 'comparison' as const;
  constructor(
    public readonly operator: types.IComparisonExpression['operator'],
    public readonly left: types.IValueExpression,
    public readonly right: types.IValueExpression,
  ) {}
}

class LogicalExpression implements types.ILogicalExpression {
  public readonly type = 'logical' as const;
  constructor(
    public readonly operator: types.ILogicalExpression['operator'],
    public readonly left: types.IFilterExpression,
    public readonly right: types.IFilterExpression,
  ) {}
}

class ExistenceExpression implements types.IExistenceExpression {
  public readonly type = 'existence' as const;
  constructor(public readonly path: types.IJSONPath) {}
}

class FunctionExpression implements types.IFunctionExpression {
  public readonly type = 'function' as const;
  constructor(
    public readonly name: string,
    public readonly args: (types.IValueExpression | types.IFilterExpression | types.IJSONPath)[],
  ) {}
}

class ParenthesizedExpression implements types.IParenExpression {
  public readonly type = 'paren' as const;
  constructor(public readonly expression: types.IFilterExpression) {}
}

class NegationExpression implements types.INegationExpression {
  public readonly type = 'negation' as const;
  constructor(public readonly expression: types.IFilterExpression) {}
}

class CurrentNodeExpression implements types.ICurrentNodeExpression {
  public readonly type = 'current' as const;
}

class RootNodeExpression implements types.IRootNodeExpression {
  public readonly type = 'root' as const;
}

class LiteralExpression implements types.ILiteralExpression {
  public readonly type = 'literal' as const;
  constructor(public readonly value: string | number | boolean | null) {}
}

class PathExpression implements types.IPathExpression {
  public readonly type = 'path' as const;
  constructor(public readonly path: types.IJSONPath) {}
}
