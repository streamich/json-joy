import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {randomJson} from '../../../../__tests__/fixtures';
import {TypeBuilder} from '../../../../type/TypeBuilder';
import {CborCodegen} from '../CborCodegen';

const encoder = new CborEncoder(new Writer(16));
const decoder = new CborDecoder();

test('can encode random values', () => {
  for (let i = 0; i < 10; i++) {
    const json = randomJson();
    const t = new TypeBuilder();
    const type = t.from(json);
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
