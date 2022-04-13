import {Model} from '../../Model';

test('can rebase when user clock is behind server clock', () => {
  const server = Model.withServerClock();
  server.api.root({}).commit();
  server.api.flush();
  const user = server.clone();
  user.api.obj([]).set({user: 1}).commit();
  user.api.obj([]).set({user2: 2}).commit();
  server.api.obj([]).set({server: 1}).commit();
  expect(user.toView()).toStrictEqual({user: 1, user2: 2});
  expect(server.toView()).toStrictEqual({server: 1});
  const batch = user.api.flush();
  expect(batch.getId()!.time < server.clock.time).toBe(true);
  const batch2 = batch.rebase(server.clock.time);
  expect(batch2.getId()!.time).toBe(server.clock.time);
  server.applyBatch(batch2);
  expect(server.toView()).toEqual({
    user: 1,
    user2: 2,
    server: 1,
  });
});

test('can rebase when user clock is ahead server clock', () => {
  const server = Model.withServerClock();
  server.api.root({}).commit();
  server.api.flush();
  const user = server.clone();
  user.api.obj([]).set({user: 1}).commit();
  user.api.flush();
  user.api.obj([]).set({user2: 2}).commit();
  user.api.obj([]).set({user3: 3}).commit();
  expect(user.toView()).toStrictEqual({user: 1, user2: 2, user3: 3});
  expect(server.toView()).toStrictEqual({});
  const batch = user.api.flush();
  expect(batch.getId()!.time > server.clock.time).toBe(true);
  const batch2 = batch.rebase(server.clock.time);
  expect(batch2.getId()!.time).toBe(server.clock.time);
  server.applyBatch(batch2);
  expect(server.toView()).toEqual({
    user2: 2,
    user3: 3,
  });
});
