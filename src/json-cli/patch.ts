import {applyPatch} from '../json-patch/patch';

const doc = JSON.parse(process.argv[2]);
const patch = JSON.parse(process.argv[3]);
const res = applyPatch(doc, patch, true);

process.stdout.write(JSON.stringify(res.doc, null, 4) + '\n');
