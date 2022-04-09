import {Model} from '..';
import {LogicalEncoder as EncoderBinary} from '../codec/binary/LogicalEncoder';
import {LogicalDecoder as DecoderBinary} from '../codec/binary/LogicalDecoder';
import {LogicalEncoder as EncoderCompact} from '../codec/compact/LogicalEncoder';
import {LogicalDecoder as DecoderCompact} from '../codec/compact/LogicalDecoder';
import {LogicalEncoder as EncoderJson} from '../codec/json/LogicalEncoder';
import {LogicalDecoder as DecoderJson} from '../codec/json/LogicalDecoder';
import {encode as encodePatchBinary} from '../../json-crdt-patch/codec/binary/encode';
import {decode as decodePatchBinary} from '../../json-crdt-patch/codec/binary/decode';
import {encode as encodePatchJson} from '../../json-crdt-patch/codec/json/encode';
import {decode as decodePatchJson} from '../../json-crdt-patch/codec/json/decode';
import {LogicalVectorClock} from '../../json-crdt-patch/clock';

// const encoderBinary = new EncoderBinary();
// const decoderBinary = new DecoderBinary();
// const encoderCompact = new EncoderCompact();
// const decoderCompact = new DecoderCompact();
const encoderJson = new EncoderJson();
const decoderJson = new DecoderJson();

test('2 users edit concurrently a JSON block and persist changes on the server', () => {
  // User 1 creates a JSON block.
  const model1 = Model.withLogicalClock(new LogicalVectorClock(1, 0));
  model1.api.root({
    '@type': 'CreativeWork',
    'name': 'Task list',
    'description': 'A list of tasks',
  }).commit();

  expect(model1.toView()).toStrictEqual({
    '@type': 'CreativeWork',
    'name': 'Task list',
    'description': 'A list of tasks',
  });

  // User 1 immediately edits title of the block.
  model1.api.str(['name'])
    .del(0, 1)
    .ins(0, 'My t')
    .del(4, 5)
    .ins(4, 's')
    .commit();
  expect(model1.toView()).toStrictEqual({
    '@type': 'CreativeWork',
    'name': 'My tasks',
    'description': 'A list of tasks',
  });
  // console.log(model1.toString());

  // User 1 saves the block on the server.
  // const encoded1 = encoderBinary.encode(model1.fork(10));
  const encoded1 = encoderJson.encode(model1);

  // User 2 loads the block from the server.
  const model2 = decoderJson.decode(encoderJson.encode(decoderJson.decode(encoded1)));
  expect(model2.toView()).toStrictEqual(model1.toView());
  
  // User 2 starts their own editing session.
  const model3 = model2.fork(2);
  const encoded3 = encoderJson.encode(model3);
  const model4 = decoderJson.decode(encoded3);
  expect(model4.toView()).toStrictEqual(model1.toView());

  // User 2 edits the title of the block.
  model3.api.str(['name'])
    .del(0, 2)
    .ins(0, 'Our');
  model3.api.obj([]).set({pinned: true});
  model3.api.commit();
  model3.api.obj([]).set({tags: ['important']}).commit();
  model3.api.arr(['tags']).ins(1, ['todo', 'list']).commit();
  expect(model3.toView()).toStrictEqual({
    '@type': 'CreativeWork',
    'name': 'Our tasks',
    'description': 'A list of tasks',
    pinned: true,
    tags: ['important', 'todo', 'list'],
  });
  
  // User 2 sends their changes to the server.
  const patches1 = model3.api.flush();
  const batch = patches1.map(encodePatchBinary);

  // Server receives User 2's changes.
  const patches2 = batch.map(decodePatchBinary);
  const model5 = decoderJson.decode(encoded1);
  patches2.forEach(patch => {
    model5.applyPatch(patch);
  });
  expect(model5.toView()).toStrictEqual({
    '@type': 'CreativeWork',
    'name': 'Our tasks',
    'description': 'A list of tasks',
    pinned: true,
    tags: ['important', 'todo', 'list'],
  });
  
  // Server stores latest state using json encoder.
  const encoded5 = encoderJson.encode(model5);

  // User 1 in parallel does their own changes.
  model1.api.str(['name']).ins(8, '!').commit();
  model1.api.obj([]).del(['description']).commit();
  expect(model1.toView()).toStrictEqual({
    '@type': 'CreativeWork',
    'name': 'My tasks!',
  });

  // User 1 receives User 2's changes in json encoding.
  const patches3 = patches1.map(encodePatchJson).map(decodePatchJson);
  patches3.forEach(patch => model1.applyPatch(patch));
  expect(model1.toView()).toStrictEqual({
    '@type': 'CreativeWork',
    'name': 'Our tasks!',
    pinned: true,
    tags: ['important', 'todo', 'list'],
  });

  // User 1 sends their changes to the server.
  const patches4 = model1.api.flush();
  const batch2 = patches4.map(encodePatchJson);
  const patches5 = batch2.map(decodePatchJson);
  const model6 = decoderJson.decode(encoded5);
  patches5.forEach(patch => model6.applyPatch(patch));
  expect(model6.toView()).toStrictEqual({
    '@type': 'CreativeWork',
    'name': 'Our tasks!',
    pinned: true,
    tags: ['important', 'todo', 'list'],
  });
  
  // Server sends User 1's changes to User 2.
  const batch3 = patches4.map(encodePatchJson);
  const patches6 = batch3.map(decodePatchJson);
  expect(model3.toView()).toStrictEqual({
    '@type': 'CreativeWork',
    'name': 'Our tasks',
    'description': 'A list of tasks',
    pinned: true,
    tags: ['important', 'todo', 'list'],
  });
  patches6.forEach(patch => model3.applyPatch(patch));
  expect(model3.toView()).toStrictEqual({
    '@type': 'CreativeWork',
    'name': 'Our tasks!',
    pinned: true,
    tags: ['important', 'todo', 'list'],
  });
});
