import {JavaScriptLinked} from '.';
import {JavaScript} from './types';

// tslint:disable-next-line
export const compile = <T>(js: JavaScript<T>): T => eval(js);

export const compileClosure = <T>(fn: JavaScriptLinked<T, any>): T => compile(fn.js)(...fn.deps);
