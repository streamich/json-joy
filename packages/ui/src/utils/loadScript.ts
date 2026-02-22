import {until} from 'thingies/lib/until';

// eslint-disable-next-line
const load = require('load-script');

/**
 * Loads `.js` script.
 *
 * @param url
 */
export const loadScript = (url: string) =>
  new Promise((resolve, reject) =>
    load(url, (err: unknown, script: HTMLScriptElement) => (err ? reject(err) : resolve(script))),
  );

/**
 * Loads <script> and expects that script to set a global variable.
 *
 * @param globalVarName
 * @param url
 */
export const loadGlobal = <T>(globalVarName: string, url: string): Promise<T> =>
  loadScript(url)
    .then(() => until(() => !!((global as any)[globalVarName] as any)))
    .then(() => (global as any)[globalVarName] as any);
