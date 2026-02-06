import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {ClockVector} from '../../../../../json-crdt-patch/clock';
import {assertParents} from '../../../../model/__tests__/util';

describe('server', () => {
  test('decodes clock', () => {
    const doc1 = Model.withServerClock(void 0, 0);
    doc1.api.set(123);
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc2.clock.sid).toBe(1);
    expect(doc2.clock.time).toBe(doc1.clock.time);
    assertParents(doc1);
    assertParents(doc2);
  });

  test('decodes all types', () => {
    const doc1 = Model.withServerClock(void 0, 0);
    const json = {
      str: 'asdf',
      arr: [1, 2, 3],
      obj: {foo: 'bar'},
      num: 123.4,
      nil: null,
      bool: [true, false],
    };
    doc1.api.set(json);
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.view()).toEqual(json);
    expect(doc2.view()).toEqual(json);
    assertParents(doc1);
    assertParents(doc2);
  });
});

test('can edit documents after decoding', () => {
  const doc1 = Model.withServerClock(void 0, 0);
  const json = {
    str: 'asdf',
    arr: [1, 2, 3],
    obj: {foo: 'bar'},
    num: 123.4,
    nil: null,
    bool: [true, false],
  };
  doc1.api.set(json);
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
  assertParents(doc1);
  assertParents(doc2);
});

describe('logical', () => {
  test('decodes clock', () => {
    const doc1 = Model.create(void 0, new ClockVector(222, 1));
    doc1.api.set(123);
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc2.clock.sid).toBe(222);
    expect(doc2.clock.time).toBe(doc1.clock.time);
    expect(doc2.clock.peers.size).toBe(0);
    assertParents(doc1);
    assertParents(doc2);
  });

  test('decodes all types', () => {
    const doc1 = Model.create(void 0, new ClockVector(222, 0));
    const json = {
      str: 'asdf',
      arr: [1, 2, 3],
      obj: {foo: 'bar'},
      num: 123.4,
      nil: null,
      bool: [true, false],
    };
    doc1.api.set(json);
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.view()).toEqual(json);
    expect(doc2.view()).toEqual(json);
    assertParents(doc1);
    assertParents(doc2);
  });

  test('can edit documents after decoding', () => {
    const doc1 = Model.create(void 0, new ClockVector(222, 0));
    const json = {
      str: 'asdf',
      arr: [1, 2, 3],
      obj: {foo: 'bar'},
      num: 123.4,
      nil: null,
      bool: [true, false],
    };
    doc1.api.set(json);
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
    assertParents(doc1);
    assertParents(doc2);
  });
});
