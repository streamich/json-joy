import {Cid} from '../../multiformats';
import {cbor} from '../cbor';

test('can encode and decode CID', async () => {
  const cid = await Cid.fromData(new Uint8Array([1, 2, 3, 4]));
  const data = {foo: cid};
  const encoded = cbor.encoder.encode(data);
  const decoded = cbor.decoder.decode(encoded);
  expect(decoded).toStrictEqual(data);
});
