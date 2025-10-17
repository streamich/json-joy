import {Model} from '../../model/Model';
import {JsonPatch} from '../JsonPatch';

describe('prefixed', () => {
  test('add', () => {
    const model = Model.create();
    model.api.set({
      level1: {
        level2: {},
      },
    });
    const jsonPatch = new JsonPatch(model, ['level1', 'level2']);
    jsonPatch.apply([{op: 'add', path: '/foo', value: 'bar'}]);
    expect(model.view()).toEqual({
      level1: {
        level2: {
          foo: 'bar',
        },
      },
    });
  });

  test('replace', () => {
    const model = Model.create();
    model.api.set({
      level1: {
        level2: {
          a: 'b',
        },
      },
    });
    const jsonPatch = new JsonPatch(model, ['level1', 'level2']);
    jsonPatch.apply([{op: 'replace', path: '/a', value: 'b'}]);
    expect(model.view()).toEqual({
      level1: {
        level2: {
          a: 'b',
        },
      },
    });
  });

  test('remove', () => {
    const model = Model.create();
    model.api.set({
      level1: {
        level2: {
          foo: [0, {b: 'c'}, 1],
        },
      },
    });
    const jsonPatch = new JsonPatch(model, ['level1', 'level2']);
    jsonPatch.apply([{op: 'remove', path: '/foo/1/b'}]);
    expect(model.view()).toEqual({
      level1: {
        level2: {
          foo: [0, {}, 1],
        },
      },
    });
  });

  test('move', () => {
    const model = Model.create();
    model.api.set({
      level1: {
        level2: {
          a: 'b',
        },
      },
    });
    const jsonPatch = new JsonPatch(model, ['level1', 'level2']);
    jsonPatch.apply([{op: 'move', path: '/x', from: '/a'}]);
    expect(model.view()).toEqual({
      level1: {
        level2: {
          x: 'b',
        },
      },
    });
  });

  test('copy', () => {
    const model = Model.create();
    model.api.set({
      level1: {
        level2: {
          a: 'b',
        },
      },
    });
    const jsonPatch = new JsonPatch(model, ['level1', 'level2']);
    jsonPatch.apply([{op: 'copy', path: '/x', from: '/a'}]);
    expect(model.view()).toEqual({
      level1: {
        level2: {
          a: 'b',
          x: 'b',
        },
      },
    });
  });
});
