import {s} from 'json-joy/lib/json-crdt';
import {tick} from 'thingies';
import {BehaviorSubject} from 'rxjs';
import {Testbed} from '../../__tests__/testbed';

describe('.del() catch-up timer race', () => {
  test('deleting a block does not throw from a pending catch-up timer', async () => {
    const rejections: unknown[] = [];
    const onRej = (err: unknown) => rejections.push(err);
    process.on('unhandledRejection', onRej);
    try {
      const repo = Testbed.createRepo({connected$: new BehaviorSubject(false)});
      const schema = s.obj({id: s.con('asdf')});
      const {session} = repo.sessions.make({id: repo.blockId, schema});
      await session.sync();
      const session2 = await repo.sessions.load({id: repo.blockId});
      await session2.del();
      await tick(120);
      await session.dispose();
      await session2.dispose();
      await repo.stopTab();
      await tick(10);
      const notFound = rejections.filter(
        (e) => (e as any)?.code === 'LEVEL_NOT_FOUND' || /not.?found/i.test(String((e as any)?.message ?? e)),
      );
      expect(notFound).toEqual([]);
    } finally {
      process.off('unhandledRejection', onRej);
    }
  });
});
