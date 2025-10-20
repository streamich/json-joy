import {JsonPathParser} from './JsonPathParser';
import {Value} from './Value';
import type * as types from './types';

/**
 * Function signature for JSONPath functions
 */
type JSONPathFunction = (
  args: (types.IValueExpression | types.IFilterExpression | types.IJSONPath)[],
  currentNode: Value,
  evaluator: JsonPathEval,
) => any;

export class JsonPathEval {
  public static run = (path: string | types.IJSONPath, data: unknown): Value[] => {
    let ast: types.IJSONPath;
    if (typeof path === 'string') {
      const parsed = JsonPathParser.parse(path);
      if (!parsed.success || !parsed.path || parsed.error)
        throw new Error(`Invalid JSONPath: ${parsed.error} [position = ${parsed.position}, path = ${path}]`);
      ast = parsed.path;
    } else ast = path;
    const evaluator = new JsonPathEval(ast, data);
    return evaluator.eval();
  };

  /**
   * Function registry for JSONPath functions
   */
  protected readonly funcs = new Map<string, JSONPathFunction>([
    ['length', this.lengthFunction.bind(this)],
    ['count', this.countFunction.bind(this)],
    ['match', this.matchFunction.bind(this)],
    ['search', this.searchFunction.bind(this)],
    ['value', this.valueFunction.bind(this)],
  ]);

  constructor(
    public readonly path: types.IJSONPath,
    public readonly data: unknown,
  ) {}

  eval(): Value[] {
    let input: Value[] = [new Value(null, '$', this.data)];
    let output: Value[] = [];
    const segments = this.path.segments;
    const length = segments.length;
    if (length === 0) return input;
    for (let i = 0; i < length; i++) {
      output = this.evalSegment(input, segments[i]);
      input = output;
    }
    return output;
  }

  evalSegment(input: Value[], segment: types.IPathSegment): Value[] {
    const output: Value[] = [];
    const selectors = segment.selectors;
    const length = selectors.length;
    for (let i = 0; i < length; i++) this.evalSelector(input, selectors[i], output);
    return output;
  }

  evalSelector(inputs: Value[], selector: types.IAnySelector, output: Value[] = []): Value[] {
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

  protected evalNamed(inputs: Value[], selector: types.INamedSelector, output: Value[] = []): void {
    const length = inputs.length;
    for (let i = 0; i < length; i++) {
      const input = inputs[i];
      const data = input.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const key = selector.name;
        // biome-ignore lint: object hasOwnProperty check is intentional, Object.hasOwn is too recent
        if (data.hasOwnProperty(key)) output.push(new Value(input, key, (data as any)[key]));
      }
    }
  }

