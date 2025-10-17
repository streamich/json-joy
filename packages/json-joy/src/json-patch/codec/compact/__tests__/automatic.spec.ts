import {operations} from '../../json/__tests__/sample-operations';
import {decode, encode} from '..';
import {decode as decodeJson, encode as encodeJson} from '../../json';

for (const [name, operation] of Object.entries(operations)) {
  // if (name !== 'and2') continue;
  describe('number opcode', () => {
    test(name, () => {
      const ops = decodeJson([operation], {});
      const compact = encode(ops, {stringOpcode: false});
      const ops2 = decode(compact, {});
      const operations = encodeJson(ops2);
      expect(operations[0]).toEqual(operation);
    });
  });
  describe('string opcode', () => {
    test(name, () => {
      const ops = decodeJson([operation], {});
      const compact = encode(ops, {stringOpcode: true});
      const ops2 = decode(compact, {});
      const operations = encodeJson(ops2);
      expect(operations[0]).toEqual(operation);
    });
  });
}
