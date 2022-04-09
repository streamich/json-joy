import {encode} from '../encode';
import {decode} from '../decode';
import {LogicalClock} from '../../../clock';
import {PatchBuilder} from '../../../PatchBuilder';

test('can encode and decode a simple object', () => {
  const clock = new LogicalClock(3, 100);
  const builder = new PatchBuilder(clock);

  builder.json({
    foo: 'bar',
  });

  const encoded = encode(builder.patch);
  const decoded = decode(encoded);

  expect(decoded).toEqual(builder.patch);
});

test('can encode binary data', () => {
  const clock = new LogicalClock(5, 100);
  const builder = new PatchBuilder(clock);

  builder.json({
    foo: new Uint8Array([111]),
  });

  const encoded = encode(builder.patch);
  const decoded = decode(encoded);

  expect(decoded).toEqual(builder.patch);
});
