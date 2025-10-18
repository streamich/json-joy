import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {randomJson} from '../../../../__tests__/fixtures';
import {TypeBuilder} from '../../../../type/TypeBuilder';
import {JsonCodegen} from '../JsonCodegen';

const encoder = new JsonEncoder(new Writer(16));
const decoder = new JsonDecoder();

test('can encode random values', () => {
  for (let i = 0; i < 10; i++) {
    const json = randomJson();
    const t = new TypeBuilder();
    const type = t.from(json);
    try {
      const fn = JsonCodegen.get(type);
      fn(json, encoder);
      const encoded = encoder.writer.flush();
      // const decoded = parse(Buffer.from(encoded).toString('utf-8'));
      const decoded = decoder.decode(encoded);
      expect(decoded).toEqual(json);
    } catch (error) {
      console.log(JSON.stringify(json, null, 2));
      console.log(type + '');
      throw error;
    }
  }
});
