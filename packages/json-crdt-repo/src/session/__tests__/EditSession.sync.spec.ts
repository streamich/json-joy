import {s} from 'json-joy/lib/json-crdt';
import {setup} from './setup';
import {until} from 'thingies/lib/until';
import {tick} from 'thingies';

describe('sync', () => {
  test('removes patches from log on sync', async () => {
    const kit = await setup();
    const schema = s.obj({id: s.con('asdf')});
    const {session} = kit.sessions.make({id: kit.blockId, schema});
    expect(session.model.view()).toEqual({id: 'asdf'});
    expect(session.log.patches.size()).toBe(1);
    await session.sync();
    expect(session.log.patches.size()).toBe(0);
    session.model.api.obj([]).set({s1: 's1'});
    session.model.api.flush();
    expect(session.log.patches.size()).toBe(1);
    session.model.api.obj([]).set({s2: 's2'});
    session.model.api.flush();
    expect(session.log.patches.size()).toBe(2);
    await session.sync();
    expect(session.log.patches.size()).toBe(0);
    await session.dispose();
    await kit.stop();
  });

  test('can edit two sessions in parallel', async () => {
    const kit = await setup();
    const schema = s.obj({id: s.con('asdf')});
    const {session: session1} = kit.sessions.make({id: kit.blockId, schema, session: 1});
    const {session: session2} = kit.sessions.make({id: kit.blockId, schema, session: 2});
    expect(session1.model.view()).toEqual({id: 'asdf'});
    expect(session2.model.view()).toEqual({id: 'asdf'});
    await session1.sync();
    await session2.sync();
    session1.model.api.obj([]).set({s1: 's1'});
    session2.model.api.obj([]).set({s2: 's2'});
    expect(session1.model.view()).toMatchObject({id: 'asdf', s1: 's1'});
    expect(session2.model.view()).toMatchObject({id: 'asdf', s2: 's2'});
    await session1.sync();
    expect(session1.model.view()).toMatchObject({id: 'asdf', s1: 's1'});
    expect(session2.model.view()).toMatchObject({id: 'asdf', s2: 's2'});
    await session2.sync();
    await until(() => session1.model.view().s2 === 's2');
    await until(() => session2.model.view().s1 === 's1');
    expect(session1.model.view()).toEqual({id: 'asdf', s1: 's1', s2: 's2'});
    expect(session2.model.view()).toEqual({id: 'asdf', s2: 's2', s1: 's1'});
    await session1.dispose();
    await session2.dispose();
    await kit.stop();
  });

  test('concurrently creating same ID block with same schema, results in predictable logical time', async () => {
    const kit = await setup();
    const schema = s.obj({a: s.con('a')});
    const {session: session1} = kit.sessions.make({id: kit.blockId, schema});
    const {session: session2} = kit.sessions.make({id: kit.blockId, schema});
    expect(session1.model.view()).toEqual({a: 'a'});
    expect(session2.model.view()).toEqual({a: 'a'});
    await session1.sync();
    await session2.sync();
    expect(session1.model.clock.time).toBe(session2.model.clock.time);
    const {model} = await kit.local.sync({
      id: kit.blockId,
    });
    expect(model!.clock.time).toBe(session1.model.clock.time);
    await session1.dispose();
    await session2.dispose();
    await kit.stop();
  });

  test('sessions created just after the first one, converges in state', async () => {
    const kit = await setup();
    const schema = s.obj({a: s.con('a')});
    const {session: session1} = kit.sessions.make({id: kit.blockId, schema, session: 1});
    const {session: session2} = kit.sessions.make({id: kit.blockId, schema, session: 2});
    await session1.sync();
    await session2.sync();
    expect(session1.log.patches.size()).toBe(0);
    session1.model.api.obj([]).set({b: 'b'});
    session1.model.api.obj([]).set({c: 'c'});
    await tick(5);
    session1.model.api.obj([]).set({d: 'd'});
    const {session: session3} = kit.sessions.make({id: kit.blockId, pull: true, schema, session: 3});
    await tick(5);
    session1.model.api.obj([]).set({e: 'e'});
    await tick(5);
    session1.model.api.obj([]).set({f: 'f'});
    await session1.sync();
    await until(async () => {
      try {
        expect(session1.model.view()).toEqual(session3.model.view());
        return true;
      } catch {
        return false;
      }
    });
    await session1.dispose();
    await session2.dispose();
    await session3.dispose();
    await kit.stop();
  });

  test('sessions converge to the same view', async () => {
    const kit = await setup();
    const schema = s.obj({a: s.con('a')});
    const {session: session1} = kit.sessions.make({id: kit.blockId, schema, session: 1});
    const {session: session2} = kit.sessions.make({id: kit.blockId, schema, session: 2});
    await session1.sync();
    await session2.sync();
    expect(session1.log.patches.size()).toBe(0);
    expect(session2.log.patches.size()).toBe(0);
    session1.model.api.obj([]).set({b: 'b'});
    session1.model.api.obj([]).set({c: 'c'});
    await tick(5);
    session1.model.api.obj([]).set({d: 'd'});
    const {session: session3} = kit.sessions.make({id: kit.blockId, schema, session: 3});
    await tick(5);
    session1.model.api.obj([]).set({e: 'e'});
    await tick(5);
    session1.model.api.obj([]).set({f: 'f'});
    const {session: session4} = kit.sessions.make({id: kit.blockId, schema, session: 4});
    await session1.sync();
    await until(async () => {
      try {
        expect(session1.model.view()).toEqual(session2.model.view());
        return true;
      } catch {
        return false;
      }
    });
    await until(async () => {
      try {
        expect(session1.model.view()).toEqual(session3.model.view());
        return true;
      } catch {
        return false;
      }
    });
    await until(async () => {
      try {
        expect(session1.model.view()).toEqual(session4.model.view());
        return true;
      } catch {
        return false;
      }
    });
    expect(session1.model.view()).toEqual({a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f'});
    expect(session1.model.view()).toEqual(session2.model.view());
    expect(session1.model.view()).toEqual(session3.model.view());
    expect(session1.model.view()).toEqual(session4.model.view());
    await session1.dispose();
    await session2.dispose();
    await session3.dispose();
    await session4.dispose();
    await kit.stop();
  });
});
