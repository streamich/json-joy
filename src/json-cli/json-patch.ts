import {readFileSync} from 'fs';
import {validateOperation} from '../json-patch';
import {applyPatch} from '../json-patch/patch';

try {
  const buf = readFileSync(0);
  const doc = JSON.parse(buf.toString())
  const patch = JSON.parse(process.argv[2]);
  patch.forEach(validateOperation);
  const res = applyPatch(doc, patch, true);
  process.stdout.write(JSON.stringify(res.doc, null, 4) + '\n');
} catch (error) {
  const output = error instanceof Error ? error.message : String(error);
  process.stderr.write(output + '\n');
  process.exit(1);
}
