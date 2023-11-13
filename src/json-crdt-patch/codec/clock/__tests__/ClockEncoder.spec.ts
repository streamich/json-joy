import {ts, ClockVector} from '../../../clock';
import {ClockEncoder} from '../ClockEncoder';

test('always encodes the default clock', () => {
  const clock = new ClockVector(123, 5);
  clock.observe(ts(123, 5), 1);
  const encoder = new ClockEncoder();
  encoder.reset(clock);
  const encoded = encoder.toJson();
  expect(encoded).toEqual([123, 5]);
});

test('encodes the default clock as first', () => {
  const clock = new ClockVector(3, 10);
  clock.observe(ts(3, 10), 1);
  const stamp = ts(2, 5);
  clock.observe(stamp, 1);
  const encoder = new ClockEncoder();
  encoder.reset(clock);
  encoder.append(stamp);
  const encoded = encoder.toJson();
  expect(encoded).toEqual([3, 10, 2, 5]);
});

test('does not encode clocks which are not appended', () => {
  const clock = new ClockVector(3, 10);
  clock.observe(ts(3, 10), 1);
  const stamp = ts(2, 5);
  clock.observe(stamp, 1);
  const encoder = new ClockEncoder();
  encoder.reset(clock);
  const encoded = encoder.toJson();
  expect(encoded).toEqual([3, 10]);
});

test('encodes each clock only once', () => {
  const clock = new ClockVector(100, 100);
  clock.observe(ts(100, 100), 1);
  const ts1 = ts(50, 50);
  const ts2 = ts(10, 10);
  clock.observe(ts1, 1);
  clock.observe(ts2, 1);
  const encoder = new ClockEncoder();
  encoder.reset(clock);
  encoder.append(ts1);
  encoder.append(ts2);
  encoder.append(ts(10, 6));
  encoder.append(ts(10, 3));
  encoder.append(ts(50, 34));
  const encoded = encoder.toJson();
  expect(encoded).toEqual([100, 100, 50, 50, 10, 10]);
});
