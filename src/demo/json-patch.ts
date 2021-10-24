/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node demo/json-patch.ts
 */

import {applyPatch, Operation} from '../json-patch';

const doc = {
  foo: {
    bar: 123,
  },
};

const patch: readonly Operation[] = [{op: 'add', path: '/foo/baz', value: 666}];

const result = applyPatch(doc, patch, false);

console.log(result.doc);
// { foo: { bar: 123, baz: 666 } }
// -------------------^^^^^^^^
