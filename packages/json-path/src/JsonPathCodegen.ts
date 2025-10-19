import {Value} from './Value';
import {JsonPathParser} from './JsonPathParser';
import type * as types from './types';
import {Codegen} from '@jsonjoy.com/codegen';

export type JsonPathCompiledFn = (data: unknown) => Value[];

export class JsonPathCodegen {
  public static run = (path: string | types.IJSONPath, data: unknown): Value[] => {
    let ast: types.IJSONPath;
    if (typeof path === 'string') {
      const parsed = JsonPathParser.parse(path);
      if (!parsed.success || !parsed.path || parsed.error)
        throw new Error(`Invalid JSONPath: ${parsed.error} [position = ${parsed.position}, path = ${path}]`);
      ast = parsed.path;
    } else ast = path;
    const codegen = new JsonPathCodegen(ast);
    const fn = codegen.compile();
    return fn(data);
  };

  protected readonly codegen: Codegen<JsonPathCompiledFn>;

  constructor(protected readonly path: types.IJSONPath) {
    this.codegen = new Codegen<JsonPathCompiledFn>({
      args: ['data'],
      name: 'jsonpath',
      linkable: {Value},
    });
  }

  public compile(): JsonPathCompiledFn {
    const codegen = this.codegen;
    codegen.link('Value');

    // Initialize with root value
    codegen.js('var input = [new Value(null, "$", data)];');
    codegen.js('var output = [];');

    // Process each segment
    const segments = this.path.segments;
    for (let i = 0; i < segments.length; i++) {
      this.generateSegment(segments[i], 'input', 'output');
      if (i < segments.length - 1) {
        codegen.js('input = output;');
        codegen.js('output = [];');
      }
    }

    codegen.js('return output;');

    return this.codegen.compile();
  }

  protected generateSegment(segment: types.IPathSegment, inputVar: string, outputVar: string): void {
    const selectors = segment.selectors;
    for (let i = 0; i < selectors.length; i++) {
      this.generateSelector(selectors[i], inputVar, outputVar);
    }
  }

  protected generateSelector(selector: types.IAnySelector, inputVar: string, outputVar: string): void {
    switch (selector.type) {
      case 'name':
        this.generateNamedSelector(selector, inputVar, outputVar);
        break;
      case 'index':
        this.generateIndexSelector(selector, inputVar, outputVar);
        break;
      case 'wildcard':
        this.generateWildcardSelector(selector, inputVar, outputVar);
        break;
      case 'slice':
        this.generateSliceSelector(selector, inputVar, outputVar);
        break;
      case 'filter':
        this.generateFilterSelector(selector, inputVar, outputVar);
        break;
      case 'recursive-descent':
        this.generateRecursiveDescentSelector(selector, inputVar, outputVar);
        break;
    }
  }

  protected generateNamedSelector(
    selector: types.INamedSelector,
    inputVar: string,
    outputVar: string,
  ): void {
    const codegen = this.codegen;
    const iVar = codegen.r();
    const inputNodeVar = codegen.r();
    const dataVar = codegen.r();
    const keyVar = codegen.r();
    codegen.js(`var ${keyVar} = ${JSON.stringify(selector.name)};`);
    codegen.js(`for (var ${iVar} = 0; ${iVar} < ${inputVar}.length; ${iVar}++) {`);
    codegen.js(`var ${inputNodeVar} = ${inputVar}[${iVar}];`);
    codegen.js(`var ${dataVar} = ${inputNodeVar}.data;`);
    codegen.js(`if (${dataVar} && typeof ${dataVar} === 'object' && !Array.isArray(${dataVar})) {`);
    codegen.js(`if (${dataVar}.hasOwnProperty(${keyVar})) {`);
    codegen.js(`${outputVar}.push(new Value(${inputNodeVar}, ${keyVar}, ${dataVar}[${keyVar}]));`);
    codegen.js(`}`);
    codegen.js(`}`);
    codegen.js(`}`);
  }

