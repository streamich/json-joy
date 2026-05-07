import {Model, s} from 'json-joy/lib/json-crdt';
import {until} from 'thingies/lib/until';
import {Testbed} from '../../__tests__/testbed';

describe('block full state resets', () => {
  test('resets local state when remote sequence moves backwards', async () => {
    const testbed = Testbed.create();
    const repo = testbed.createBrowser().createTab().createRepo();
    const id = repo.blockId;
    const schema = s.obj({id: s.con('asdf')});

    const {session} = repo.sessions.make({id, schema});
    await session.sync();
    session.model.api.obj([]).set({x: 123});
    await session.sync();
    session.model.api.obj([]).set({y: 456});
    const syncRes = await session.sync();
    await syncRes?.remote;
    expect(session.model.view()).toEqual({id: 'asdf', x: 123, y: 456});

    await until(async () => {
      try {
        const model = await testbed.getModelFromRemote(id);
        expect(model.view()).toEqual({id: 'asdf', x: 123, y: 456});
        return true;
      } catch {
        return false;
      }
    });

    await session.dispose();

    await testbed.remote.client.call('block.del', {id: id.join('/')});
    const recreated = Model.create();
    recreated.api.root({id: 'kek'});
    const patch = recreated.api.flush();
    const res = await testbed.remote.client.call('block.new', {
      id: id.join('/'),
      batch: {patches: [{blob: patch.toBinary()}]},
    });
    expect(res.snapshot.seq).toBe(0);

    const loaded = await repo.sessions.load({id, pull: true});
    expect(loaded.model.view()).toEqual({id: 'asdf', x: 123, y: 456});
    await until(() => loaded.model.view()?.id === 'kek');
    expect(loaded.model.view()).toEqual({id: 'kek'});

    await loaded.dispose();
    await repo.stopTab();
  }, 60_000);
});
