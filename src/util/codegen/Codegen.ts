import {compileClosure} from '.';
import type {JavaScriptLinked} from './types';

/**
 * Inline JavaScript statements that are executed in main function body.
 */
export class CodegenStepExecJs {
  constructor(public readonly js: string) {}
}

/**
 * A step can be `CodegenStepExecJs` or some application specific step, which
 * will later will need to be converted to `CodegenStepExecJs`.
 */
type JsonSerializerStep = CodegenStepExecJs | unknown;

/**
 * Configuration options for {@link Codegen} instances.
 */
export interface CodegenOptions<Linkable = Record<string, unknown>> {
  /**
   * Inline JavaScript string that represents the arguments that will be passed
   * to the main function body. Defaults to "r0", i.e. the first register.
   */
  args?: string[];

  /**
   * Name of the generated function.
   */
  name?: string;

  /**
   * Inline JavaScript statements, that execute at the beginning of the main
   * function body.
   */
  prologue?: string;

  /**
   * Inline JavaScript statements, that execute at the end of the main
   * function body.
   */
  epilogue?: string | (() => string);

  /**
   * Converts all steps to `CodegenStepExecJs`.
   */
  processSteps?: (steps: JsonSerializerStep[]) => CodegenStepExecJs[];

  /**
   * Predefined list of dependencies that can be linked on demand. Dependency is
   * linked with the name of the property and is linked only once.
   */
  linkable?: Linkable;
}

export type CodegenGenerateOptions = Pick<CodegenOptions, 'name' | 'args' | 'prologue' | 'epilogue'>;

/**
 * A helper class which helps with building JavaScript code for a single
 * function. It keeps track of external dependencies, internally generated
 * constants, and execution steps, which at the end are all converted to
 * to an executable JavaScript function.
 *
 * The final output is a JavaScript function enclosed in a closure:
 *
 * ```js
 * (function(d1, d2, d3) {
 *   var c1 = something;
 *   var c2 = something;
 *   var c3 = something;
 *   return function(r0) {
 *     var r1 = something;
 *     var r2 = something;
 *     var r3 = something;
 *     return something;
 *   }
 * })
 * ```
 *
 * Where `d*` are the external dependencies, `c*` are the internal constants,
 * and `r*` are the local immutable infinite registers.
 */
export class Codegen<
  Fn extends (...deps: any[]) => any = (...deps: unknown[]) => unknown,
  Linkable = Record<string, unknown>,
