import {compileFn} from '.';
import type {CompiledFunction} from './types';

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
export interface CodegenOptions {
  /**
   * Inline JavaScript string that represents the arguments that will be passed
   * to the main function body. Defaults to "r0", i.e. the first register.
   */
  arguments?: string;

  /**
   * Inline JavaScript statements, that execute at the beginning of the main
   * function body.
   */
  prologue?: string;

  /**
   * Inline JavaScript statements, that execute at the end of the main
   * function body.
   */
  epilogue: string;

  /**
   * Converts all steps to `CodegenStepExecJs`.
   */
  processSteps?: (steps: JsonSerializerStep[]) => CodegenStepExecJs[];
}

/**
 * A helper class which helps with building JavaScript code for a single
 * function. It keeps track of external dependencies, internally generated
 * constants, and execution steps, which at the end are all converted to
 * to an executable JavaScript function.
 */
export class Codegen<Fn extends (...deps: unknown[]) => unknown = (...deps: unknown[]) => unknown> {
  /** @ignore */
  protected steps: JsonSerializerStep[] = [];

  /** @ignore */
  protected options: Required<CodegenOptions>;

  constructor(opts: CodegenOptions) {
    this.options = {
      arguments: 'r0',
      prologue: opts.prologue || '',
      processSteps: (steps) => steps.filter(step => step instanceof CodegenStepExecJs) as CodegenStepExecJs[],
      ...opts,
    };
  }

  /**
   * Add one or more JavaScript statements to the main function body.
   */
  public js(js: string): void {
    this.steps.push(new CodegenStepExecJs(js));
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

  protected registerCounter = 0;

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
  protected addConstant(constant: string, name: string = 'c' + this.constants.length): string {
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
   *
   * @returns Returns a {@link CompiledFunction} object ready for compilation.
   */
  public generate(): CompiledFunction<Fn> {
    const steps = this.options.processSteps(this.steps);
    const js = `(function(${this.dependencyNames.join(', ')}) {
${this.constants.map((constant, index) => `var ${this.constantNames[index]} = (${constant});`).join('\n')}
return function(${this.options.arguments}){
${this.options.prologue}
${steps.map((step) => (step as CodegenStepExecJs).js).join('\n')}
${this.options.epilogue}
}})`;

    return {
      deps: this.dependencies,
      js: js as CompiledFunction<Fn>['js'],
    };
  }

  /**
   * Compiles the generated JavaScript code into a function.
   *
   * @returns JavaScript function ready for execution.
   */
  public compile(): Fn {
    return compileFn(this.generate());
  }
}
