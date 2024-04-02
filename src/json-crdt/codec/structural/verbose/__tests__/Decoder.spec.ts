import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {ClockVector} from '../../../../../json-crdt-patch/clock';

describe('server', () => {
  test('decodes clock', () => {
    const doc1 = Model.withServerClock(0);
    doc1.api.root(123);
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc2.clock.sid).toBe(1);
    expect(doc2.clock.time).toBe(doc1.clock.time);
  });

  test('decodes all types', () => {
    const doc1 = Model.withServerClock(0);
    const json = {
      str: 'asdf',
      arr: [1, 2, 3],
      obj: {foo: 'bar'},
      num: 123.4,
      nil: null,
      bool: [true, false],
    };
    doc1.api.root(json);
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.view()).toEqual(json);
    expect(doc2.view()).toEqual(json);
  });
});

test('can edit documents after decoding', () => {
  const doc1 = Model.withServerClock(0);
  const json = {
    str: 'asdf',
    arr: [1, 2, 3],
    obj: {foo: 'bar'},
    num: 123.4,
    nil: null,
    bool: [true, false],
  };
  doc1.api.root(json);
  const encoder = new Encoder();
  const decoder = new Decoder();
  const encoded = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded);
  expect(doc1.view()).toEqual(json);
  expect(doc2.view()).toEqual(json);
  doc2.api.arr(['arr']).ins(1, [1.5]);
  doc1.api.str(['str']).ins(0, '__tab__');
  expect((doc2.view() as any).arr).toEqual([1, 1.5, 2, 3]);
  expect((doc1.view() as any).arr).toEqual([1, 2, 3]);
  expect((doc2.view() as any).str).toBe('asdf');
  expect((doc1.view() as any).str).toBe('__tab__asdf');
});

describe('logical', () => {
  test('decodes clock', () => {
    const doc1 = Model.withLogicalClock(new ClockVector(222, 1));
    doc1.api.root(123);
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc2.clock.sid).toBe(222);
    expect(doc2.clock.time).toBe(doc1.clock.time);
    expect(doc2.clock.peers.size).toBe(0);
  });

  test('decodes all types', () => {
    const doc1 = Model.withLogicalClock(new ClockVector(222, 0));
    const json = {
      str: 'asdf',
      arr: [1, 2, 3],
      obj: {foo: 'bar'},
      num: 123.4,
      nil: null,
      bool: [true, false],
    };
    doc1.api.root(json);
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.view()).toEqual(json);
    expect(doc2.view()).toEqual(json);
  });

  test('can edit documents after decoding', () => {
    const doc1 = Model.withLogicalClock(new ClockVector(222, 0));
    const json = {
      str: 'asdf',
      arr: [1, 2, 3],
      obj: {foo: 'bar'},
      num: 123.4,
      nil: null,
      bool: [true, false],
    };
    doc1.api.root(json);
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.view()).toEqual(json);
    expect(doc2.view()).toEqual(json);
    doc2.api.arr(['arr']).ins(1, [1.5]);
    doc1.api.str(['str']).ins(0, '__tab__');
    expect((doc2.view() as any).arr).toEqual([1, 1.5, 2, 3]);
    expect((doc1.view() as any).arr).toEqual([1, 2, 3]);
    expect((doc2.view() as any).str).toBe('asdf');
    expect((doc1.view() as any).str).toBe('__tab__asdf');
  });
});