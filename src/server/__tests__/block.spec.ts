import {Model} from '../../json-crdt';
import {RpcErrorCodes} from '../../reactive-rpc/common/rpc/caller';
import {setup} from './setup';
import {tick, until} from '../../__tests__/util';

describe('block.*', () => {
  describe('block.new', () => {
    test('can create an empty block', async () => {
      const {call} = setup();
      await call('block.new', {id: 'my-block', patches: []});
      const {block} = await call('block.get', {id: 'my-block'});
      expect(block).toMatchObject({
        id: 'my-block',
        seq: -1,
        blob: expect.any(Uint8Array),
        created: expect.any(Number),
        updated: expect.any(Number),
      });
      const model = Model.fromBinary(block.blob);
      expect(model.view()).toBe(undefined);
    });

    test('can create a block with value', async () => {
      const {call} = setup();
      const model = Model.withLogicalClock();
      model.api.root({
        name: 'Super Woman',
        age: 25,
      });
      const patch1 = model.api.flush();
      model.api.obj([]).set({
        age: 26,
      });
      const patch2 = model.api.flush();
      await call('block.new', {
        id: '123412341234',
        patches: [
          {
            seq: 0,
            created: Date.now(),
            blob: patch1.toBinary(),
          },
          {
            seq: 1,
            created: Date.now(),
            blob: patch2.toBinary(),
          },
        ],
      });
      const {block} = await call('block.get', {id: '123412341234'});
      expect(block).toMatchObject({
        id: '123412341234',
        seq: 1,
        blob: expect.any(Uint8Array),
        created: expect.any(Number),
        updated: expect.any(Number),
      });
      const model2 = Model.fromBinary(block.blob);
      expect(model2.view()).toStrictEqual({
        name: 'Super Woman',
        age: 26,
      });
    });
  });

  describe('block.remove', () => {
    test('can remove an existing block', async () => {
      const {call} = setup();
      await call('block.new', {id: 'my-block', patches: []});
      const {block} = await call('block.get', {id: 'my-block'});
      expect(block.id).toBe('my-block');
      await call('block.del', {id: 'my-block'});
      try {
        await call('block.get', {id: 'my-block'});
        throw new Error('not this error');
      } catch (err: any) {
        expect(err.errno).toBe(RpcErrorCodes.NOT_FOUND);
      }
    });
  });

  describe('block.upd', () => {
    test('can edit a document sequentially', async () => {
      const {call} = setup();
      const id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
      const model = Model.withLogicalClock();
      model.api.root({
        text: 'Hell',
      });
      const patch1 = model.api.flush();
      await call('block.new', {
        id,
        patches: [
          {
            seq: 0,
            created: Date.now(),
            blob: patch1.toBinary(),
          },
        ],
      });
      model.api.str(['text']).ins(4, 'o');
      const patch2 = model.api.flush();
      model.api.str(['text']).ins(5, ' World');
      const patch3 = model.api.flush();
      await call('block.upd', {
        id,
        patches: [
          {
            seq: 1,
            created: Date.now(),
            blob: patch2.toBinary(),
          },
          {
            seq: 2,
            created: Date.now(),
            blob: patch3.toBinary(),
          },
        ],
      });
      const block2 = await call('block.get', {id});
      expect(Model.fromBinary(block2.block.blob).view()).toStrictEqual({
        text: 'Hello World',
      });
      model.api.str(['text']).del(5, 1).ins(5, ', ');
      const patch4 = model.api.flush();
      model.api.str(['text']).ins(12, '!');
      const patch5 = model.api.flush();
      await call('block.upd', {
        id,
        patches: [
          {
            seq: 3,
            created: Date.now(),
            blob: patch4.toBinary(),
          },
          {
            seq: 4,
            created: Date.now(),
            blob: patch5.toBinary(),
          },
        ],
      });
      const block3 = await call('block.get', {id});
      expect(Model.fromBinary(block3.block.blob).view()).toStrictEqual({
        text: 'Hello, World!',
      });
    });

    test('can edit a document concurrently', async () => {
      const {call} = setup();
      const id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

      // User 1
      const model = Model.withLogicalClock();
      model.api.root({
        text: 'Hell',
      });
      const patch1 = model.api.flush();
      await call('block.new', {
        id,
        patches: [
          {
            seq: 0,
            created: Date.now(),
            blob: patch1.toBinary(),
          },
        ],
      });

      // User 2
      const block2 = await call('block.get', {id});
      const model2 = Model.fromBinary(block2.block.blob).fork();
      model2.api.str(['text']).ins(4, ' yeah!');
      const patch2User2 = model2.api.flush();
      await call('block.upd', {
        id,
        patches: [
          {
            seq: 1,
            created: Date.now(),
            blob: patch2User2.toBinary(),
          },
        ],
      });
      expect(model2.view()).toStrictEqual({text: 'Hell yeah!'});

      const block3 = await call('block.get', {id});
      const model3 = Model.fromBinary(block3.block.blob).fork();
      expect(model3.view()).toStrictEqual({text: 'Hell yeah!'});

      // User 1
      model.api.str(['text']).ins(4, 'o');
      const patch2 = model.api.flush();
      model.api.str(['text']).ins(5, ' World');
      const patch3 = model.api.flush();
      const {patches} = await call('block.upd', {
        id,
        patches: [
          {
            seq: 1,
            created: Date.now(),
            blob: patch2.toBinary(),
          },
          {
            seq: 2,
            created: Date.now(),
            blob: patch3.toBinary(),
          },
        ],
      });

      const block4 = await call('block.get', {id});
      const model4 = Model.fromBinary(block4.block.blob).fork();
      expect(model4.view()).not.toStrictEqual({text: 'Hell yeah!'});
    });

    test('returns patches that happened concurrently', async () => {
      const {call} = setup();
      const id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

      // User 1
      const model = Model.withLogicalClock();
      model.api.root({
        text: 'Hell',
      });
      const patch1 = model.api.flush();
      await call('block.new', {
        id,
        patches: [
          {
            seq: 0,
            created: Date.now(),
            blob: patch1.toBinary(),
          },
        ],
      });

      // User 2
      const block2 = await call('block.get', {id});
      const model2 = Model.fromBinary(block2.block.blob).fork();
      model2.api.str(['text']).ins(4, ' yeah!');
      const patch2User2 = model2.api.flush();
      await call('block.upd', {
        id,
        patches: [
          {
            seq: 1,
            created: Date.now(),
            blob: patch2User2.toBinary(),
          },
        ],
      });

      // User 1
      model.api.str(['text']).ins(4, 'o');
      const patch2 = model.api.flush();
      model.api.str(['text']).ins(5, ' World');
      const patch3 = model.api.flush();
      const {patches} = await call('block.upd', {
        id,
        patches: [
          {
            seq: 1,
            created: Date.now(),
            blob: patch2.toBinary(),
          },
          {
            seq: 2,
            created: Date.now(),
            blob: patch3.toBinary(),
          },
        ],
      });
      expect(patches.length).toBe(3);
      expect(patches[0].seq).toBe(1);
      expect(patches[1].seq).toBe(2);
      expect(patches[2].seq).toBe(3);
      expect(patches[1].blob).toStrictEqual(patch2.toBinary());
      expect(patches[2].blob).toStrictEqual(patch3.toBinary());
    });
  });

  describe('block.listen', () => {
    test('can listen for block changes', async () => {
      const {client} = setup();
      await client.call('block.new', {id: 'my-block', patches: []});
      await tick(11);
      const emits: any[] = [];
      client.call$('block.listen', {id: 'my-block'}).subscribe((data) => emits.push(data));
      const model = Model.withLogicalClock();
      model.api.root({
        text: 'Hell',
      });
      const patch1 = model.api.flush();
      await tick(12);
      expect(emits.length).toBe(0);
      await client.call('block.upd', {
        id: 'my-block',
        patches: [{seq: 0, created: Date.now(), blob: patch1.toBinary()}],
      });
      await until(() => emits.length === 1);
      expect(emits.length).toBe(1);
      expect(emits[0].patches.length).toBe(1);
      expect(emits[0].patches[0].seq).toBe(0);
      model.api.root({
        text: 'Hello',
      });
      const patch2 = model.api.flush();
      await tick(12);
      expect(emits.length).toBe(1);
      await client.call('block.upd', {
        id: 'my-block',
        patches: [{seq: 1, created: Date.now(), blob: patch2.toBinary()}],
      });
      await until(() => emits.length === 2);
      expect(emits.length).toBe(2);
      expect(emits[1].patches.length).toBe(1);
      expect(emits[1].patches[0].seq).toBe(1);
    });

    test('can subscribe before block is created', async () => {
      const {client} = setup();
      const emits: any[] = [];
      client.call$('block.listen', {id: 'my-block'}).subscribe((data) => emits.push(data));
      const model = Model.withLogicalClock();
      model.api.root({
        text: 'Hell',
      });
      const patch1 = model.api.flush();
      await tick(12);
      expect(emits.length).toBe(0);
      await client.call('block.new', {
        id: 'my-block',
        patches: [
          {
            seq: 0,
            created: Date.now(),
            blob: patch1.toBinary(),
          },
        ],
      });
      await until(() => emits.length === 1);
      expect(emits.length).toBe(1);
      expect(emits[0].patches.length).toBe(1);
      expect(emits[0].patches[0].seq).toBe(0);
      expect(emits[0].patches[0].blob).toStrictEqual(patch1.toBinary());
    });

    test('can receive deletion events', async () => {
      const {client} = setup();
      const emits: any[] = [];
      client.call$('block.listen', {id: 'my-block'}).subscribe((data) => emits.push(data));
      await client.call('block.new', {id: 'my-block', patches: []});
      await until(() => emits.length === 1);
      expect(emits[0].block.seq).toBe(-1);
      await tick(3);
      await client.call('block.del', {id: 'my-block'});
      await until(() => emits.length === 2);
      expect(emits[1].deleted).toBe(true);
    });
  });

  describe('block.scan', () => {
    test('can retrieve change history', async () => {
      const {client} = setup();
      const model = Model.withLogicalClock();
      model.api.root({
        text: 'Hell',
      });
      const patch1 = model.api.flush();
      await client.call('block.new', {
        id: 'my-block',
        patches: [
          {
            seq: 0,
            created: Date.now(),
            blob: patch1.toBinary(),
          },
        ],
      });
      await tick(11);
      model.api.str(['text']).ins(4, 'o');
      const patch2 = model.api.flush();
      model.api.obj([]).set({
        age: 26,
      });
      const patch3 = model.api.flush();
      await client.call('block.upd', {
        id: 'my-block',
        patches: [
          {
            seq: 1,
            created: Date.now(),
            blob: patch2.toBinary(),
          },
          {
            seq: 2,
            created: Date.now(),
            blob: patch3.toBinary(),
          },
        ],
      });
      const history = await client.call('block.scan', {id: 'my-block', seq: 0, limit: 3});
      expect(history).toMatchObject({
        patches: [
          {
            seq: 0,
            created: expect.any(Number),
            blob: patch1.toBinary(),
          },
          {
            seq: 1,
            created: expect.any(Number),
            blob: patch2.toBinary(),
          },
          {
            seq: 2,
            created: expect.any(Number),
            blob: patch3.toBinary(),
          },
        ],
      });
    });
  });

  describe('block.get', () => {
    test('returns whole history when block is loaded', async () => {
      const {client} = setup();
      const model = Model.withLogicalClock();
      model.api.root({
        text: 'Hell',
      });
      const patch1 = model.api.flush();
      await client.call('block.new', {
        id: 'my-block',
        patches: [
          {
            seq: 0,
            created: Date.now(),
            blob: patch1.toBinary(),
          },
        ],
      });
      model.api.str(['text']).ins(4, 'o');
      const patch2 = model.api.flush();
      model.api.obj([]).set({
        age: 26,
      });
      const patch3 = model.api.flush();
      await client.call('block.upd', {
        id: 'my-block',
        patches: [
          {
            seq: 1,
            created: Date.now(),
            blob: patch2.toBinary(),
          },
          {
            seq: 2,
            created: Date.now(),
            blob: patch3.toBinary(),
          },
        ],
      });
      const result = await client.call('block.get', {id: 'my-block'});
      expect(result).toMatchObject({
        block: expect.any(Object),
        patches: [
          {
            seq: 0,
            created: expect.any(Number),
            blob: patch1.toBinary(),
          },
          {
            seq: 1,
            created: expect.any(Number),
            blob: patch2.toBinary(),
          },
          {
            seq: 2,
            created: expect.any(Number),
            blob: patch3.toBinary(),
          },
        ],
      });
    });
  });
});
