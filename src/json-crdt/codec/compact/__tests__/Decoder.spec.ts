import {LogicalVectorClock} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';

describe('logical', () => {
  test('decodes clock', () => {
    const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
    doc1.api.root(123).commit();
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc2.clock.getSessionId()).toBe(222);
    expect(doc2.clock.time).toBe(doc1.clock.time);
    expect(doc2.clock.clocks.size).toBe(1);
  });

  const encoder = new Encoder();

  test('decodes all types', () => {
    const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
    const json = {
      str: 'asdf',
      arr: [1, 2, 3],
      obj: {foo: 'bar'},
      num: 123.4,
      nil: null,
      bool: [true, false],
    };
    doc1.api.root(json).commit();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.toView()).toEqual(json);
    expect(doc2.toView()).toEqual(json);
  });

  test('can edit documents after decoding', () => {
    const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
    const json = {
      str: 'asdf',
      arr: [1, 2, 3],
      obj: {foo: 'bar'},
      num: 123.4,
      nil: null,
      bool: [true, false],
    };
    doc1.api.root(json).commit();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.toView()).toEqual(json);
    expect(doc2.toView()).toEqual(json);
    doc2.api.arr(['arr']).ins(1, [1.5]).commit();
    doc1.api.str(['str']).ins(0, '__tab__').commit();
    expect((doc2.toView() as any).arr).toEqual([1, 1.5, 2, 3]);
    expect((doc1.toView() as any).arr).toEqual([1, 2, 3]);
    expect((doc2.toView() as any).str).toBe('asdf');
    expect((doc1.toView() as any).str).toBe('__tab__asdf');
  });
});

describe('server', () => {
  test('decodes clock', () => {
    const doc1 = Model.withServerClock();
    doc1.api.root(123).commit();
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc2.clock.getSessionId()).toBe(1);
    expect(doc2.clock.time).toBe(doc1.clock.time);
  });

  const encoder = new Encoder();

  test('decodes all types', () => {
    const doc1 = Model.withServerClock();
    const json = {
      str: 'asdf',
      arr: [1, 2, 3],
      obj: {foo: 'bar'},
      num: 123.4,
      nil: null,
      bool: [true, false],
    };
    doc1.api.root(json).commit();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.toView()).toEqual(json);
    expect(doc2.toView()).toEqual(json);
  });

  test('can edit documents after decoding', () => {
    const doc1 = Model.withServerClock();
    const json = {
      str: 'asdf',
      arr: [1, 2, 3],
      obj: {foo: 'bar'},
      num: 123.4,
      nil: null,
      bool: [true, false],
    };
    doc1.api.root(json).commit();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.toView()).toEqual(json);
    expect(doc2.toView()).toEqual(json);
    doc2.api.arr(['arr']).ins(1, [1.5]).commit();
    doc1.api.str(['str']).ins(0, '__tab__').commit();
    expect((doc2.toView() as any).arr).toEqual([1, 1.5, 2, 3]);
    expect((doc1.toView() as any).arr).toEqual([1, 2, 3]);
    expect((doc2.toView() as any).str).toBe('asdf');
    expect((doc1.toView() as any).str).toBe('__tab__asdf');
  });
});
