/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-pointer/__demos__/json-pointer.ts
 */

import {find, unescapeComponent, escapeComponent, parseJsonPointer, formatJsonPointer} from '../../json-pointer';

const doc = {
  foo: {
    bar: 123,
  },
};

const path = parseJsonPointer('/foo/bar');
const ref = find(doc, path);

console.log(ref);
// { val: 123, obj: { bar: 123 }, key: 'bar' }

console.log(parseJsonPointer('/f~0o~1o/bar/1/baz'));
// [ 'f~o/o', 'bar', '1', 'baz' ]

console.log(formatJsonPointer(['f~o/o', 'bar', '1', 'baz']));
// /f~0o~1o/bar/1/baz

console.log(unescapeComponent('~0~1'));
// ~/

console.log(escapeComponent('~/'));
// ~0~1
