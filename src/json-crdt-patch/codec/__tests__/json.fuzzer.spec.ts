import {PatchFuzzer} from './PatchFuzzer';
import {encode as encodeJson} from '../verbose/encode';
import {decode as decodeJson} from '../verbose/decode';
import {encode as encodeCompact} from '../compact/encode';
import {decode as decodeCompact} from '../compact/decode';
import {encode as encodeCompactBinary} from '../compact-binary/encode';
import {decode as decodeCompactBinary} from '../compact-binary/decode';
import {encode as encodeBinary, decode as decodeBinary} from '../binary';
import type {Patch} from '../../Patch';

const fuzzer = new PatchFuzzer();
const environments: [string, () => Patch][] = [
  ['logical', () => fuzzer.generateLogicalPatch()],
  ['server', () => fuzzer.generateServerPatch()],
];
const codecs = [
  ['json', encodeJson, decodeJson],
  ['compact', encodeCompact, decodeCompact],
  ['compact-binary', encodeCompactBinary, decodeCompactBinary],
  ['binary', encodeBinary, decodeBinary],
];

for (const [env, createPatch] of environments) {
  describe(`${env} environment`, () => {
    for (const [name, encode, decode] of codecs) {
      describe(`${name} codec`, () => {
        test('fuzz testing a patch codec', () => {
          for (let i = 0; i < 200; i++) {
            const patch = createPatch();
            try {
              const encoded1 = (encode as any)(patch);
              const decoded1 = (decode as any)(encoded1);
              const encoded2 = (encode as any)(decoded1);
              const decoded2 = (decode as any)(encoded2);
              // console.log(patch);
              // console.log(JSON.stringify(encoded1, null, 2));
              // console.log(JSON.stringify(encoded2, null, 2));
              expect(decoded1).toStrictEqual(patch);
              expect(decoded2).toStrictEqual(patch);
            } catch (error) {
              // tslint:disable-next-line no-console
              console.log(JSON.stringify(encodeJson(patch), null, 2));
              throw error;
            }
          }
        });
      });
    }
  });
}
