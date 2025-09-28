import {JsonPathParser} from './JsonPathParser';
import {Value} from './Value';
import type * as types from './types';

export class JsonPathEval {
  public static run = (path: string | types.JSONPath, data: unknown): Value[] => {
    let ast: types.JSONPath;
    if (typeof path === 'string') {
      const parsed = JsonPathParser.parse(path);
      if (!parsed.success || !parsed.path || parsed.error)
        throw new Error(`Invalid JSONPath: ${parsed.error} [position = ${parsed.position}, path = ${path}]`);
      ast = parsed.path;
    } else ast = path;
    const evaluator = new JsonPathEval(ast, data);
    return evaluator.eval();
  };

  constructor(
    public readonly path: types.JSONPath,
    public readonly data: unknown,
  ) {}

  eval(): Value[] {
    let input: Value[] = [new Value(null, '$', this.data)];
    let output: Value[] = [];
    const segments = this.path.segments;
    const length = segments.length;
    for (let i = 0; i < length; i++) {
      output = this.evalSegment(input, segments[i]);
      input = output;
    }
    return output;
  }

  evalSegment(input: Value[], segment: types.PathSegment): Value[] {
    const output: Value[] = [];
    const selectors = segment.selectors;
    const length = selectors.length;
    for (let i = 0; i < length; i++) this.evalSelector(input, selectors[i], output);
    return output;
  }

  evalSelector(inputs: Value[], selector: types.AnySelector, output: Value[] = []): Value[] {
    switch (selector.type) {
      case 'name': {
        this.evalNamed(inputs, selector, output);
        break;
      }
      case 'index': {
        this.evalIndex(inputs, selector, output);
        break;
      }
      case 'wildcard': {
        this.evalWildcard(inputs, selector, output);
        break;
      }
      case 'slice': {
        this.evalSlice(inputs, selector, output);
        break;
      }
      case 'filter': {
        this.evalFilter(inputs, selector, output);
        break;
      }
      case 'recursive-descent': {
        this.evalRecursiveDescent(inputs, selector, output);
        break;
      }
    }
    return output;
  }

