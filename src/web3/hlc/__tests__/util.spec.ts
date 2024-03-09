import {create, toDto, inc, Hlc, cmp, cmpDto, merge} from '../util';
import {HlcDto} from '../types.js';

describe('create()', () => {
  test('can create an HLC instance', () => {
    const hlc = create(5, 0);
    expect(hlc.ts).toBe(5);
    expect(hlc.seq).toBe(0);
    expect(hlc.node).toBe(0);
  });
});

describe('toDto()', () => {
  test('can serialize an HLC', () => {
    const hlc = new Hlc(1, 2, 3);
    const dto = toDto(hlc);
    expect(dto).toStrictEqual([1, 2, 3]);
  });
});

describe('inc()', () => {
  test('increments time, if wall clock incremented', () => {
    const hlc1 = new Hlc(1, 2, 3);
    const hlc2 = inc(hlc1, 2);
    expect(hlc2.ts).toBe(2);
    expect(hlc2.seq).toBe(0);
    expect(hlc2.node).toBe(3);
  });

  test('increments sequence number, if wall clock the same', () => {
    const hlc1 = new Hlc(1, 2, 3);
    const hlc2 = inc(hlc1, 1);
    expect(hlc2.ts).toBe(1);
    expect(hlc2.seq).toBe(3);
    expect(hlc2.node).toBe(3);
  });

  test('increments sequence number, if wall clock decremented (for whatever reason)', () => {
    const hlc1 = new Hlc(11, 2, 3);
    const hlc2 = inc(hlc1, 10);
    expect(hlc2.ts).toBe(11);
    expect(hlc2.seq).toBe(3);
    expect(hlc2.node).toBe(3);
  });
});

describe('cmp()', () => {
  test('compares by wall clocks, if they are different', () => {
    const hlc1 = new Hlc(1, 2, 3);
    const hlc2 = new Hlc(4, 5, 6);
    const result = cmp(hlc1, hlc2);
    expect(result).toBe(1 - 4);
  });

  test('compares by wall clocks, if they are different - 2', () => {
    const hlc1 = new Hlc(1, 2, 3);
    const hlc2 = new Hlc(4, 5, 6);
    const result = cmp(hlc2, hlc1);
    expect(result).toBe(4 - 1);
  });

  test('compares by sequence numbers, if wall clocks equal and sequence numbers different', () => {
    const hlc1 = new Hlc(1, 2, 3);
    const hlc2 = new Hlc(1, 4, 5);
    expect(cmp(hlc1, hlc2)).toBe(2 - 4);
    expect(cmp(hlc2, hlc1)).toBe(4 - 2);
  });

  test('compares by node ID, if wall clocks equal and sequence numbers equal', () => {
    const hlc1 = new Hlc(1, 2, 55);
    const hlc2 = new Hlc(1, 2, 66);
    expect(cmp(hlc1, hlc2)).toBe(55 - 66);
    expect(cmp(hlc2, hlc1)).toBe(66 - 55);
  });
});

describe('cmpDto()', () => {
  test('compares by wall clocks, if they are different', () => {
    const hlc1: HlcDto = [1, 2, 3];
    const hlc2: HlcDto = [4, 5, 6];
    const result = cmpDto(hlc1, hlc2);
    expect(result).toBe(1 - 4);
  });

  test('compares by wall clocks, if they are different - 2', () => {
    const hlc1: HlcDto = [1, 2, 3];
    const hlc2: HlcDto = [4, 5, 6];
    const result = cmpDto(hlc2, hlc1);
    expect(result).toBe(4 - 1);
  });

  test('compares by sequence numbers, if wall clocks equal and sequence numbers different', () => {
    const hlc1: HlcDto = [1, 2, 3];
    const hlc2: HlcDto = [1, 4, 5];
    expect(cmpDto(hlc1, hlc2)).toBe(2 - 4);
    expect(cmpDto(hlc2, hlc1)).toBe(4 - 2);
  });

  test('compares by node ID, if wall clocks equal and sequence numbers equal', () => {
    const hlc1: HlcDto = [1, 2, 55];
    const hlc2: HlcDto = [1, 2, 66];
    expect(cmpDto(hlc1, hlc2)).toBe(55 - 66);
    expect(cmpDto(hlc2, hlc1)).toBe(66 - 55);
  });
});

describe('merge()', () => {
  test('uses wall clock, if wall clock greater than local and remote timestamp', () => {
    const local = new Hlc(1, 2, 3);
    const remote = new Hlc(4, 5, 6);
    const merged = merge(local, remote, 10);
    expect(merged.ts).toBe(10);
    expect(merged.seq).toBe(0);
    expect(merged.node).toBe(3);
  });

  test('uses greatest sequence number, when wall clocks equal', () => {
    const local = new Hlc(100, 2, 3);
    const remote = new Hlc(100, 5, 6);
    const merged = merge(local, remote, 10);
    expect(merged.ts).toBe(100);
    expect(merged.seq).toBe(5);
    expect(merged.node).toBe(3);
  });

  test('uses greatest sequence number, when wall clocks equal - 2', () => {
    const local = new Hlc(100, 22, 3);
    const remote = new Hlc(100, 5, 6);
    const merged = merge(local, remote, 10);
    expect(merged.ts).toBe(100);
    expect(merged.seq).toBe(22);
    expect(merged.node).toBe(3);
  });

  test('increments local sequence number, if local wall clock is greatest', () => {
    const local = new Hlc(200, 22, 3);
    const remote = new Hlc(100, 5, 6);
    const merged = merge(local, remote, 10);
    expect(merged.ts).toBe(200);
    expect(merged.seq).toBe(23);
    expect(merged.node).toBe(3);
  });

  test('increments remote sequence number, if remote wall clock is greatest', () => {
    const local = new Hlc(200, 22, 3);
    const remote = new Hlc(300, 5, 6);
    const merged = merge(local, remote, 10);
    expect(merged.ts).toBe(300);
    expect(merged.seq).toBe(6);
    expect(merged.node).toBe(3);
  });
});
