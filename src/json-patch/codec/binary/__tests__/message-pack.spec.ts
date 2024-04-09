import {operations} from '../../json/__tests__/sample-operations';
import {Encoder, Decoder} from '..';
import {decode as decodeJson} from '../../json';
import {encode as encodeCompact} from '../../compact';
import {
  MsgPackEncoderFast as MsgPackEncoder,
  MsgPackDecoderFast as MsgPackDecoder,
} from '@jsonjoy.com/json-pack/lib/msgpack';

const msgPackEncoder = new MsgPackEncoder();
const msgPackDecoder = new MsgPackDecoder();
const encoder = new Encoder();
const decoder = new Decoder({});

describe('encoding into MessagePack JSON Patch compact format', () => {
  for (const [name, operation] of Object.entries(operations)) {
    // if (name !== 'and1') continue;
    test(name, () => {
      const ops = decodeJson([operation], {});
      const uint8 = encoder.encode(ops);
      const compact = encodeCompact(ops);
      const compact2 = msgPackDecoder.decode(uint8);
      expect(compact2).toEqual(compact);
    });
  }
});

describe('decoding from MessagePack JSON Patch compact format', () => {
  for (const [name, operation] of Object.entries(operations)) {
    // if (name !== 'and1') continue;
    test(name, () => {
      const ops = decodeJson([operation], {});
      const compact = encodeCompact(ops);
      const uint8 = msgPackEncoder.encode(compact);
      const ops2 = decoder.decode(uint8);
      const operation2 = ops2[0].toJson();
      expect(operation2).toEqual(operation);
    });
  }
});