  protected evalNamed(inputs: Value[], selector: types.NamedSelector, output: Value[] = []): void {
    const length = inputs.length;
    for (let i = 0; i < length; i++) {
      const input = inputs[i];
      const data = input.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const key = selector.name;
        if (data.hasOwnProperty(key))
          output.push(new Value(input, key, (data as any)[key]));
      }
    }
  }

  protected evalIndex(inputs: Value[], selector: types.IndexSelector, output: Value[] = []): void {
    const length = inputs.length;
    for (let i = 0; i < length; i++) {
      const input = inputs[i];
      const data = input.data;
      if (!Array.isArray(data)) continue;
      let index = selector.index;
      // Handle negative indices
      if (index < 0) {
        index = data.length + index;
      }
      if (index < 0 || index >= data.length) continue;
      const child = data[index];
      if (child === undefined) continue;
      output.push(new Value(input, index, child));
    }
  }

  protected evalWildcard(inputs: Value[], selector: types.WildcardSelector, output: Value[] = []): void {
    const length = inputs.length;
    for (let i = 0; i < length; i++) {
      const input = inputs[i];
      const data = input.data;
      if (Array.isArray(data)) {
        // For arrays, select all elements in order
        for (let j = 0; j < data.length; j++) {
          output.push(new Value(input, j, data[j]));
        }
      } else if (data && typeof data === 'object') {
        // For objects, select all member values (order is not guaranteed per RFC 9535)
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            output.push(new Value(input, key, (data as any)[key]));
          }
        }
      }
      // For primitive values, wildcard selects nothing
    }
  }

  protected evalSlice(inputs: Value[], selector: types.SliceSelector, output: Value[] = []): void {
    const step = selector.step !== undefined ? selector.step : 1;
    
    // Handle step = 0 case (no elements selected per RFC 9535)
    if (step === 0) {
      return;
    }
    
    const length = inputs.length;
    for (let i = 0; i < length; i++) {
      const input = inputs[i];
      const data = input.data;
      if (!Array.isArray(data)) continue;
      
      const len = data.length;
      
      // Determine default start and end based on step direction
      let start: number, end: number;
      if (step >= 0) {
        start = selector.start !== undefined ? selector.start : 0;
        end = selector.end !== undefined ? selector.end : len;
      } else {
        start = selector.start !== undefined ? selector.start : len - 1;
        end = selector.end !== undefined ? selector.end : -len - 1;
      }
      
      // Normalize start and end indices
      const normalizeIndex = (idx: number, length: number): number => {
        return idx >= 0 ? idx : length + idx;
      };
      
      const nStart = normalizeIndex(start, len);
      const nEnd = normalizeIndex(end, len);
      
      // Calculate bounds based on step direction
      let lower: number, upper: number;
      if (step >= 0) {
        lower = Math.min(Math.max(nStart, 0), len);
        upper = Math.min(Math.max(nEnd, 0), len);
      } else {
        upper = Math.min(Math.max(nStart, -1), len - 1);
        lower = Math.min(Math.max(nEnd, -1), len - 1);
      }
      
      // Select elements based on step direction
      if (step > 0) {
        for (let idx = lower; idx < upper; idx += step) {
          output.push(new Value(input, idx, data[idx]));
        }
      } else if (step < 0) {
        for (let idx = upper; idx > lower; idx += step) {
          output.push(new Value(input, idx, data[idx]));
        }
      }
    }
  }

  protected evalFilter(inputs: Value[], selector: types.FilterSelector, output: Value[] = []): void {
    const length = inputs.length;
    for (let i = 0; i < length; i++) {
      const input = inputs[i];
      const data = input.data;
      
      if (Array.isArray(data)) {
        // Filter array elements
        for (let j = 0; j < data.length; j++) {
          const element = data[j];
          const elementValue = new Value(input, j, element);
          if (this.evalFilterExpression(selector.expression, elementValue)) {
            output.push(elementValue);
          }
        }
      } else if (data && typeof data === 'object') {
        // Filter object member values
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const memberValue = (data as any)[key];
            const memberValueNode = new Value(input, key, memberValue);
            if (this.evalFilterExpression(selector.expression, memberValueNode)) {
              output.push(memberValueNode);
            }
          }
        }
      }
      // For primitive values, filter selects nothing
    }
  }

  protected evalRecursiveDescent(inputs: Value[], selector: types.RecursiveDescentSelector, output: Value[] = []): void {
    const length = inputs.length;
    for (let i = 0; i < length; i++) {
      const input = inputs[i];
      // Collect all descendants (including the input node itself)
      const descendants: Value[] = [];
      this.collectDescendants(input, descendants);
      
      // Apply the wrapped selector to all descendants
      this.evalSelector(descendants, selector.selector, output);
    }
  }

  private collectDescendants(node: Value, output: Value[]): void {
    output.push(node);
    const data = node.data;
    
    if (Array.isArray(data)) {
      // Visit array elements in order
      for (let i = 0; i < data.length; i++) {
        const child = new Value(node, i, data[i]);
        this.collectDescendants(child, output);
      }
    } else if (data && typeof data === 'object') {
      // Visit object member values (order not guaranteed)
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const child = new Value(node, key, (data as any)[key]);
          this.collectDescendants(child, output);
        }
      }
    }
    // For primitive values, no children to visit
  }

  private evalFilterExpression(expression: types.FilterExpression, currentNode: Value): boolean {
    // Simplified implementation of filter expression evaluation
    switch (expression.type) {
      case 'comparison':
        return this.evalComparisonExpression(expression, currentNode);
      case 'logical':
        return this.evalLogicalExpression(expression, currentNode);
      case 'existence':
        return this.evalExistenceExpression(expression, currentNode);
      case 'negation':
        return !this.evalFilterExpression(expression.expression, currentNode);
      case 'paren':
        return this.evalFilterExpression(expression.expression, currentNode);
      case 'function':
        return this.evalFunctionExpression(expression, currentNode);
      default:
        return false;
    }
  }

  private evalComparisonExpression(expression: types.ComparisonExpression, currentNode: Value): boolean {
    const leftValue = this.evalValueExpression(expression.left, currentNode);
    const rightValue = this.evalValueExpression(expression.right, currentNode);
    
    switch (expression.operator) {
      case '==':
        return this.compareEqual(leftValue, rightValue);
      case '!=':
        return !this.compareEqual(leftValue, rightValue);
      case '<':
        return this.compareLess(leftValue, rightValue);
      case '<=':
        return this.compareLess(leftValue, rightValue) || this.compareEqual(leftValue, rightValue);
      case '>':
        return this.compareLess(rightValue, leftValue);
      case '>=':
        return this.compareLess(rightValue, leftValue) || this.compareEqual(leftValue, rightValue);
      default:
        return false;
    }
  }

  private evalLogicalExpression(expression: types.LogicalExpression, currentNode: Value): boolean {
    switch (expression.operator) {
      case '&&':
        return this.evalFilterExpression(expression.left, currentNode) && 
               this.evalFilterExpression(expression.right, currentNode);
      case '||':
        return this.evalFilterExpression(expression.left, currentNode) || 
               this.evalFilterExpression(expression.right, currentNode);
      default:
        return false;
    }
  }

  private evalExistenceExpression(expression: types.ExistenceExpression, currentNode: Value): boolean {
    // Evaluate the path from the current node and check if it selects any nodes
    if (!expression.path.segments) return false;
    const evaluator = new JsonPathEval(expression.path, currentNode.data);
    const result = evaluator.eval();
    return result.length > 0;
  }

  private evalFunctionExpression(expression: types.FunctionExpression, currentNode: Value): boolean {
    // Placeholder for function expression evaluation
    return false;
  }

  private evalValueExpression(expression: types.ValueExpression, currentNode: Value): any {
    switch (expression.type) {
      case 'current':
        return currentNode.data;
      case 'root':
        return this.data;
      case 'literal':
        return expression.value;
      case 'path':
        if (!expression.path.segments) return undefined;
        const evaluator = new JsonPathEval(expression.path, currentNode.data);
        const result = evaluator.eval();
        return result.length === 1 ? result[0].data : undefined;
      case 'function':
        // Placeholder for function value expressions
        return undefined;
      default:
        return undefined;
    }
  }

  private compareEqual(left: any, right: any): boolean {
    // Handle empty nodelist/Nothing cases
    if (left === undefined && right === undefined) return true;
    if (left === undefined || right === undefined) return false;
    
    // Strict equality for primitives
    if (left === right) return true;
    
    // Type mismatch
    if (typeof left !== typeof right) return false;
    
    // Array comparison
    if (Array.isArray(left) && Array.isArray(right)) {
      if (left.length !== right.length) return false;
      for (let i = 0; i < left.length; i++) {
        if (!this.compareEqual(left[i], right[i])) return false;
      }
      return true;
    }
    
    // Object comparison
    if (left && right && typeof left === 'object' && typeof right === 'object') {
      const leftKeys = Object.keys(left);
      const rightKeys = Object.keys(right);
      if (leftKeys.length !== rightKeys.length) return false;
      for (const key of leftKeys) {
        if (!rightKeys.includes(key)) return false;
        if (!this.compareEqual(left[key], right[key])) return false;
      }
      return true;
    }
    
    return false;
  }

  private compareLess(left: any, right: any): boolean {
    // Handle empty nodelist/Nothing cases
    if (left === undefined || right === undefined) return false;
    
    // Both numbers
    if (typeof left === 'number' && typeof right === 'number') {
      return left < right;
    }
    
    // Both strings
    if (typeof left === 'string' && typeof right === 'string') {
      return left < right;
    }
    
    // Other types don't support < comparison
    return false;
  }
}
