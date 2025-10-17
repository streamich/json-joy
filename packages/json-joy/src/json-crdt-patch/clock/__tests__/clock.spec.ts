import {ts, ClockVector} from '..';

test('cloning returns clock with the same session ID and time', () => {
  const clock = new ClockVector(1, 2);
  clock.observe(ts(1, 0), 1);
  const clock2 = clock.clone();
  expect(clock2.sid).toBe(clock.sid);
  expect(clock2.time).toBe(clock.time);
});

test('cloning clones all clocks in vector', () => {
  const clock = new ClockVector(1, 1);
  clock.observe(ts(1, 1), 1);
  clock.observe(ts(2, 2), 1);
  clock.observe(ts(3, 3), 1);
  expect(clock.sid).toBe(1);
  expect(clock.time).toBe(4);
  expect(clock.peers.get(2)!.time).toBe(2);
  expect(clock.peers.get(3)!.time).toBe(3);
  const cloned = clock.clone();
  expect(cloned.sid).toBe(1);
  expect(cloned.peers.size).toBe(clock.peers.size);
  expect(cloned.time).toBe(4);
  expect(cloned.peers.get(2)!.time).toBe(2);
  expect(cloned.peers.get(3)!.time).toBe(3);
});

test('forking returns clock with the same session ID and time', () => {
  const clock = new ClockVector(1, 2);
  const clock2 = clock.fork(4);
  expect(clock2.sid).toBe(4);
  expect(clock2.time).toBe(clock.time);
});

test('forking clones all clocks in vector', () => {
  const clock = new ClockVector(1, 1);
  clock.observe(ts(1, 1), 1);
  clock.observe(ts(2, 2), 1);
  clock.observe(ts(3, 3), 1);
  expect(clock.sid).toBe(1);
  expect(clock.time).toBe(4);
  expect(clock.peers.get(2)!.time).toBe(2);
  expect(clock.peers.get(3)!.time).toBe(3);
  const cloned = clock.fork(10);
  cloned.observe(ts(4, 2), 1);
  cloned.observe(ts(5, 4), 1);
  expect(cloned.sid).toBe(10);
  expect(clock.peers.size).toBe(2);
  expect(cloned.peers.size).toBe(5);
  expect(cloned.time).toBe(5);
  expect(cloned.peers.get(1)!.time).toBe(3);
  expect(cloned.peers.get(2)!.time).toBe(2);
  expect(cloned.peers.get(3)!.time).toBe(3);
  expect(cloned.peers.get(4)!.time).toBe(2);
  expect(cloned.peers.get(5)!.time).toBe(4);
});
