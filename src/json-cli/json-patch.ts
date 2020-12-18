import {readFileSync} from 'fs';
import {applyPatch} from '../json-patch/patch';


const buf = readFileSync(0);
const doc = JSON.parse(buf.toString())
const patch = JSON.parse(process.argv[2]);
const res = applyPatch(doc, patch, true);

process.stdout.write(JSON.stringify(res.doc, null, 4) + '\n');
