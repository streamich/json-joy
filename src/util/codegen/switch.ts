export interface SwitchOptions<Schema = unknown, Args extends any[] = any[], Result = unknown, Options = unknown> {
  schema: Schema;
  evaluate: (schema: Schema, ...args: Args) => Result;
  codegen: (schema: Schema, options: Options) => (...args: Args) => Result;
  codegenOptions: Options;
}

/**
 * Switcher for code generation. It first executes "evaluation" function first
 * 3 times, and then generates optimized code.
 */
export const createSwitch = ({schema, evaluate, codegen, codegenOptions}: SwitchOptions) => {
  let counter = 0;
  let fn = (...args: any[]): any => {
    if (counter > 2) {
      fn = codegen(schema, codegenOptions);
      return fn(...args);
    }
    counter++;
    return evaluate(schema, ...args);
  };
  return (...args: any[]) => {
    return fn(...args);
  };
};