  protected generateIndexSelector(
    selector: types.IIndexSelector,
    inputVar: string,
    outputVar: string,
  ): void {
    const codegen = this.codegen;
    const iVar = codegen.r();
    const inputNodeVar = codegen.r();
    const dataVar = codegen.r();
    const indexVar = codegen.r();
    codegen.js(`for (var ${iVar} = 0; ${iVar} < ${inputVar}.length; ${iVar}++) {`);
    codegen.js(`var ${inputNodeVar} = ${inputVar}[${iVar}];`);
    codegen.js(`var ${dataVar} = ${inputNodeVar}.data;`);
    codegen.js(`if (Array.isArray(${dataVar})) {`);
    codegen.js(`var ${indexVar} = ${selector.index};`);
    codegen.js(`if (${indexVar} < 0) ${indexVar} = ${dataVar}.length + ${indexVar};`);
    codegen.js(`if (${indexVar} >= 0 && ${indexVar} < ${dataVar}.length) {`);
    codegen.js(`var child = ${dataVar}[${indexVar}];`);
    codegen.js(`if (child !== undefined) {`);
    codegen.js(`${outputVar}.push(new Value(${inputNodeVar}, ${indexVar}, child));`);
    codegen.js(`}`);
    codegen.js(`}`);
    codegen.js(`}`);
    codegen.js(`}`);
  }

  protected generateWildcardSelector(
    selector: types.IWildcardSelector,
    inputVar: string,
    outputVar: string,
  ): void {
    const codegen = this.codegen;
    const iVar = codegen.r();
    const inputNodeVar = codegen.r();
    const dataVar = codegen.r();
    const jVar = codegen.r();
    const keyVar = codegen.r();

    codegen.js(`for (var ${iVar} = 0; ${iVar} < ${inputVar}.length; ${iVar}++) {`);
    codegen.js(`var ${inputNodeVar} = ${inputVar}[${iVar}];`);
    codegen.js(`var ${dataVar} = ${inputNodeVar}.data;`);
    codegen.js(`if (Array.isArray(${dataVar})) {`);
    codegen.js(`for (var ${jVar} = 0; ${jVar} < ${dataVar}.length; ${jVar}++) {`);
    codegen.js(`${outputVar}.push(new Value(${inputNodeVar}, ${jVar}, ${dataVar}[${jVar}]));`);
    codegen.js(`}`);
    codegen.js(`} else if (${dataVar} && typeof ${dataVar} === 'object') {`);
    codegen.js(`for (var ${keyVar} in ${dataVar}) {`);
    codegen.js(`if (${dataVar}.hasOwnProperty(${keyVar})) {`);
    codegen.js(`${outputVar}.push(new Value(${inputNodeVar}, ${keyVar}, ${dataVar}[${keyVar}]));`);
    codegen.js(`}`);
    codegen.js(`}`);
    codegen.js(`}`);
    codegen.js(`}`);
  }

  protected generateSliceSelector(
    selector: types.ISliceSelector,
    inputVar: string,
    outputVar: string,
  ): void {
    const codegen = this.codegen;
    const step = selector.step !== undefined ? selector.step : 1;

    // Handle step = 0 case
    if (step === 0) {
      return;
    }

    const iVar = codegen.r();
    const inputNodeVar = codegen.r();
    const dataVar = codegen.r();
    const lenVar = codegen.r();
    const startVar = codegen.r();
    const endVar = codegen.r();
    const nStartVar = codegen.r();
    const nEndVar = codegen.r();
    const lowerVar = codegen.r();
    const upperVar = codegen.r();
    const idxVar = codegen.r();

    codegen.js(`for (var ${iVar} = 0; ${iVar} < ${inputVar}.length; ${iVar}++) {`);
    codegen.js(`var ${inputNodeVar} = ${inputVar}[${iVar}];`);
    codegen.js(`var ${dataVar} = ${inputNodeVar}.data;`);
    codegen.js(`if (Array.isArray(${dataVar})) {`);
    codegen.js(`var ${lenVar} = ${dataVar}.length;`);

    // Determine default start and end
    if (step >= 0) {
      codegen.js(`var ${startVar} = ${selector.start !== undefined ? selector.start : 0};`);
      codegen.js(`var ${endVar} = ${selector.end !== undefined ? selector.end : lenVar};`);
    } else {
      codegen.js(`var ${startVar} = ${selector.start !== undefined ? selector.start : `${lenVar} - 1`};`);
      codegen.js(`var ${endVar} = ${selector.end !== undefined ? selector.end : `-${lenVar} - 1`};`);
    }

    // Normalize indices
    codegen.js(`var ${nStartVar} = ${startVar} >= 0 ? ${startVar} : ${lenVar} + ${startVar};`);
    codegen.js(`var ${nEndVar} = ${endVar} >= 0 ? ${endVar} : ${lenVar} + ${endVar};`);

    // Calculate bounds
    if (step > 0) {
      codegen.js(
        `var ${lowerVar} = Math.min(Math.max(${nStartVar}, 0), ${lenVar});`,
      );
      codegen.js(
        `var ${upperVar} = Math.min(Math.max(${nEndVar}, 0), ${lenVar});`,
      );
      codegen.js(`for (var ${idxVar} = ${lowerVar}; ${idxVar} < ${upperVar}; ${idxVar} += ${step}) {`);
      codegen.js(`${outputVar}.push(new Value(${inputNodeVar}, ${idxVar}, ${dataVar}[${idxVar}]));`);
      codegen.js(`}`);
    } else {
      codegen.js(
        `var ${upperVar} = Math.min(Math.max(${nStartVar}, -1), ${lenVar} - 1);`,
      );
      codegen.js(
        `var ${lowerVar} = Math.min(Math.max(${nEndVar}, -1), ${lenVar} - 1);`,
      );
      codegen.js(`for (var ${idxVar} = ${upperVar}; ${idxVar} > ${lowerVar}; ${idxVar} += ${step}) {`);
      codegen.js(`${outputVar}.push(new Value(${inputNodeVar}, ${idxVar}, ${dataVar}[${idxVar}]));`);
      codegen.js(`}`);
    }

    codegen.js(`}`);
    codegen.js(`}`);
  }

