import {encode} from '../encode';
import {decode} from '../decode';
import {LogicalClock} from '../../../clock';
import {PatchBuilder} from '../../../PatchBuilder';
import {documents} from '../../../../__tests__/json-documents';
import {binaryDocuments} from '../../../../__tests__/binary-documents';

test('can encode zero', () => {
  const clock = new LogicalClock(0, 1);
  const builder = new PatchBuilder(clock);
  const jsonId = builder.json(0);
  builder.root(jsonId);
  const encoded = encode(builder.patch);
  const decoded = decode(encoded);
  expect(decoded).toEqual(builder.patch);
});

test('can update value type contents', () => {
  const clock = new LogicalClock(0, 1);
  const builder = new PatchBuilder(clock);
  const jsonId = builder.json(0);
  builder.root(jsonId);
  builder.setVal(jsonId, -1);
  const encoded = encode(builder.patch);
  const decoded = decode(encoded);
  expect(decoded).toEqual(builder.patch);
});
