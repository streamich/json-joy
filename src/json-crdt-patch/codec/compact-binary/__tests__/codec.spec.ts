import {encode} from '../encode';
import {decode} from '../decode';
import {LogicalClock, LogicalTimestamp, LogicalVectorClock} from '../../../clock';
import {PatchBuilder} from '../../../PatchBuilder';
import {Model} from '../../../../json-crdt/model';
import {encode as encodeJson} from '../../json/encode';

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

test('can encode one element delete operation', () => {
  const clock = new LogicalClock(5, 100);
  const builder = new PatchBuilder(clock);
  builder.del(new LogicalTimestamp(5, 100), new LogicalTimestamp(5, 200), 1);
  const encoded = encode(builder.patch);
  const decoded = decode(encoded);
  expect(decoded).toEqual(builder.patch);
});

test('can encode three element delete operation', () => {
  const clock = new LogicalClock(5, 100);
  const builder = new PatchBuilder(clock);
  builder.del(new LogicalTimestamp(5, 100), new LogicalTimestamp(5, 200), 3);
  const encoded = encode(builder.patch);
  const decoded = decode(encoded);
  expect(encodeJson(decoded)).toEqual(encodeJson(builder.patch));
});

test('can encode three element delete operation', () => {
  const model = Model.withLogicalClock(new LogicalVectorClock(5, 0));
  model.api.root({name: 'a'}).commit();
  model.api.str(['name']).ins(0, 'b').commit();
  const patches = model.api.flush();
  // console.log(JSON.stringify(patches.map(encodeJson), null, 4));
  // console.log(JSON.stringify(patches.map(encode), null, 4));
  const patch = patches[1];
  const encoded = encode(patch);
  const decoded = decode(encoded);
  expect(encodeJson(patch)).toEqual(encodeJson(decoded));
});
