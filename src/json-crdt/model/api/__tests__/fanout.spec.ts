import {MapFanOut, MergeFanOut, MicrotaskBufferFanOut, OnNewFanOut} from '../fanout';
import {FanOut} from 'thingies/lib/fanout';

describe('MergeFanOut', () => {
  test('merges data from multiple fanouts', () => {
    const fanout1 = new FanOut<number>();
    const fanout2 = new FanOut<number>();
    const fanout3 = new FanOut<number>();
    const merged = new MergeFanOut<number>([fanout1, fanout2, fanout3]);
    const data: number[] = [];
    const unsub = merged.listen((d) => data.push(d));
    fanout1.emit(1);
    fanout2.emit(2);
    fanout3.emit(3);
    expect(data).toEqual([1, 2, 3]);
    unsub();
    fanout1.emit(1);
    fanout2.emit(2);
    fanout3.emit(3);
    expect(data).toEqual([1, 2, 3]);
    merged.listen((d) => data.push(d));
    fanout3.emit(3);
    fanout2.emit(2);
    fanout1.emit(1);
    expect(data).toEqual([1, 2, 3, 3, 2, 1]);
  });
});

describe('MicrotaskBufferFanOut', () => {
  test('buffers multiple emissions by microtask', async () => {
    const source = new FanOut<number>();
    const merged = new MicrotaskBufferFanOut<number>(source);
    const data: number[][] = [];
    const unsub = merged.listen((d) => data.push(d));
    expect(data.length).toBe(0);
    source.emit(1);
    source.emit(2);
    source.emit(3);
    expect(data.length).toBe(0);
    await Promise.resolve();
    expect(data).toEqual([[1, 2, 3]]);
    source.emit(1);
    source.emit(2);
    source.emit(3);
    unsub();
    source.emit(1);
    source.emit(2);
    source.emit(3);
    await Promise.resolve();
    expect(data).toEqual([[1, 2, 3]]);
    merged.listen((d) => data.push(d));
    source.emit(1);
    source.emit(2);
    source.emit(3);
    await Promise.resolve();
    expect(data).toEqual([
      [1, 2, 3],
      [1, 2, 3],
    ]);
  });
});

describe('MapFanOut', () => {
  test('can multiply all values by 2x', () => {
    const source = new FanOut<number>();
    const merged = new MapFanOut<number, number>(source, (x) => x * 2);
    const data: number[] = [];
    const unsub = merged.listen((d) => data.push(d));
    expect(data.length).toBe(0);
    source.emit(1);
    source.emit(2);
    source.emit(3);
    expect(data.length).toBe(3);
    expect(data).toEqual([2, 4, 6]);
    unsub();
    source.emit(1);
    source.emit(2);
    source.emit(3);
    expect(data.length).toBe(3);
    merged.listen((d) => data.push(d));
    source.emit(4);
    expect(data).toEqual([2, 4, 6, 8]);
  });
});

describe('OnNewFanOut', () => {
  test('emits only new value changes', () => {
    const obj1 = {};
    const obj2 = {};
    const source = new FanOut<any>();
    const merged = new OnNewFanOut<any>(source);
    const data: any[] = [];
    const unsub = merged.listen((d) => data.push(d));
    expect(data.length).toBe(0);
    source.emit(obj1);
    expect(data.length).toBe(1);
    expect(data).toEqual([obj1]);
    source.emit(obj1);
    expect(data.length).toBe(1);
    source.emit(obj2);
    source.emit(obj2);
    expect(data.length).toBe(2);
    expect(data).toEqual([obj1, obj2]);
    unsub();
    source.emit(obj1);
    source.emit(obj2);
    expect(data.length).toBe(2);
    expect(data).toEqual([obj1, obj2]);
    merged.listen((d) => data.push(d));
    source.emit(obj2);
    expect(data.length).toBe(3);
    expect(data).toEqual([obj1, obj2, obj2]);
  });
});