  protected generateFilterSelector(
    selector: types.IFilterSelector,
    inputVar: string,
    outputVar: string,
  ): void {
    const codegen = this.codegen;
    const iVar = codegen.r();
    const inputNodeVar = codegen.r();
    const dataVar = codegen.r();
    const jVar = codegen.r();
    const elementVar = codegen.r();
    const elementValueVar = this.codegen.r();
    const keyVar = this.codegen.r();
    const memberValueVar = this.codegen.r();
    const memberValueNodeVar = this.codegen.r();

    codegen.js(`for (var ${iVar} = 0; ${iVar} < ${inputVar}.length; ${iVar}++) {`);
    codegen.js(`var ${inputNodeVar} = ${inputVar}[${iVar}];`);
    codegen.js(`var ${dataVar} = ${inputNodeVar}.data;`);

    // Special case: root-level filter on single object
    codegen.js(`if (${inputNodeVar}.step === "$" && ${dataVar} && typeof ${dataVar} === "object" && !Array.isArray(${dataVar})) {`);
    const filterFn1 = this.generateFilterExpression(selector.expression, inputNodeVar);
    codegen.js(`if (${filterFn1}) {`);
    codegen.js(`${outputVar}.push(${inputNodeVar});`);
    codegen.js(`}`);

    // Array elements
    codegen.js(`} else if (Array.isArray(${dataVar})) {`);
    codegen.js(`for (var ${jVar} = 0; ${jVar} < ${dataVar}.length; ${jVar}++) {`);
    codegen.js(`var ${elementVar} = ${dataVar}[${jVar}];`);
    codegen.js(`var ${elementValueVar} = new Value(${inputNodeVar}, ${jVar}, ${elementVar});`);
    const filterFn2 = this.generateFilterExpression(selector.expression, elementValueVar);
    codegen.js(`if (${filterFn2}) {`);
    codegen.js(`${outputVar}.push(${elementValueVar});`);
    codegen.js(`}`);
    codegen.js(`}`);

    // Object member values
    codegen.js(`} else if (${dataVar} && typeof ${dataVar} === "object") {`);
    codegen.js(`for (var ${keyVar} in ${dataVar}) {`);
    codegen.js(`if (${dataVar}.hasOwnProperty(${keyVar})) {`);
    codegen.js(`var ${memberValueVar} = ${dataVar}[${keyVar}];`);
    codegen.js(`var ${memberValueNodeVar} = new Value(${inputNodeVar}, ${keyVar}, ${memberValueVar});`);
    const filterFn3 = this.generateFilterExpression(selector.expression, memberValueNodeVar);
    codegen.js(`if (${filterFn3}) {`);
    codegen.js(`${outputVar}.push(${memberValueNodeVar});`);
    codegen.js(`}`);
    codegen.js(`}`);
    codegen.js(`}`);
    codegen.js(`}`);

    codegen.js(`}`);
  }

