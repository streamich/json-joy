import {readFileSync} from 'fs';
import {findByPointer} from '../json-pointer';

const buf = readFileSync(0);
const doc = JSON.parse(buf.toString())
const value = findByPointer(process.argv[2], doc).val;

process.stdout.write(JSON.stringify(value, null, 4) + '\n');
