/* tslint:disable no-string-throw */

import {readFileSync} from 'fs';
import {findByPointer} from '@jsonjoy.com/json-pointer';

try {
  const buf = readFileSync(0);
  const doc = JSON.parse(buf.toString());
  const result = findByPointer(process.argv[2], doc);
  const value = result.val;
  if (value === undefined) {
    if (Array.isArray(result.obj)) throw 'INVALID_INDEX';
    throw 'NOT_FOUND';
  }
  process.stdout.write(JSON.stringify(value, null, 4) + '\n');
} catch (error) {
  process.stderr.write(error + '\n');
  process.exit(1);
}