  protected generateFilterExpression(expression: types.IFilterExpression, currentNodeVar: string): string {
    switch (expression.type) {
      case 'comparison':
        return this.generateComparisonExpression(expression, currentNodeVar);
      case 'logical':
        return this.generateLogicalExpression(expression, currentNodeVar);
      case 'existence':
        return this.generateExistenceExpression(expression, currentNodeVar);
      case 'negation':
        return `!(${this.generateFilterExpression(expression.expression, currentNodeVar)})`;
      case 'paren':
        return `(${this.generateFilterExpression(expression.expression, currentNodeVar)})`;
      case 'function':
        return this.generateFunctionExpression(expression, currentNodeVar, true);
      default:
        return 'false';
    }
  }

  protected generateComparisonExpression(
    expression: types.IComparisonExpression,
    currentNodeVar: string,
  ): string {
    const leftVar = this.generateValueExpression(expression.left, currentNodeVar);
    const rightVar = this.generateValueExpression(expression.right, currentNodeVar);
    const codegen = this.codegen;
    const resultVar = codegen.r();

    codegen.js(`var ${resultVar} = (function() {`);
    codegen.js(`var left = ${leftVar};`);
    codegen.js(`var right = ${rightVar};`);

    // Handle undefined/Nothing cases
    codegen.js(`if (left === undefined || right === undefined) {`);
    codegen.js(`if (${JSON.stringify(expression.operator)} === "==" && left === undefined && right === undefined) return true;`);
    codegen.js(`return false;`);
    codegen.js(`}`);

    // Generate comparison based on operator
    switch (expression.operator) {
      case '==':
        codegen.js(`return ${this.generateCompareEqual('left', 'right')};`);
        break;
      case '!=':
        codegen.js(`return !(${this.generateCompareEqual('left', 'right')});`);
        break;
      case '<':
        codegen.js(`return ${this.generateCompareLess('left', 'right')};`);
        break;
      case '<=':
        codegen.js(`return ${this.generateCompareLess('left', 'right')} || ${this.generateCompareEqual('left', 'right')};`);
        break;
      case '>':
        codegen.js(`return ${this.generateCompareLess('right', 'left')};`);
        break;
      case '>=':
        codegen.js(`return ${this.generateCompareLess('right', 'left')} || ${this.generateCompareEqual('left', 'right')};`);
        break;
    }

    codegen.js(`})();`);

    return resultVar;
  }

  protected generateCompareEqual(leftVar: string, rightVar: string): string {
    const fnName = this.codegen.r();
    const codegen = this.codegen;
    codegen.js(`var ${fnName} = function(left, right) {`);
    codegen.js(`if (left === undefined && right === undefined) return true;`);
    codegen.js(`if (left === undefined || right === undefined) return false;`);
    codegen.js(`if (Array.isArray(left) && left.length === 1) left = left[0];`);
    codegen.js(`if (Array.isArray(right) && right.length === 1) right = right[0];`);
    codegen.js(`if (left === undefined || right === undefined) return false;`);
    codegen.js(`if (left === right) return true;`);
    codegen.js(`if (typeof left !== typeof right) return false;`);
    codegen.js(`if (Array.isArray(left) && Array.isArray(right)) {`);
    codegen.js(`if (left.length !== right.length) return false;`);
    codegen.js(`for (var i = 0; i < left.length; i++) {`);
    codegen.js(`if (!${fnName}(left[i], right[i])) return false;`);
    codegen.js(`}`);
    codegen.js(`return true;`);
    codegen.js(`}`);
    codegen.js(`if (left && right && typeof left === "object" && typeof right === "object") {`);
    codegen.js(`var leftKeys = Object.keys(left);`);
    codegen.js(`var rightKeys = Object.keys(right);`);
    codegen.js(`if (leftKeys.length !== rightKeys.length) return false;`);
    codegen.js(`for (var i = 0; i < leftKeys.length; i++) {`);
    codegen.js(`var key = leftKeys[i];`);
    codegen.js(`if (rightKeys.indexOf(key) === -1) return false;`);
    codegen.js(`if (!${fnName}(left[key], right[key])) return false;`);
    codegen.js(`}`);
    codegen.js(`return true;`);
    codegen.js(`}`);
    codegen.js(`return false;`);
    codegen.js(`};`);

    return `${fnName}(${leftVar}, ${rightVar})`;
  }

  protected generateCompareLess(leftVar: string, rightVar: string): string {
    const codegen = this.codegen;
    const fnName = this.codegen.r();
    codegen.js(`var ${fnName} = function(left, right) {`);
    codegen.js(`if (left === undefined || right === undefined) return false;`);
    codegen.js(`if (Array.isArray(left) && left.length === 1) left = left[0];`);
    codegen.js(`if (Array.isArray(right) && right.length === 1) right = right[0];`);
    codegen.js(`if (left === undefined || right === undefined) return false;`);
    codegen.js(`if (typeof left === "number" && typeof right === "number") return left < right;`);
    codegen.js(`if (typeof left === "string" && typeof right === "string") return left < right;`);
    codegen.js(`return false;`);
    codegen.js(`};`);
    return `${fnName}(${leftVar}, ${rightVar})`;
  }

