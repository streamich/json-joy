import {readFileSync} from 'fs';
import {findByPointer} from '../json-pointer';

const buf = readFileSync(0);
const doc = JSON.parse(buf.toString())
const value = findByPointer('/foo', doc).val;

process.stdout.write(JSON.stringify(value, null, 4) + '\n');
