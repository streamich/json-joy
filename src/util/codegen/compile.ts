import {CompiledFunction} from '.';
import {JavaScript} from './types';

export const compile = <T>(js: JavaScript<T>): T => eval(js);

export const compileFn = <T>(fn: CompiledFunction<T, any>): T => compile(fn.js)(...fn.deps);
