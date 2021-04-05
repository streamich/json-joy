import {LogicalTimestamp} from '../../../clock';
import {encodeTimestamp} from '../encode';

test('encodes simple timestamps', () => {
  expect(encodeTimestamp(new LogicalTimestamp(0, 0))).toEqual([0, 0]);
  expect(encodeTimestamp(new LogicalTimestamp(123, 333))).toEqual([123, 333]);
  expect(encodeTimestamp(new LogicalTimestamp(11123, 3333))).toEqual([11123, 3333]);
});

test('encodes timestamps where session ID is larger than 32 bits', () => {
  expect(encodeTimestamp(new LogicalTimestamp(0x06_FF_FF_FF_FF, 2))).toEqual([0xFFFFFFFF, 0x06_000002]);
  expect(encodeTimestamp(new LogicalTimestamp(0b01111111_00000000_11110000_00001111_11001100, 0b00110011_11110011_11111100)))
    .toEqual([0b00000000_11110000_00001111_11001100, 0b01111111_00110011_11110011_11111100]);
  expect(encodeTimestamp(new LogicalTimestamp(0b11111111_00000000_11110000_00001111_11001100, 0b00110011_11110011_11111100)))
    .toEqual([0b00000000_11110000_00001111_11001100, 0b11111111_00110011_11110011_11111100]);
  expect(encodeTimestamp(new LogicalTimestamp(0b11111111_10000000_11110000_00001111_11001100, 0b00110011_11110011_11111100)))
    .toEqual([0b10000000_11110000_00001111_11001100, 0b11111111_00110011_11110011_11111100]);
});