  protected evalIndex(inputs: Value[], selector: types.IIndexSelector, output: Value[] = []): void {
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

  protected evalWildcard(inputs: Value[], selector: types.IWildcardSelector, output: Value[] = []): void {
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
          // biome-ignore lint: object hasOwnProperty check is intentional, Object.hasOwn is too recent
          if (data.hasOwnProperty(key)) {
            output.push(new Value(input, key, (data as any)[key]));
          }
        }
      }
      // For primitive values, wildcard selects nothing
    }
  }

  protected evalSlice(inputs: Value[], selector: types.ISliceSelector, output: Value[] = []): void {
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

  protected evalFilter(inputs: Value[], selector: types.IFilterSelector, output: Value[] = []): void {
    const length = inputs.length;
    for (let i = 0; i < length; i++) {
      const input = inputs[i];
      const data = input.data;

      // Special case: if this is a root-level filter on a single object,
      // treat the object itself as the element being filtered
      if (input.step === '$' && data && typeof data === 'object' && !Array.isArray(data)) {
        if (this.evalFilterExpression(selector.expression, input)) {
          output.push(input);
        }
      } else if (Array.isArray(data)) {
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
          // biome-ignore lint: object hasOwnProperty check is intentional, Object.hasOwn is too recent
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

  protected evalRecursiveDescent(
    inputs: Value[],
    selector: types.IRecursiveDescentSelector,
    output: Value[] = [],
  ): void {
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
        // biome-ignore lint: object hasOwnProperty check is intentional, Object.hasOwn is too recent
        if (data.hasOwnProperty(key)) {
          const child = new Value(node, key, (data as any)[key]);
          this.collectDescendants(child, output);
        }
      }
    }
    // For primitive values, no children to visit
  }

  private evalFilterExpression(expression: types.IFilterExpression, currentNode: Value): boolean {
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

  private evalComparisonExpression(expression: types.IComparisonExpression, currentNode: Value): boolean {
    const leftValue = this.evalValueExpression(expression.left, currentNode);
    const rightValue = this.evalValueExpression(expression.right, currentNode);

    // JSONPath semantics: comparisons involving Nothing (undefined) evaluate to false,
    // except when both sides are Nothing and operator is equality.
    // BUT: functions can return valid values including 0, false, "", etc. Only treat
    // actual undefined (meaning "no result") as Nothing.
    if (leftValue === undefined || rightValue === undefined) {
      if (expression.operator === '==' && leftValue === undefined && rightValue === undefined) {
        return true;
      }
      return false;
    }

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

  private evalLogicalExpression(expression: types.ILogicalExpression, currentNode: Value): boolean {
    switch (expression.operator) {
      case '&&':
        return (
          this.evalFilterExpression(expression.left, currentNode) &&
          this.evalFilterExpression(expression.right, currentNode)
        );
      case '||':
        return (
          this.evalFilterExpression(expression.left, currentNode) ||
          this.evalFilterExpression(expression.right, currentNode)
        );
      default:
        return false;
    }
  }

  private evalExistenceExpression(expression: types.IExistenceExpression, currentNode: Value): boolean {
    // Evaluate the path from the current node and check if it selects any nodes
    if (!expression.path.segments) return false;
    const evaluator = new JsonPathEval(expression.path, currentNode.data);
    const result = evaluator.eval();
    return result.length > 0;
  }

  private evalFunctionExpression(expression: types.IFunctionExpression, currentNode: Value): boolean {
    const result = this.evaluateFunction(expression, currentNode);

    // Functions in test expressions should return LogicalType
    // If the function returns a value, convert it to boolean
    if (typeof result === 'boolean') {
      return result;
    }

    // For count() and length() returning numbers, convert to boolean (non-zero is true)
    if (typeof result === 'number') {
      return result !== 0;
    }

    // For nodelists, true if non-empty
    if (Array.isArray(result)) {
      return result.length > 0;
    }

    // For other values, check if they exist (not null/undefined)
    return result != null;
  }

  private evalValueExpression(expression: types.IValueExpression, currentNode: Value): any {
    switch (expression.type) {
      case 'current':
        return currentNode.data;
      case 'root':
        return this.data;
      case 'literal':
        return expression.value;
      case 'path': {
        if (!expression.path.segments) return undefined;

        // Evaluate path segments starting from current node
        let currentResults = [currentNode];

        for (const segment of expression.path.segments) {
          currentResults = this.evalSegment(currentResults, segment);
          if (currentResults.length === 0) break; // No results, early exit
        }

        // For function arguments, we want the actual data, not Value objects
        return currentResults.map((v) => v.data);
      }
      case 'function':
        return this.evaluateFunction(expression, currentNode);
      default:
        return undefined;
    }
  }

  private compareEqual(left: any, right: any): boolean {
    // Handle empty nodelist/Nothing cases
    if (left === undefined && right === undefined) return true;
    if (left === undefined || right === undefined) return false;

    // Auto-unwrap single-element arrays for comparison (JSONPath behavior)
    if (Array.isArray(left) && left.length === 1) left = left[0];
    if (Array.isArray(right) && right.length === 1) right = right[0];

    // After unwrapping, check for undefined again
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

    // Auto-unwrap single-element arrays for comparison (JSONPath behavior)
    if (Array.isArray(left) && left.length === 1) left = left[0];
    if (Array.isArray(right) && right.length === 1) right = right[0];

    // After unwrapping, check for undefined again
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

  /**
   * Evaluate a function expression according to RFC 9535
   * Uses the function registry for extensible function support
   */
  private evaluateFunction(expression: types.IFunctionExpression, currentNode: Value): any {
    const {name, args} = expression;

    const func = this.funcs.get(name);
    if (func) {
      return func(args, currentNode, this);
    }

    // Unknown function - return false for logical context, undefined for value context
    return false;
  }

  /**
   * length() function - returns the length of strings, arrays, or objects
   * Parameters: ValueType
   * Result: ValueType (unsigned integer or Nothing)
   */
  private lengthFunction(
    args: (types.IValueExpression | types.IFilterExpression | types.IJSONPath)[],
    currentNode: Value,
    evaluator: JsonPathEval,
  ): number | undefined {
    if (args.length !== 1) return undefined;

    const [arg] = args;
    const result = this.getValueFromArg(arg, currentNode, evaluator);

    // For length() function, we need the single value
    let value: any;
    if (Array.isArray(result)) {
      value = result.length === 1 ? result[0] : undefined;
    } else {
      value = result;
    }

    if (typeof value === 'string') {
      // Count Unicode scalar values
      return [...value].length;
    }
    if (Array.isArray(value)) {
      return value.length;
    }
    if (value && typeof value === 'object' && value !== null) {
      return Object.keys(value).length;
    }

    return undefined; // Nothing for other types
  }

  /**
   * count() function - returns the number of nodes in a nodelist
   * Parameters: NodesType
   * Result: ValueType (unsigned integer)
   */
  private countFunction(
    args: (types.IValueExpression | types.IFilterExpression | types.IJSONPath)[],
    currentNode: Value,
    evaluator: JsonPathEval,
  ): number {
    if (args.length !== 1) return 0;

    const [arg] = args;
    const result = this.getValueFromArg(arg, currentNode, evaluator);

    // Count logic based on RFC 9535:
    // For count(), we count the number of nodes selected by the expression
    if (Array.isArray(result)) {
      return result.length;
    } else if (result === undefined) {
      return 0;
    } else {
      // Single value = 1 node selected
      return 1;
    }
  }

  /**
   * match() function - tests if a string matches a regular expression (full match)
   * Parameters: ValueType (string), ValueType (string conforming to RFC9485)
   * Result: LogicalType
   */
  private matchFunction(
    args: (types.IValueExpression | types.IFilterExpression | types.IJSONPath)[],
    currentNode: Value,
    evaluator: JsonPathEval,
  ): boolean {
    if (args.length !== 2) return false;

    const [stringArg, regexArg] = args;

    const strResult = this.getValueFromArg(stringArg, currentNode, evaluator);
    const regexResult = this.getValueFromArg(regexArg, currentNode, evaluator);

    // Handle array results (get single value)
    const str = Array.isArray(strResult) ? (strResult.length === 1 ? strResult[0] : undefined) : strResult;
    const regex = Array.isArray(regexResult) ? (regexResult.length === 1 ? regexResult[0] : undefined) : regexResult;

    if (typeof str !== 'string' || typeof regex !== 'string') {
      return false;
    }

    try {
      // RFC 9485 I-Regexp is a subset of JavaScript regex
      const regExp = new RegExp(`^${regex}$`);
      return regExp.test(str);
    } catch {
      return false;
    }
  }

  /**
   * search() function - tests if a string contains a substring matching a regular expression
   * Parameters: ValueType (string), ValueType (string conforming to RFC9485)
   * Result: LogicalType
   */
  private searchFunction(
    args: (types.IValueExpression | types.IFilterExpression | types.IJSONPath)[],
    currentNode: Value,
    evaluator: JsonPathEval,
  ): boolean {
    if (args.length !== 2) return false;

    const [stringArg, regexArg] = args;

    const strResult = this.getValueFromArg(stringArg, currentNode, evaluator);
    const regexResult = this.getValueFromArg(regexArg, currentNode, evaluator);

    // Handle array results (get single value)
    const str = Array.isArray(strResult) ? (strResult.length === 1 ? strResult[0] : undefined) : strResult;
    const regex = Array.isArray(regexResult) ? (regexResult.length === 1 ? regexResult[0] : undefined) : regexResult;

    if (typeof str !== 'string' || typeof regex !== 'string') {
      return false;
    }

    try {
      // RFC 9485 I-Regexp is a subset of JavaScript regex
      const regExp = new RegExp(regex);
      return regExp.test(str);
    } catch {
      return false;
    }
  }

  /**
   * value() function - converts a nodelist to a single value
   * Parameters: NodesType
   * Result: ValueType
   */
  private valueFunction(
    args: (types.IValueExpression | types.IFilterExpression | types.IJSONPath)[],
    currentNode: Value,
    evaluator: JsonPathEval,
  ): any {
    if (args.length !== 1) return undefined;

    const [nodeArg] = args;
    const result = this.getValueFromArg(nodeArg, currentNode, evaluator);

    // For value() function, return single value if exactly one result,
    // otherwise undefined (following RFC 9535 value() semantics)
    if (Array.isArray(result)) {
      return result.length === 1 ? result[0] : undefined;
    } else {
      return result;
    }
  }

  /**
   * Helper to get value from function argument
   */
  private getValueFromArg(
    arg: types.IValueExpression | types.IFilterExpression | types.IJSONPath,
    currentNode: Value,
    evaluator: JsonPathEval,
  ): any {
    if (this.isValueExpression(arg)) {
      return evaluator.evalValueExpression(arg, currentNode);
    } else if (this.isJSONPath(arg)) {
      // Regular $ expression - evaluate from root
      const evalInstance = new JsonPathEval(arg, currentNode.data);
      const result = evalInstance.eval();
      return result.length === 1 ? result[0].data : undefined;
    }
    return undefined;
  }

  /**
   * Type guard for ValueExpression
   */
  private isValueExpression(arg: any): arg is types.IValueExpression {
    return arg && typeof arg === 'object' && ['current', 'root', 'literal', 'path', 'function'].includes(arg.type);
  }

  /**
   * Type guard for JSONPath
   */
  private isJSONPath(arg: any): arg is types.IJSONPath {
    return arg && typeof arg === 'object' && Array.isArray(arg.segments);
  }
}
