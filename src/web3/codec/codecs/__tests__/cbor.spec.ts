import {Cid} from '../../../multiformats';
import {cbor} from '../cbor';

test('can encode and decode CID', async () => {
  const cid = await Cid.fromData(new Uint8Array([1, 2, 3, 4]));
  const data = {foo: cid};
  const encoded = cbor.encoder.encode(data);
  const decoded = cbor.decoder.decode(encoded);
  expect(decoded).toStrictEqual(data);
});

test('can encode simplest fixture', async () => {
  const data = [2];
  const encoded = cbor.encoder.encode(data);
  const decoded = cbor.decoder.decode(encoded);
  expect(decoded).toStrictEqual(data);
  expect(encoded.length).toBe(2);
  expect(encoded[0]).toBe(0x81);
  expect(encoded[1]).toBe(0x02);
  const cid = await Cid.fromDagCbor(encoded);
  expect(cid.toText('base32')).toBe('bafyreihdb57fdysx5h35urvxz64ros7zvywshber7id6t6c6fek37jgyfe');
});
