import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {CborCodegen} from '../CborCodegen';
import {Random} from '../../../../random';
import {allSerializableTypes} from '../../../../__tests__/fixtures';

const encoder = new CborEncoder(new Writer(16));
const decoder = new CborDecoder();

for (const [name, type] of Object.entries(allSerializableTypes)) {
  test(`can encode and decode ${name}`, () => {
    for (let i = 0; i < 100; i++) {
      const json = Random.gen(type);
      try {
        const fn = CborCodegen.get(type);
        fn(json, encoder);
        const encoded = encoder.writer.flush();
        const decoded = decoder.decode(encoded);
        expect(decoded).toEqual(json);
      } catch (error) {
        console.log(JSON.stringify(json, null, 2));
        console.log(type + '');
        throw error;
      }
    }
  });
}
