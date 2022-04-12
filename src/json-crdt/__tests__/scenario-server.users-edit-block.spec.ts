import {Model} from '..';
import {Encoder as EncoderBinary} from '../codec/binary/Encoder';
import {Decoder as DecoderBinary} from '../codec/binary/Decoder';
import {Encoder as EncoderCompact} from '../codec/compact/Encoder';
import {Decoder as DecoderCompact} from '../codec/compact/Decoder';
import {LogicalEncoder as EncoderCompactBinary} from '../codec/compact-binary/LogicalEncoder';
import {LogicalDecoder as DecoderCompactBinary} from '../codec/compact-binary/LogicalDecoder';
import {Encoder as EncoderJson} from '../codec/json/Encoder';
import {Decoder as DecoderJson} from '../codec/json/Decoder';
import {encode as encodePatchBinary} from '../../json-crdt-patch/codec/binary/encode';
import {decode as decodePatchBinary} from '../../json-crdt-patch/codec/binary/decode';
import {encode as encodePatchCompact} from '../../json-crdt-patch/codec/compact/encode';
import {decode as decodePatchCompact} from '../../json-crdt-patch/codec/compact/decode';
import {encode as encodePatchCompactBinary} from '../../json-crdt-patch/codec/compact-binary/encode';
import {decode as decodePatchCompactBinary} from '../../json-crdt-patch/codec/compact-binary/decode';
import {encode as encodePatchJson} from '../../json-crdt-patch/codec/json/encode';
import {decode as decodePatchJson} from '../../json-crdt-patch/codec/json/decode';
import {Patch} from '../../json-crdt-patch/Patch';

const modelCodecs = [
  ['json', new EncoderJson(), new DecoderJson()],
  ['compact', new EncoderCompact(), new DecoderCompact()],
  ['compact-binary', new EncoderCompactBinary(), new DecoderCompactBinary()],
  ['binary', new EncoderBinary(), new DecoderBinary()],
];

const patchCodecs = [
  ['json', encodePatchJson, decodePatchJson],
  ['compact', encodePatchCompact, decodePatchCompact],
  ['compact-binary', encodePatchCompactBinary, decodePatchCompactBinary],
  ['binary', encodePatchBinary, decodePatchBinary],
];

for (const [modelCodecName, encoder, decoder] of modelCodecs) {
  for (const [patchCodecName, encodePatch, decodePatch] of patchCodecs) {
    test(`2 users edit concurrently a JSON block and persist changes on the server, model:${modelCodecName}, patch: ${patchCodecName}`, () => {
      // User 1 creates a JSON block.
      const model1 = Model.withServerClock();
      model1.api
        .root({
          '@type': 'CreativeWork',
          name: 'Task list',
          description: 'A list of tasks',
        })
        .commit();

      expect(model1.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'Task list',
        description: 'A list of tasks',
      });

      // User 1 immediately edits title of the block.
      model1.api.str(['name']).del(0, 1).ins(0, 'My t').del(4, 5).ins(4, 's').commit();
      expect(model1.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'My tasks',
        description: 'A list of tasks',
      });

      // User 1 saves the block on the server.
      const encoded1 = (encoder as any).encode((decoder as any).decode((encoder as any).encode(model1)));

      // User 2 loads the block from the server.
      const model2 = (decoder as any).decode((encoder as any).encode((decoder as any).decode(encoded1)));
      expect(model2.api.str(['name']).node.id.time).toBe(model1.api.str(['name']).node.id.time);
      expect(model2.toView()).toStrictEqual(model1.toView());

      // User 2 starts their own editing session (NOT NEEDED FOR SERVER CLOCK).
      const model3 = model2.fork();
      const encoded3 = (encoder as any).encode(model3);
      const model4 = (decoder as any).decode(encoded3);
      expect(model4.toView()).toStrictEqual(model1.toView());

      // User 2 edits the title of the block.
      model3.api.str(['name']).del(0, 2).ins(0, 'Our');
      model3.api.obj([]).set({pinned: true});
      model3.api.commit();
      model3.api
        .obj([])
        .set({tags: ['important']})
        .commit();
      model3.api.arr(['tags']).ins(1, ['todo', 'list']).commit();
      expect(model3.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'Our tasks',
        description: 'A list of tasks',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });

      // User 2 sends their changes to the server.
      const patches1 = model3.api.flush();
      const batch = patches1.map(encodePatch as any);

      // Server receives and applies User 2's changes.
      const patches2 = batch.map(decodePatch as any) as Patch[];
      expect(patches1).toStrictEqual(patches2);
      const model5 = (decoder as any).decode(encoded1);
      const patches22: Patch[] = [];
      const transformHorizon1 = model5.clock.time;
      patches2.forEach((patch: Patch) => {
        const p = patch.rebase(model5.clock.time, transformHorizon1);
        patches22.push(p);
        model5.applyPatch(p);
      });
      expect(model5.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'Our tasks',
        description: 'A list of tasks',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });

      // Server stores latest state using json encoder.
      const encoded5 = (encoder as any).encode(model5);

      // User 1 in parallel does their own changes.
      const model11 = model1.fork();
      model11.api.str(['name']).ins(8, '!').commit();
      model11.api.obj([]).del(['description']).commit();
      expect(model11.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'My tasks!',
      });
      const model111 = model11.fork();

      // User 1 receives User 2's and applies them to model which was sent to server.
      const patches3 = patches22.map(encodePatch as any).map(decodePatch as any);
      patches3.forEach((patch: any) => model1.applyPatch(patch as any));
      expect(model1.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'Our tasks',
        description: 'A list of tasks',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });

      // Then User 1 applies the changes to the local changes.
      const patches33 = patches22.map(encodePatch as any).map(decodePatch as any);
      expect(model11.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'My tasks!',
      });
      const transformHorizon2 = model5.clock.time;
      patches33.forEach((patch: any) => {
        const p = patch.rebase(model11.clock.time, transformHorizon2);
        model11.applyPatch(p);
      });
      expect(model11.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'Our tasks!',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });

      // User 1 sends their changes to the server.
      const patches4 = model111.api.flush();
      const batch2 = patches4.map(encodePatch as any);
      const patches5 = batch2.map(decodePatch as any);
      const model6 = (decoder as any).decode(encoded5);
      expect(model6.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'Our tasks',
        description: 'A list of tasks',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });
      const timeHorizon3 = model6.clock.time;
      patches5.forEach((patch) => {
        const p = (patch as any).rebase(model6.clock.time, timeHorizon3);
        model6.applyPatch(p as any);
      });
      expect(model6.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'Our tasks!',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });

      // Server sends User 1's changes to User 2.
      const batch3 = patches5.map(encodePatch as any);
      const patches6 = batch3.map(decodePatch as any);
      expect(model3.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'Our tasks',
        description: 'A list of tasks',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });
      patches6.forEach((patch) => model3.applyPatch(patch as any));
      expect(model3.toView()).toStrictEqual({
        '@type': 'CreativeWork',
        name: 'Our tasks!',
        pinned: true,
        tags: ['important', 'todo', 'list'],
      });
    });
  }
}
