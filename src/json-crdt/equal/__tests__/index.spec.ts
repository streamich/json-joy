import {Model} from '../../model';
import {equalSchema} from '..';
import {s} from '../../../json-crdt-patch';

describe('equalSchema()', () => {
  const assertSchemasEqual = (a: unknown): void => {
    const model1 = Model.create(a);
    const model2 = Model.create(a);
    const result = equalSchema(model1.root, model2.root);
    expect(result).toBe(true);
  };

  const assertSchemasDifferent = (a: unknown, b: unknown): void => {
    const model1 = Model.create(a);
    const model2 = Model.create(b);
    const result = equalSchema(model1.root, model2.root);
    expect(result).toBe(false);
  };

  test('returns true for identical nodes', () => {
    assertSchemasEqual(new Uint8Array([1, 2, 3]));
    assertSchemasEqual({foo: new Uint8Array([1, 2, 3])});
    assertSchemasEqual([[[{a: [1, [2, 3]]}]]]);
    assertSchemasEqual([[[{a: [1, s.vec(s.con(2), s.json(3))]}]]]);
    assertSchemasEqual({
      foo: 'bar',
      num: 123,
      obj: {key: 'value'},
      arr: [1, 2, 3, false],
      bool: true,
    });
  });

  test('returns false for slightly different nodes', () => {
    assertSchemasDifferent({
      foo: 'bar',
      num: 123,
      obj: {key: 'value'},
      arr: [1, 2, 3],
      bool: true,
    }, {
      foo: 'bar',
      num: 124,
      obj: {key: 'value'},
      arr: [1, 2, 3],
      bool: true,
    });
  });

  test('returns false for slightly different nodes - 2', () => {
    assertSchemasDifferent({
      foo: 'baz',
      num: 123,
      obj: {key: 'value'},
      arr: [1, 2, 3],
      bool: true,
    }, {
      foo: 'baz',
      num: 123,
      obj: {key: 'valee'},
      arr: [1, 2, 3],
      bool: true,
    });
  });

  test('returns false for slightly different nodes - 3', () => {
    assertSchemasDifferent({
      bin: new Uint8Array([1, 2, 3]),
    }, {
      bin: new Uint8Array([1, 0, 3]),
    });
  });
});
