import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {RequestCompleteMessage} from '../../../messages';
import {BinaryRpcMessageCodec} from '../BinaryRpcMessageCodec';

describe('sample messages', () => {
  test('can decode a batch of two messages', () => {
    const cbor = new CborJsonValueCodec(new Writer(128));
    const codec = new BinaryRpcMessageCodec();
    const batch = new Uint8Array([
      // Message 1
      64, 6, 0, 1, 6, 100, 111, 117, 98, 108, 101, 161, 99, 110, 117, 109, 1,

      // Message 2
      64, 6, 0, 2, 6, 100, 111, 117, 98, 108, 101, 161, 99, 110, 117, 109, 2,
    ]);
    const messages = codec.decodeBatch(cbor, batch);
    expect(messages.length).toBe(2);
    expect(messages[0]).toBeInstanceOf(RequestCompleteMessage);
    expect(messages[1]).toBeInstanceOf(RequestCompleteMessage);
    expect((messages[0] as any).id).toBe(1);
    expect((messages[1] as any).id).toBe(2);
    expect((messages[0] as any).method).toBe('double');
    expect((messages[1] as any).method).toBe('double');
    expect((messages[0] as any).value.data.num).toBe(1);
    expect((messages[1] as any).value.data.num).toBe(2);
  });
});
