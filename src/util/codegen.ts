export type JavaScript<T> = string & {__JS_BRAND__: T}

export const compile = <T>(js: JavaScript<T>): T => eval(js);
