import {LogicalVectorClock} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import {ServerEncoder} from '../ServerEncoder';
import {ServerDecoder} from '../ServerDecoder';

test('decodes clock', () => {
  const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
  doc1.api.root(123).commit();
  const encoder = new ServerEncoder();
  const decoder = new ServerDecoder();
  const encoded = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded);
  expect(doc2.clock.getSessionId()).toBe(1);
  expect(doc2.clock.time).toBe(doc1.clock.time);
});

test('decodes an empty object', () => {
  const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
  const json = {};
  doc1.api.root(json).commit();
  const decoder = new ServerDecoder();
  const encoder = new ServerEncoder();
  const encoded = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded);
  expect(doc1.toView()).toEqual(json);
  expect(doc2.toView()).toEqual(json);
});

test('decodes an object with a key', () => {
  const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
  const json = {foo: {}};
  doc1.api.root(json).commit();
  const decoder = new ServerDecoder();
  const encoder = new ServerEncoder();
  const encoded = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded);
  expect(doc1.toView()).toEqual(json);
  expect(doc2.toView()).toEqual(json);
});

test('decodes an object with more than 15 keys', () => {
  const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
  const json = {
    '0': {},
    '1': {},
    '2': {},
    '3': {},
    '4': {},
    '5': {},
    '6': {},
    '7': {},
    '8': {},
    '9': {},
    '10': {},
    '11': {},
    '12': {},
    '13': {},
    '14': {},
    '15': {},
  };
  doc1.api.root(json).commit();
  const decoder = new ServerDecoder();
  const encoder = new ServerEncoder();
  const encoded = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded);
  expect(doc1.toView()).toEqual(json);
  expect(doc2.toView()).toEqual(json);
});

test('decodes an array with single entry', () => {
  const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
  const json = [{}];
  doc1.api.root(json).commit();
  const decoder = new ServerDecoder();
  const encoder = new ServerEncoder();
  const encoded = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded);
  expect(doc1.toView()).toEqual(json);
  expect(doc2.toView()).toEqual(json);
});

test('decodes nested array with two nodes', () => {
  const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
  const json = [{}, []];
  doc1.api.root(json).commit();
  const decoder = new ServerDecoder();
  const encoder = new ServerEncoder();
  const encoded = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded);
  expect(doc1.toView()).toEqual(json);
  expect(doc2.toView()).toEqual(json);
});

test('decodes a string', () => {
  const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
  const json = 'lala';
  doc1.api.root(json).commit();
  const decoder = new ServerDecoder();
  const encoder = new ServerEncoder();
  const encoded = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded);
  expect(doc1.toView()).toEqual(json);
  expect(doc2.toView()).toEqual(json);
});

const encoder = new ServerEncoder();

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
  const decoder = new ServerDecoder();
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
  const decoder = new ServerDecoder();
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
