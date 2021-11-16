export type JavaScript<T> = string & {__JS_BRAND__: T}

export interface CompiledFunction<Js, Dependencies extends unknown[] = unknown[]> {
  deps: Dependencies;
  js: JavaScript<(...dependencies: Dependencies) => Js>;
}

export const compile = <T>(js: JavaScript<T>): T => eval(js);

export const compileFn = <T>(fn: CompiledFunction<T, any>): T => compile(fn.js)(...fn.deps);