  protected generateLogicalExpression(
    expression: types.ILogicalExpression,
    currentNodeVar: string,
  ): string {
    const leftExpr = this.generateFilterExpression(expression.left, currentNodeVar);
    const rightExpr = this.generateFilterExpression(expression.right, currentNodeVar);

    if (expression.operator === '&&') {
      return `(${leftExpr} && ${rightExpr})`;
    } else {
      return `(${leftExpr} || ${rightExpr})`;
    }
  }

  protected generateExistenceExpression(
    expression: types.IExistenceExpression,
    currentNodeVar: string,
  ): string {
    const codegen = this.codegen;
    const resultVar = codegen.r();

    // Create a mini evaluator for the existence test
    const tempCodegen = new JsonPathCodegen(expression.path);
    const existenceFn = tempCodegen.compile();
    const existenceFnVar = codegen.linkDependency(existenceFn);

    codegen.js(`var ${resultVar} = ${existenceFnVar}(${currentNodeVar}.data).length > 0;`);
    return resultVar;
  }

  protected generateFunctionExpression(
    expression: types.IFunctionExpression,
    currentNodeVar: string,
    asLogical: boolean,
  ): string {
    const codegen = this.codegen;
    const resultVar = codegen.r();

    // Link the function implementations
    switch (expression.name) {
      case 'length':
        codegen.js(`var ${resultVar} = (function() {`);
        if (expression.args.length !== 1) {
          codegen.js(`return undefined;`);
        } else {
          const argVar = this.generateFunctionArg(expression.args[0], currentNodeVar);
          codegen.js(`var value = ${argVar};`);
          codegen.js(`if (Array.isArray(value)) value = value.length === 1 ? value[0] : undefined;`);
          codegen.js(`if (typeof value === "string") return [...value].length;`);
          codegen.js(`if (Array.isArray(value)) return value.length;`);
          codegen.js(`if (value && typeof value === "object" && value !== null) return Object.keys(value).length;`);
          codegen.js(`return undefined;`);
        }
        codegen.js(`})();`);
        break;

      case 'count':
        codegen.js(`var ${resultVar} = (function() {`);
        if (expression.args.length !== 1) {
          codegen.js(`return 0;`);
        } else {
          const argVar = this.generateFunctionArg(expression.args[0], currentNodeVar);
          codegen.js(`var result = ${argVar};`);
          codegen.js(`if (Array.isArray(result)) return result.length;`);
          codegen.js(`if (result === undefined) return 0;`);
          codegen.js(`return 1;`);
        }
        codegen.js(`})();`);
        break;

      case 'match':
      case 'search':
        codegen.js(`var ${resultVar} = (function() {`);
        if (expression.args.length !== 2) {
          codegen.js(`return false;`);
        } else {
          const arg1Var = this.generateFunctionArg(expression.args[0], currentNodeVar);
          const arg2Var = this.generateFunctionArg(expression.args[1], currentNodeVar);
          codegen.js(`var str = ${arg1Var};`);
          codegen.js(`var regex = ${arg2Var};`);
          codegen.js(`if (Array.isArray(str)) str = str.length === 1 ? str[0] : undefined;`);
          codegen.js(`if (Array.isArray(regex)) regex = regex.length === 1 ? regex[0] : undefined;`);
          codegen.js(`if (typeof str !== "string" || typeof regex !== "string") return false;`);
          codegen.js(`try {`);
          if (expression.name === 'match') {
            codegen.js(`var regExp = new RegExp("^" + regex + "$");`);
          } else {
            codegen.js(`var regExp = new RegExp(regex);`);
          }
          codegen.js(`return regExp.test(str);`);
          codegen.js(`} catch (e) {`);
          codegen.js(`return false;`);
          codegen.js(`}`);
        }
        codegen.js(`})();`);
        break;

      case 'value':
        codegen.js(`var ${resultVar} = (function() {`);
        if (expression.args.length !== 1) {
          codegen.js(`return undefined;`);
        } else {
          const argVar = this.generateFunctionArg(expression.args[0], currentNodeVar);
          codegen.js(`var result = ${argVar};`);
          codegen.js(`if (Array.isArray(result)) return result.length === 1 ? result[0] : undefined;`);
          codegen.js(`return result;`);
        }
        codegen.js(`})();`);
        break;

      default:
        codegen.js(`var ${resultVar} = false;`);
        break;
    }

    // Convert to logical if needed
    if (asLogical) {
      const logicalVar = this.codegen.r();
      codegen.js(`var ${logicalVar} = (function() {`);
      codegen.js(`var result = ${resultVar};`);
      codegen.js(`if (typeof result === "boolean") return result;`);
      codegen.js(`if (typeof result === "number") return result !== 0;`);
      codegen.js(`if (Array.isArray(result)) return result.length > 0;`);
      codegen.js(`return result != null;`);
      codegen.js(`})();`);
      return logicalVar;
    }

    return resultVar;
  }

