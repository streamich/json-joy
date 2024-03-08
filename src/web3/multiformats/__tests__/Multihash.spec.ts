import {Multihash} from '../Multihash';

const text = 'Merkle–Damgård';
const data = new TextEncoder().encode(text);

test('computes correctly SHA2-256 hash for sample data', async () => {
  const hash = await Multihash.fromData(data);
  expect(hash.toString16()).toBe('122041dd7b6443542e75701aa98a0c235951a28a0d851b11564d20022ab11d2589a8');
});

test('by default uses SHA2-256 codec', async () => {
  const hash = await Multihash.fromData(data);
  expect(hash.type()).toBe(0x12);
});

test('returns 32 length for SHA2-256 codec', async () => {
  const hash = await Multihash.fromData(data);
  expect(hash.length()).toBe(32);
});

test('returns correct hash value', async () => {
  const hash = await Multihash.fromData(data);
  const value = hash.value();
  const hex = [...value].map(byte => byte.toString(16).padStart(2, '0')).join('');
  expect(hex).toBe('41dd7b6443542e75701aa98a0c235951a28a0d851b11564d20022ab11d2589a8');
});

test('can create a Multihash instance from a hash', async () => {
  const hash = new Multihash((await Multihash.fromData(data)).buf);
  expect(hash.type()).toBe(0x12);
  expect(hash.length()).toBe(32);
  const value = hash.value();
  const hex = [...value].map(byte => byte.toString(16).padStart(2, '0')).join('');
  expect(hex).toBe('41dd7b6443542e75701aa98a0c235951a28a0d851b11564d20022ab11d2589a8');
});

test('throws on hash being too short', async () => {
  const hash = await Multihash.fromData(data);
  const buf = hash.buf.slice(0, -1);
  const hash2 = new Multihash(hash.buf);
  expect(() => new Multihash(buf)).toThrow('INVALID_MULTIHASH');
});

test('throws on unknown hash codec', async () => {
  const hash = await Multihash.fromData(data);
  const buf = hash.buf;
  buf[0] = 0x00;
  expect(() => new Multihash(buf)).toThrow('UNKNOWN_MULTICODEC');
});

test('throws on invalid hash length', async () => {
  const hash = await Multihash.fromData(data);
  const buf = hash.buf;
  buf[1] = 31;
  expect(() => new Multihash(buf)).toThrow('INVALID_MULTIHASH');
});
