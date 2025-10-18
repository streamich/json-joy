import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {JsonCodegen} from '../JsonCodegen';
import {Random} from '../../../../random';
import {allSerializableTypes} from '../../../../__tests__/fixtures';

const encoder = new JsonEncoder(new Writer(16));
const decoder = new JsonDecoder();

for (const [name, type] of Object.entries(allSerializableTypes)) {
  test(`can encode and decode ${name}`, () => {
    for (let i = 0; i < 100; i++) {
      const json = Random.gen(type);
      // console.log(json);
      try {
        const fn = JsonCodegen.get(type);
        fn(json, encoder);
        const encoded = encoder.writer.flush();
        const _text = Buffer.from(encoded).toString('utf-8');
        // console.log(text);
        // const decoded = parse(text);
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