  protected generateFunctionArg(
    arg: types.IValueExpression | types.IFilterExpression | types.IJSONPath,
    currentNodeVar: string,
  ): string {
    const codegen = this.codegen;
    // Check if it's a JSONPath (has segments property)
    if ('segments' in arg) {
      const tempCodegen = new JsonPathCodegen(arg as types.IJSONPath);
      const argFn = tempCodegen.compile();
      const argFnVar = this.codegen.linkDependency(argFn);
      const resultVar = codegen.r();
      codegen.js(`var ${resultVar} = ${argFnVar}(${currentNodeVar}.data).map(function(v) { return v.data; });`);
      return resultVar;
    }

    // Otherwise it's a value expression
    return this.generateValueExpression(arg as types.IValueExpression, currentNodeVar);
  }

  protected generateValueExpression(expression: types.IValueExpression, currentNodeVar: string): string {
    const codegen = this.codegen;
    switch (expression.type) {
      case 'current':
        return `${currentNodeVar}.data`;

      case 'root':
        return 'data';

      case 'literal':
        return JSON.stringify(expression.value);

      case 'path': {
        const tempCodegen = new JsonPathCodegen(expression.path);
        const pathFn = tempCodegen.compile();
        const pathFnVar = this.codegen.linkDependency(pathFn);
        const resultVar = this.codegen.r();
        codegen.js(`var ${resultVar} = ${pathFnVar}(${currentNodeVar}.data).map(function(v) { return v.data; });`);
        return resultVar;
      }

      case 'function':
        return this.generateFunctionExpression(expression, currentNodeVar, false);

      default:
        return 'undefined';
    }
  }

  protected generateRecursiveDescentSelector(
    selector: types.IRecursiveDescentSelector,
    inputVar: string,
    outputVar: string,
  ): void {
    const codegen = this.codegen;
    const iVar = codegen.r();
    const inputNodeVar = codegen.r();
    const descendantsVar = codegen.r();

    codegen.js(`for (var ${iVar} = 0; ${iVar} < ${inputVar}.length; ${iVar}++) {`);
    codegen.js(`var ${inputNodeVar} = ${inputVar}[${iVar}];`);
    codegen.js(`var ${descendantsVar} = [];`);
    
    // Collect descendants
    this.generateCollectDescendants(inputNodeVar, descendantsVar);

    // Apply wrapped selector to descendants
    this.generateSelector(selector.selector, descendantsVar, outputVar);

    codegen.js(`}`);
  }

  protected generateCollectDescendants(nodeVar: string, outputVar: string): void {
    const codegen = this.codegen;
    const fnName = codegen.r();
    codegen.js(`var ${fnName} = function(node, output) {`);
    codegen.js(`output.push(node);`);
    codegen.js(`var data = node.data;`);
    codegen.js(`if (Array.isArray(data)) {`);
    codegen.js(`for (var i = 0; i < data.length; i++) {`);
    codegen.js(`var child = new Value(node, i, data[i]);`);
    codegen.js(`${fnName}(child, output);`);
    codegen.js(`}`);
    codegen.js(`} else if (data && typeof data === "object") {`);
    codegen.js(`for (var key in data) {`);
    codegen.js(`if (data.hasOwnProperty(key)) {`);
    codegen.js(`var child = new Value(node, key, data[key]);`);
    codegen.js(`${fnName}(child, output);`);
    codegen.js(`}`);
    codegen.js(`}`);
    codegen.js(`}`);
    codegen.js(`};`);
    codegen.js(`${fnName}(${nodeVar}, ${outputVar});`);
  }
}
