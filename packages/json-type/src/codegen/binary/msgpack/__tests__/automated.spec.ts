import {MsgPackDecoder} from '@jsonjoy.com/json-pack/lib/msgpack/MsgPackDecoder';
import {MsgPackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack/MsgPackEncoder';
import {MsgPackCodegen} from '../MsgPackCodegen';
import {Random} from '../../../../random';
import {allSerializableTypes} from '../../../../__tests__/fixtures';

const encoder = new MsgPackEncoder();
const decoder = new MsgPackDecoder();

for (const [name, type] of Object.entries(allSerializableTypes)) {
  test(`can encode and decode ${name}`, () => {
    for (let i = 0; i < 100; i++) {
      const json = Random.gen(type);
      try {
        const fn = MsgPackCodegen.get(type);
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
