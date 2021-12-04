export type JavaScript<T> = string & {__JS_BRAND__: T};

export type JavaScriptWithDependencies<T, Dependencies extends unknown[] = unknown[]> = JavaScript<
  (...dependencies: Dependencies) => T
>;

export interface CompiledFunction<Js, Dependencies extends unknown[] = unknown[]> {
  deps: Dependencies;
  js: JavaScript<(...dependencies: Dependencies) => Js>;
}