> {
  /** @ignore */
  protected steps: JsonSerializerStep[] = [];

  /** @ignore */
  public options: Required<CodegenOptions<Linkable>>;

  constructor(opts: CodegenOptions<Linkable>) {
    this.options = {
      args: ['r0'],
      name: '',
      prologue: '',
      epilogue: '',
      processSteps: (steps) => steps.filter((step) => step instanceof CodegenStepExecJs) as CodegenStepExecJs[],
      linkable: {} as Linkable,
      ...opts,
    };
    this.registerCounter = this.options.args.length;
  }

  /**
   * Add one or more JavaScript statements to the main function body.
   */
  public js(js: string): void {
    this.steps.push(new CodegenStepExecJs(js));
  }

  public var(expression?: string): string {
    const r = this.getRegister();
    if (expression) this.js('var ' + r + ' = ' + expression + ';');
    else this.js('var ' + r + ';');
    return r;
  }

  public if(condition: string, then: () => void, otherwise?: () => void): void {
    this.js('if (' + condition + ') {');
    then();
    if (otherwise) {
      this.js('} else {');
      otherwise();
    }
    this.js('}');
  }

  public switch(
    expression: string,
    cases: [match: string | number | boolean | null, block: () => void, noBreak?: boolean][],
    def?: () => void,
  ): void {
    this.js('switch (' + expression + ') {');
    for (const [match, block, noBreak] of cases) {
      this.js('case ' + match + ': {');
      block();
      if (!noBreak) this.js('break;');
      this.js('}');
    }
    if (def) {
      this.js('default: {');
      def();
      this.js('}');
    }
    this.js('}');
  }

  public return(expression: string): void {
    this.js('return ' + expression + ';');
  }

  /**
   * Add any application specific execution step. Steps of `unknown` type
   * later need to converted to `CodegenStepExecJs` steps in the `.processStep`
   * callback.
   *
   * @param step A step in function execution logic.
   */
  public step(step: unknown): void {
    this.steps.push(step);
  }

  protected registerCounter: number;

  /**
   * Codegen uses the idea of infinite registers. It starts with `0` and
   * increments it by one for each new register. Best practice is to use
   * a new register for each new variable and keep them immutable.
   *
   * Usage:
   *
   * ```js
   * const r = codegen.getRegister();
   * codegen.js(`const ${r} = 1;`);
   * ```
   *
   * @returns a unique identifier for a variable.
   */
  public getRegister(): string {
    return `r${this.registerCounter++}`;
  }
  public r(): string {
    return this.getRegister();
  }

  /** @ignore */
  protected dependencies: unknown[] = [];
  protected dependencyNames: string[] = [];

  /**
   * Allows to wire up dependencies to the generated code.
   *
   * @param dep Any JavaScript dependency, could be a function, an object,
   *        or anything else.
   * @param name Optional name of the dependency. If not provided, a unique
   *        name will be generated, which starts with `d` and a counter
   *        appended.
   * @returns Returns the dependency name, a code symbol which can be used as
   *          variable name.
   */
  public linkDependency(dep: unknown, name: string = 'd' + this.dependencies.length): string {
    this.dependencies.push(dep);
    this.dependencyNames.push(name);
    return name;
  }

  /**
   * Sames as {@link Codegen#linkDependency}, but allows to wire up multiple
   * dependencies at once.
   */
  public linkDependencies(deps: unknown[]): string[] {
    return deps.map((dep) => this.linkDependency(dep));
  }

  protected linked: {[key: string]: 1} = {};

  /**
   * Link a dependency from the pre-defined `options.linkable` object. This method
   * can be called many times with the same dependency name, the dependency will
   * be linked only once.
   *
   * @param name Linkable dependency name.
   */
  public link(name: keyof Linkable): void {
    if (this.linked[name as string]) return;
    this.linked[name as string] = 1;
    this.linkDependency(this.options.linkable[name], name as string);
  }

  /** @ignore */
  protected constants: string[] = [];
  protected constantNames: string[] = [];

  /**
   * Allows to encode any code or value in the closure of the generated
   * function.
   *
   * @param constant Any JavaScript value in string form.
   * @param name Optional name of the constant. If not provided, a unique
   *        name will be generated, which starts with `c` and a counter
   *        appended.
   * @returns Returns the constant name, a code symbol which can be used as
   *          variable name.
   */
  public addConstant(constant: string, name: string = 'c' + this.constants.length): string {
    this.constants.push(constant);
    this.constantNames.push(name);
    return name;
  }

  /**
   * Sames as {@link Codegen#addConstant}, but allows to create multiple
   * constants at once.
   */
  public addConstants(constants: string[]): string[] {
    return constants.map((constant) => this.addConstant(constant));
  }

  /**
   * Returns generated JavaScript code with the dependency list.
   *
   * ```js
   * const code = codegen.generate();
   * const fn = eval(code.js)(...code.deps);
   * const result = fn(...args);
   * ```
   */
  public generate(opts: CodegenGenerateOptions = {}): JavaScriptLinked<Fn> {
    const {name, args, prologue, epilogue} = {...this.options, ...opts};
    const steps = this.options.processSteps(this.steps);
    const js = `(function(${this.dependencyNames.join(', ')}) {
${this.constants.map((constant, index) => `var ${this.constantNames[index]} = (${constant});`).join('\n')}
return ${name ? `function ${name}` : 'function'}(${args.join(',')}){
${prologue}
${steps.map((step) => (step as CodegenStepExecJs).js).join('\n')}
${typeof epilogue === 'function' ? epilogue() : epilogue || ''}
}})`;
    // console.log(js);
    return {
      deps: this.dependencies,
      js: js as JavaScriptLinked<Fn>['js'],
    };
  }

  /**
   * Compiles the generated JavaScript code into a function.
   *
   * @returns JavaScript function ready for execution.
   */
  public compile(opts?: CodegenGenerateOptions): Fn {
    const closure = this.generate(opts);
    return compileClosure(closure);
  }
}
