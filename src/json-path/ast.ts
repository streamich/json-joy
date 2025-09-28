import type * as types from './types';

export class Ast {
  public static path = (segments: types.PathSegment[]): types.JSONPath => new JSONPath(segments);
  public static segment = (selectors: types.AnySelector[], recursive?: boolean): types.PathSegment => new PathSegment(selectors, recursive);

  public static selector = class selector {
    public static named = (name: string): types.NamedSelector => new Named(name);
    public static index = (index: number): types.IndexSelector => new Index(index);
    public static slice = (start?: number, end?: number, step?: number): types.SliceSelector => new Slice(start, end, step);
    public static wildcard = (): types.WildcardSelector => new Wildcard();
    public static recursiveDescent = (selector: types.AnySelector): types.RecursiveDescentSelector => new RecursiveDescent(selector);
    public static filter = (expression: types.FilterExpression): types.FilterSelector => new Filter(expression);
  };

  public static expression = class expression {
    public static comparison = (operator: types.ComparisonExpression['operator'], left: types.ValueExpression, right: types.ValueExpression): types.ComparisonExpression => 
      new ComparisonExpression(operator, left, right);
    public static logical = (operator: types.LogicalExpression['operator'], left: types.FilterExpression, right: types.FilterExpression): types.LogicalExpression => 
      new LogicalExpression(operator, left, right);
    public static existence = (path: types.JSONPath): types.ExistenceExpression => new ExistenceExpression(path);
    public static function = (name: string, args: types.ValueExpression[]): types.FunctionExpression => new FunctionExpression(name, args);
  };

  public static value = class value {
    public static current = (): types.CurrentNodeExpression => new CurrentNodeExpression();
    public static root = (): types.RootNodeExpression => new RootNodeExpression();
    public static literal = (value: string | number | boolean | null): types.LiteralExpression => new LiteralExpression(value);
    public static path = (path: types.JSONPath): types.PathExpression => new PathExpression(path);
  };
}

// Selector implementations with consistent property order for V8 hidden classes
class Named implements types.NamedSelector {
  public readonly type: 'name' = 'name';
  constructor(
    public readonly name: string,
  ) {}
}

class Index implements types.IndexSelector {
  public readonly type: 'index' = 'index';
  constructor(
    public readonly index: number,
  ) {}
}

class Slice implements types.SliceSelector {
  public readonly type: 'slice' = 'slice';
  constructor(
    public readonly start?: number,
    public readonly end?: number,
    public readonly step?: number,
  ) {}
}

class Wildcard implements types.WildcardSelector {
  public readonly type: 'wildcard' = 'wildcard';
}

class RecursiveDescent implements types.RecursiveDescentSelector {
  public readonly type: 'recursive-descent' = 'recursive-descent';
  constructor(
    public readonly selector: types.AnySelector,
  ) {}
}

class Filter implements types.FilterSelector {
  public readonly type: 'filter' = 'filter';
  constructor(
    public readonly expression: types.FilterExpression,
  ) {}
}

class PathSegment implements types.PathSegment {
  constructor(
    public readonly selectors: types.AnySelector[],
    public readonly recursive?: boolean,
  ) {}
}

class JSONPath implements types.JSONPath {
  constructor(
    public readonly segments: types.PathSegment[],
  ) {}
}

// Filter expression implementations
class ComparisonExpression implements types.ComparisonExpression {
  public readonly type: 'comparison' = 'comparison';
  constructor(
    public readonly operator: types.ComparisonExpression['operator'],
    public readonly left: types.ValueExpression,
    public readonly right: types.ValueExpression,
  ) {}
}

class LogicalExpression implements types.LogicalExpression {
  public readonly type: 'logical' = 'logical';
  constructor(
    public readonly operator: types.LogicalExpression['operator'],
    public readonly left: types.FilterExpression,
    public readonly right: types.FilterExpression,
  ) {}
}

class ExistenceExpression implements types.ExistenceExpression {
  public readonly type: 'existence' = 'existence';
  constructor(
    public readonly path: types.JSONPath,
  ) {}
}

class FunctionExpression implements types.FunctionExpression {
  public readonly type: 'function' = 'function';
  constructor(
    public readonly name: string,
    public readonly args: types.ValueExpression[],
  ) {}
}

class CurrentNodeExpression implements types.CurrentNodeExpression {
  public readonly type: 'current' = 'current';
}

class RootNodeExpression implements types.RootNodeExpression {
  public readonly type: 'root' = 'root';
}

class LiteralExpression implements types.LiteralExpression {
  public readonly type: 'literal' = 'literal';
  constructor(
    public readonly value: string | number | boolean | null,
  ) {}
}

class PathExpression implements types.PathExpression {
  public readonly type: 'path' = 'path';
  constructor(
    public readonly path: types.JSONPath,
  ) {}
}
