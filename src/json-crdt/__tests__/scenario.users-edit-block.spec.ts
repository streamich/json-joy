import {Model} from '..';
import {LogicalEncoder as EncoderBinary} from '../codec/binary/LogicalEncoder';
import {LogicalDecoder as DecoderBinary} from '../codec/binary/LogicalDecoder';
import {LogicalEncoder as EncoderCompact} from '../codec/compact/LogicalEncoder';
import {LogicalDecoder as DecoderCompact} from '../codec/compact/LogicalDecoder';
import {LogicalEncoder as EncoderJson} from '../codec/json/LogicalEncoder';
import {LogicalDecoder as DecoderJson} from '../codec/json/LogicalDecoder';
import {encode as encodePatchBinary} from '../../json-crdt-patch/codec/binary/encode';
import {decode as decodePatchBinary} from '../../json-crdt-patch/codec/binary/decode';
import {encode as encodePatchCompact} from '../../json-crdt-patch/codec/compact/encode';
import {decode as decodePatchCompact} from '../../json-crdt-patch/codec/compact/decode';
import {encode as encodePatchJson} from '../../json-crdt-patch/codec/json/encode';
import {decode as decodePatchJson} from '../../json-crdt-patch/codec/json/decode';
import {LogicalVectorClock} from '../../json-crdt-patch/clock';


const modelCodecs = [
  ['json', new EncoderJson(), new DecoderJson()],
  // ['compact', new EncoderCompact(), new DecoderCompact()],
  // ['binary', new EncoderBinary(), new DecoderBinary()],
];

const patchCodecs = [
  ['json', encodePatchJson, decodePatchJson],
  ['compact', encodePatchCompact, decodePatchCompact],
  ['binary', encodePatchBinary, decodePatchBinary],
];

for (const [modelCodecName, encoder, decoder] of modelCodecs) {
  for (const [patchCodecName, encodePatch, decodePatch] of patchCodecs) {
    test(`2 users edit concurrently a JSON block and persist changes on the server, model:${modelCodecName}, patch: ${patchCodecName}`, () => {
      // User 1 creates a JSON block.
      const model1 = Model.withLogicalClock(new LogicalVectorClock(3145605287749735, 0));
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
      const encoded1 = (encoder as any).encode(model1);

      // User 2 loads the block from the server.
      const model2 = (decoder as any).decode((encoder as any).encode((decoder as any).decode(encoded1)));
      expect(model2.toView()).toStrictEqual(model1.toView());
      
      // User 2 starts their own editing session.
      const model3 = model2.fork(2);
      const encoded3 = (encoder as any).encode(model3);
      const model4 = (decoder as any).decode(encoded3);
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
      const batch = patches1.map(encodePatch as any);

      // Server receives User 2's changes.
      const patches2 = batch.map(decodePatch as any);
      expect(patches1).toStrictEqual(patches2);
      const model5 = (decoder as any).decode(encoded1);
      patches2.forEach((patch: any) => {
        model5.applyPatch(patch as any);
      });
      expect(model5.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        'name': 'Our tasks',
        'description': 'A list of tasks',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });

      // Server stores latest state using json encoder.
      const encoded5 = (encoder as any).encode(model5);

      // User 1 in parallel does their own changes.
      model1.api.str(['name']).ins(8, '!').commit();
      model1.api.obj([]).del(['description']).commit();
      expect(model1.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        'name': 'My tasks!',
      });

      // User 1 receives User 2's changes in json encoding.
      const patches3 = patches1.map(encodePatch as any).map(decodePatch as any);
      patches3.forEach((patch: any) => model1.applyPatch(patch as any));
      expect(model1.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        'name': 'Our tasks!',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });

      // User 1 sends their changes to the server.
      const patches4 = model1.api.flush();
      const batch2 = patches4.map(encodePatch as any);
      const patches5 = batch2.map(decodePatch as any);
      const model6 = (decoder as any).decode(encoded5);
      expect(model6.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        'name': 'Our tasks',
        'description': 'A list of tasks',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });
      patches5.forEach(patch => model6.applyPatch(patch as any));
      expect(model6.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        'name': 'Our tasks!',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });
      
      // Server sends User 1's changes to User 2.
      const batch3 = patches4.map(encodePatch as any);
      const patches6 = batch3.map(decodePatch as any);
      expect(model3.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        'name': 'Our tasks',
        'description': 'A list of tasks',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });
      patches6.forEach(patch => model3.applyPatch(patch as any));
      expect(model3.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        'name': 'Our tasks!',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });
    });
  }
}
