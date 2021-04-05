import {LogicalTimestamp} from '../clock';

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
