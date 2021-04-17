import {LogicalClock, LogicalTimestamp, LogicalVectorClock} from '../logical';

describe('.overlap()', () => {
  const cases: [LogicalTimestamp, number, LogicalTimestamp, number, number][] = [
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 2), 2, 0],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 10), 1, 1],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 10), 2, 2],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 9), 1, 0],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 9), 2, 1],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 9), 3, 2],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 9), 5, 4],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 9), 7, 6],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 9), 9, 8],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 9), 11, 10],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 9), 13, 10],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 11), 13, 9],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 18), 13, 2],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 19), 13, 1],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 20), 13, 0],
    [new LogicalTimestamp(1, 10), 10, new LogicalTimestamp(1, 21), 13, 0],
    [new LogicalTimestamp(1, 111), 1, new LogicalTimestamp(1, 111), 1, 1],
    [new LogicalTimestamp(1, 111), 1, new LogicalTimestamp(1, 111), 2, 1],
    [new LogicalTimestamp(1, 111), 2, new LogicalTimestamp(1, 111), 2, 2],
    [new LogicalTimestamp(1, 111), 2, new LogicalTimestamp(1, 112), 2, 1],
    [new LogicalTimestamp(1, 1), 2, new LogicalTimestamp(1, 44), 2, 0],
    [new LogicalTimestamp(1, 33), 2, new LogicalTimestamp(1, 1), 4, 0],
  ];
  for (const [ts1, span1, ts2, span2, result] of cases) {
    test(`returns the size of overlapping span (${ts1.time}, ${span1}, ${ts2.time}, ${span2} = ${result})`, () => {
      expect(ts1.overlap(span1, ts2, span2)).toBe(result);
    });
  }
});

test('cloning returns clock with the same session ID and time', () => {
  const clock = new LogicalVectorClock(1, 2);
  clock.observe(new LogicalTimestamp(1, 0), 1);
  const clock2 = clock.clone();
  expect(clock2.getSessionId()).toBe(clock.getSessionId());
  expect(clock2.time).toBe(clock.time);
});

test('cloning clones all clocks in vector', () => {
  const clock = new LogicalVectorClock(1, 1);
  clock.observe(new LogicalTimestamp(1, 1), 1);
  clock.observe(new LogicalTimestamp(2, 2), 1);
  clock.observe(new LogicalTimestamp(3, 3), 1);
  expect(clock.getSessionId()).toBe(1);
  expect(clock.time).toBe(4);
  expect(clock.clocks.get(1)!.time).toBe(1);
  expect(clock.clocks.get(2)!.time).toBe(2);
  expect(clock.clocks.get(3)!.time).toBe(3);
  const cloned = clock.clone();
  expect(cloned.getSessionId()).toBe(1);
  expect(cloned.clocks.size).toBe(clock.clocks.size);
  expect(cloned.time).toBe(4);
  expect(cloned.clocks.get(1)!.time).toBe(1);
  expect(cloned.clocks.get(2)!.time).toBe(2);
  expect(cloned.clocks.get(3)!.time).toBe(3);
});

test('forking returns clock with the same session ID and time', () => {
  const clock = new LogicalVectorClock(1, 2);
  const clock2 = clock.fork(4);
  expect(clock2.getSessionId()).toBe(4);
  expect(clock2.time).toBe(clock.time);
});

test('forking clones all clocks in vector', () => {
  const clock = new LogicalVectorClock(1, 1);
  clock.observe(new LogicalTimestamp(1, 1), 1);
  clock.observe(new LogicalTimestamp(2, 2), 1);
  clock.observe(new LogicalTimestamp(3, 3), 1);
  expect(clock.getSessionId()).toBe(1);
  expect(clock.time).toBe(4);
  expect(clock.clocks.get(1)!.time).toBe(1);
  expect(clock.clocks.get(2)!.time).toBe(2);
  expect(clock.clocks.get(3)!.time).toBe(3);
  const cloned = clock.fork(10);
  cloned.observe(new LogicalTimestamp(4, 2), 1);
  cloned.observe(new LogicalTimestamp(5, 4), 1);
  expect(cloned.getSessionId()).toBe(10);
  expect(cloned.clocks.size).toBe(clock.clocks.size + 2);
  expect(cloned.time).toBe(5);
  expect(cloned.clocks.get(1)!.time).toBe(1);
  expect(cloned.clocks.get(2)!.time).toBe(2);
  expect(cloned.clocks.get(3)!.time).toBe(3);
  expect(cloned.clocks.get(4)!.time).toBe(2);
  expect(cloned.clocks.get(5)!.time).toBe(4);
});
