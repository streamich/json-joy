import {MsgPackDecoder} from '@jsonjoy.com/json-pack/lib/msgpack/MsgPackDecoder';
import {MsgPackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack/MsgPackEncoder';
import {randomJson} from '../../../../__tests__/fixtures';
import {TypeBuilder} from '../../../../type/TypeBuilder';
import {MsgPackCodegen} from '../MsgPackCodegen';

test('can encode random values', () => {
  for (let i = 0; i < 10; i++) {
    const encoder = new MsgPackEncoder();
    const decoder = new MsgPackDecoder();
    const json = randomJson();
    const t = new TypeBuilder();
    const type = t.from(json);
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
