import {Model} from '../../../model';
import {ServerDecoder} from '../ServerDecoder';
import {ServerEncoder} from '../ServerEncoder';

test('decodes clock', () => {
  const doc1 = Model.withServerClock();
  doc1.api.root(123).commit();
  const encoder = new ServerEncoder();
  const decoder = new ServerDecoder();
  const encoded = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded);
  expect(doc2.clock.getSessionId()).toBe(1);
  expect(doc2.clock.time).toBe(doc1.clock.time);
});

const encoder = new ServerEncoder();

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
  const decoder = new ServerDecoder();
  const encoded = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded);
  expect(doc1.toJson()).toEqual(json);
  expect(doc2.toJson()).toEqual(json);
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
  const decoder = new ServerDecoder();
  const encoded = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded);
  expect(doc1.toJson()).toEqual(json);
  expect(doc2.toJson()).toEqual(json);
  doc2.api.arr(['arr']).ins(1, [1.5]).commit();
  doc1.api.str(['str']).ins(0, '__tab__').commit();
  expect((doc2.toJson() as any).arr).toEqual([1, 1.5, 2, 3]);
  expect((doc1.toJson() as any).arr).toEqual([1, 2, 3]);
  expect((doc2.toJson() as any).str).toBe('asdf');
  expect((doc1.toJson() as any).str).toBe('__tab__asdf');
});
