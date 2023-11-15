import {Model} from '../../json-crdt';
import {Value} from '../../reactive-rpc/common/messages/Value';
import {RpcError, RpcErrorCodes} from '../../reactive-rpc/common/rpc/caller';
import {setup} from './setup';

describe('blocks.*', () => {
  describe('blocks.create', () => {
    test('can create an empty block', async () => {
      const {caller} = setup();
      await caller.call('blocks.create', {id: 'my-block', patches: []}, {});
      const {block} = (await caller.call('blocks.get', {id: 'my-block'}, {})).data;
      expect(block).toMatchObject({
        id: 'my-block',
        seq: 0,
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
      await call('blocks.create', {
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
      const {block} = await call('blocks.get', {id: '123412341234'});
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

  describe('blocks.remove', () => {
    test('can remove an existing block', async () => {
      const {call} = setup();
      await call('blocks.create', {id: 'my-block', patches: []});
      const {block} = await call('blocks.get', {id: 'my-block'});
      expect(block.id).toBe('my-block');
      await call('blocks.remove', {id: 'my-block'});
      try {
        await call('blocks.get', {id: 'my-block'});
        throw new Error('not this error');
      } catch (err) {
        if (!(err instanceof Value)) throw err;
        const error = err.data;
        if (!(error instanceof RpcError)) throw err;
        expect(error.errno).toBe(RpcErrorCodes.NOT_FOUND);
      }
    });
  });
});
