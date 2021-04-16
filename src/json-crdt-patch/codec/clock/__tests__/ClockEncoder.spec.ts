import {LogicalTimestamp, LogicalVectorClock} from '../../../clock';
import {ClockEncoder} from '../ClockEncoder';

test('always encodes the default clock', () => {
  const clock = new LogicalVectorClock(123, 5);
  const encoder = new ClockEncoder(clock);
  const encoded = encoder.compact();
  expect(encoded).toBe('[123,5]');
});

test('encodes the default clock as first', () => {
  const clock = new LogicalVectorClock(3, 10);
  const ts = new LogicalTimestamp(2, 5);
  clock.observe(ts, 1);
  const encoder = new ClockEncoder(clock);
  encoder.append(ts);
  const encoded = encoder.compact();
  expect(encoded).toBe('[3,10,2,5]');
});

test('does not encode clocks which are not appended', () => {
  const clock = new LogicalVectorClock(3, 10);
  const ts = new LogicalTimestamp(2, 5);
  clock.observe(ts, 1);
  const encoder = new ClockEncoder(clock);
  // encoder.append(ts);
  const encoded = encoder.compact();
  expect(encoded).toBe('[3,10]');
});

test('encodes each clock only once', () => {
  const clock = new LogicalVectorClock(100, 100);
  const ts1 = new LogicalTimestamp(50, 50);
  const ts2 = new LogicalTimestamp(10, 10);
  clock.observe(ts1, 1);
  clock.observe(ts2, 1);
  const encoder = new ClockEncoder(clock);
  encoder.append(ts1);
  encoder.append(ts2);
  encoder.append(new LogicalTimestamp(10, 6));
  encoder.append(new LogicalTimestamp(10, 3));
  encoder.append(new LogicalTimestamp(50, 34));
  const encoded = encoder.compact();
  expect(encoded).toBe('[100,100,50,50,10,10]');
});

test('throws when unknown clock is being encoded', () => {
  const clock = new LogicalVectorClock(100, 100);
  const ts1 = new LogicalTimestamp(50, 50);
  const ts2 = new LogicalTimestamp(10, 10);
  clock.observe(ts1, 1);
  clock.observe(ts2, 1);
  const encoder = new ClockEncoder(clock);
  encoder.append(ts1);
  encoder.append(ts2);
  expect(() => encoder.append(new LogicalTimestamp(77, 77))).toThrow();
});
