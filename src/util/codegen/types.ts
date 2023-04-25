import type {Brand} from '../types';

/**
 * Represents a string which contains JavaScript code, which can be
 * executed by the `eval` function.
 *
 * ```ts
 * const code: JavaScript<() => {}> = `() => {}`;
 * const fn = eval(code); // () => {}
 * ```
 */
export type JavaScript<T> = Brand<string, T, 'JavaScript'>;

/**
 * Represents a string which contains JavaScript code, which is enclosed
 * in a JavaScript closure function. The dependencies can be "linked" to
 * the JavaScript code, by executing the outer closure function with the
 * list of dependencies as arguments.
 *
 * ```ts
 * const multBy: JavaScriptClosure<(x: number) => number, [by: number]> =
 *   'function(by) { return function (x) { return x * by }}';
 *
 * const multBy3 = eval(multBy)(3);
 *
 * multBy3(5); // 15
 * ```
 */
export type JavaScriptClosure<Js, D extends unknown[] = unknown[]> = JavaScript<(...deps: D) => Js>;

/**
 * Represents a {@link JavaScriptClosure} with a fixed list of dependencies,
 * that can be linked to the JavaScript code-generated closure.
 */
export interface JavaScriptLinked<Js, Dependencies extends unknown[] = unknown[]> {
  deps: Dependencies;
  js: JavaScriptClosure<Js, Dependencies>;
}
