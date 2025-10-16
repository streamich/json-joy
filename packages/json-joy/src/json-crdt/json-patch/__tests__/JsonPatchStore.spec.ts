import {s} from '../../../json-crdt-patch';
import {Model} from '../../model';
import {JsonPatchStore} from '../JsonPatchStore';

test('can make updates', () => {
  const model = Model.create(
    s.obj({
      ui: s.obj({
        state: s.obj({
          text: s.str('abc'),
          counter: s.con(123),
        }),
      }),
    }),
  );
  const store = new JsonPatchStore(model, ['ui', 'state']);
  store.update({op: 'str_ins', path: '/text', pos: 1, str: 'x'});
  store.update([
    {op: 'str_ins', path: '/text', pos: 2, str: 'y'},
    {op: 'replace', path: '/counter', value: 124},
    {op: 'add', path: '/foo', value: true},
  ]);
  expect(store.getSnapshot()).toEqual({
    text: 'axybc',
    counter: 124,
    foo: true,
  });
});

test('supports "reset" events', () => {
  const model = Model.create(
    s.obj({
      ui: s.obj({
        state: s.obj({
          text: s.str('abc'),
          counter: s.con(123),
        }),
      }),
    }),
  );
  const clone = model.clone();
  const store = new JsonPatchStore(model, ['ui', 'state']);
  expect(store.getSnapshot()).toEqual({
    text: 'abc',
    counter: 123,
  });
  clone.api.obj('/ui/state').set({text: 'def', counter: 456});
  model.reset(clone);
  expect(store.getSnapshot()).toEqual({
    text: 'def',
    counter: 456,
  });
});

test('can read sub-value of the store', () => {
  const model = Model.create(
    s.obj({
      ui: s.obj({
        state: s.obj({
          text: s.str('abc'),
          counter: s.con(123),
        }),
      }),
    }),
  );
  const store = new JsonPatchStore(model, ['ui']);
  expect(store.get('')).toEqual({
    state: {
      text: 'abc',
      counter: 123,
    },
  });
  expect(store.get('/state')).toEqual({
    text: 'abc',
    counter: 123,
  });
  expect(store.get('/state/text')).toEqual('abc');
  expect(store.get(['state', 'counter'])).toEqual(123);
  expect(store.get(['state', 'counter2'])).toEqual(undefined);
  expect(store.get(['stateasdf'])).toEqual(undefined);
  expect(store.get('/asdf')).toEqual(undefined);
});

test('can subscribe and unsubscribe to changes', () => {
  const model = Model.create(
    s.obj({
      ui: s.obj({
        state: s.obj({
          text: s.str('abc'),
          counter: s.con(123),
        }),
      }),
    }),
  );
  const store = new JsonPatchStore(model, ['ui', 'state']);
  let cnt = 0;
  const unsubscribe = store.subscribe(() => {
    cnt++;
  });
  expect(cnt).toBe(0);
  store.update({op: 'str_ins', path: '/text', pos: 1, str: 'x'});
  expect(cnt).toBe(1);
  store.update({op: 'str_ins', path: '/text', pos: 1, str: 'x'});
  expect(cnt).toBe(2);
  unsubscribe();
  store.update({op: 'str_ins', path: '/text', pos: 1, str: 'x'});
  expect(cnt).toBe(2);
  expect(store.getSnapshot()).toEqual({
    text: 'axxxbc',
    counter: 123,
  });
});

test('can bind to a sub-path', () => {
  const model = Model.create(
    s.obj({
      ui: s.obj({
        state: s.obj({
          text: s.str('abc'),
          counter: s.con(123),
        }),
      }),
    }),
  );
  const store = new JsonPatchStore(model, ['ui']);
  const store2 = store.bind(['state']);
  expect(store2.getSnapshot()).toEqual({
    text: 'abc',
    counter: 123,
  });
  store2.update({op: 'str_ins', path: '/text', pos: 3, str: 'x'});
  expect(store2.getSnapshot()).toEqual({
    text: 'abcx',
    counter: 123,
  });
});

test('can bind store to a "str" node', () => {
  const model = Model.create(
    s.obj({
      ui: s.obj({
        state: s.obj({
          text: s.str('abc'),
          counter: s.con(123),
        }),
      }),
    }),
  );
  const store = new JsonPatchStore(model, ['ui']);
  const store2 = store.bind('/state/text');
  expect(store2.getSnapshot()).toEqual('abc');
  store2.update({op: 'str_ins', path: '', pos: 3, str: 'x'});
  expect(store2.getSnapshot()).toEqual('abcx');
});

test('can execute mutations inside a transaction', () => {
  const model = Model.create(
    s.obj({
      ui: s.obj({
        state: s.obj({
          text: s.str('abc'),
          counter: s.con(123),
        }),
      }),
    }),
  );
  const store = new JsonPatchStore(model, ['ui']);
  const store2 = store.bind('/state/text');
  expect(store2.getSnapshot()).toEqual('abc');
  let cnt = 0;
  model.api.onTransaction.listen(() => {
    cnt++;
  });
  model.api.transaction(() => {
    store2.update({op: 'str_ins', path: '', pos: 3, str: 'x'});
  });
  expect(cnt).toBe(1);
  expect(cnt).toBe(1);
  expect(store2.getSnapshot()).toEqual('abcx');
});

test('can return empty view', () => {
  const model = Model.create();
  const store = new JsonPatchStore(model);
  expect(store.getSnapshot()).toBe(undefined);
});

test('returns selected sub-view', () => {
  const model = Model.create();
  model.api.set({
    ui: {
      state: {
        foo: 'bar',
      },
    },
  });
  const store = new JsonPatchStore(model, ['ui', 'state']);
  expect(store.getSnapshot()).toEqual({foo: 'bar'});
  model.api.set({
    ui: {
      state: null,
    },
  });
  expect(store.getSnapshot()).toEqual(null);
});

test('returns "undefined" on missing sub-view', () => {
  const model = Model.create();
  model.api.set({
    ui: {},
  });
  const store = new JsonPatchStore(model, ['ui', 'state']);
  expect(store.getSnapshot()).toBe(undefined);
  model.api.set(undefined);
  expect(store.getSnapshot()).toBe(undefined);
});

test('returns "undefined" on missing store .get(path)', () => {
  const model = Model.create();
  model.api.set({
    ui: {
      state: {
        foo: 'bar',
      },
    },
  });
  const store = new JsonPatchStore(model, ['ui', 'state']);
  expect(store.get()).toEqual({foo: 'bar'});
  expect(store.get('/foo')).toEqual('bar');
  expect(store.get('/foo/baz')).toEqual(undefined);
  expect(store.get('/qux')).toEqual(undefined);
});

test('can bind to a missing sub-view', () => {
  const model = Model.create();
  model.api.set({
    ui: {
      state: {
        foo: 'bar',
      },
    },
  });
  const store = new JsonPatchStore(model, ['ui', 'state']);
  const store2 = store.bind('/missing/view');
  expect(store2.getSnapshot()).toBe(undefined);
  store.update({op: 'add', path: '/missing', value: {view: {baz: 'qux'}}});
  expect(store2.getSnapshot()).toEqual({baz: 'qux'});
  expect(store2.get()).toEqual({baz: 'qux'});
  expect(store2.get(['baz'])).toEqual('qux');
  expect(store2.get(['bar', 'foo'])).toEqual(undefined);
});

describe('.add()', () => {
  test('can modify existing key', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          foo: 'bar',
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    const op = store.add('/foo', 'baz');
    expect(store.getSnapshot()).toEqual({foo: 'baz'});
    expect(op).toEqual({op: 'add', path: '/foo', value: 'baz'});
  });

  test('can insert into array', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          arr: [],
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    const op = store.add('/arr/0', 'baz');
    expect(store.getSnapshot()).toEqual({arr: ['baz']});
    expect(op).toEqual({op: 'add', path: '/arr/0', value: 'baz'});
  });

  test('can append to array', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          arr: [],
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    const op1 = store.add('/arr/-', 1);
    const op2 = store.add('/arr/-', 2);
    expect(store.getSnapshot()).toEqual({arr: [1, 2]});
    expect(op1).toEqual({op: 'add', path: '/arr/-', value: 1});
    expect(op2).toEqual({op: 'add', path: '/arr/-', value: 2});
  });

  test('can add a new key', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          foo: 'bar',
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    store.add('/gg', 'wp');
    expect(store.getSnapshot()).toEqual({foo: 'bar', gg: 'wp'});
  });
});

describe('.replace()', () => {
  test('can modify existing key', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          foo: 'bar',
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    const op = store.replace('/foo', 'baz');
    expect(store.getSnapshot()).toEqual({foo: 'baz'});
    expect(op).toEqual({op: 'replace', path: '/foo', value: 'baz'});
  });

  test('can replace array element', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          arr: [1, '2', 3],
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    store.replace('/arr/1', 2);
    expect(store.getSnapshot()).toEqual({arr: [1, 2, 3]});
  });

  test('throws, when updating non-existing key', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          foo: 'bar',
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    expect(() => store.replace('/gg', 'wp')).toThrow();
  });
});

describe('.remove()', () => {
  test('can remove existing key', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          foo: 'bar',
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    const op = store.remove(['foo']);
    expect(store.getSnapshot()).toEqual({});
    expect(op).toEqual({op: 'remove', path: ['foo']});
  });

  test('can remove array element', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          foo: 'bar',
          arr: [1, 2, 3],
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    const op = store.remove('/arr/1');
    expect(store.getSnapshot()).toEqual({foo: 'bar', arr: [1, 3]});
    expect(store.get()).toEqual({foo: 'bar', arr: [1, 3]});
    expect(op).toEqual({op: 'remove', path: '/arr/1'});
  });

  test('can remove array element - 2', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          foo: 'bar',
          arr: [1, 2, 3],
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    const op = store.remove(['arr', 1]);
    expect(store.getSnapshot()).toEqual({foo: 'bar', arr: [1, 3]});
    expect(store.get()).toEqual({foo: 'bar', arr: [1, 3]});
    expect(op).toEqual({op: 'remove', path: ['arr', 1]});
    const op2 = store.remove(['arr', '1']);
    expect(store.get()).toEqual({foo: 'bar', arr: [1]});
    store.remove('/arr/0');
    expect(store.get()).toEqual({foo: 'bar', arr: []});
  });

  test('throws when removing non-existing element', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          foo: 'bar',
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    expect(() => store.remove(['abc'])).toThrow();
    expect(() => store.remove('/a/b/c')).toThrow();
  });
});

describe('.del()', () => {
  test('can remove existing key', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          foo: 'bar',
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    const op = store.del(['foo']);
    expect(store.getSnapshot()).toEqual({});
    expect(op).toEqual({op: 'remove', path: ['foo']});
  });

  test('can remove array element', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          foo: 'bar',
          arr: [1, 2, 3],
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    const op = store.del('/arr/1');
    expect(store.getSnapshot()).toEqual({foo: 'bar', arr: [1, 3]});
    expect(store.get()).toEqual({foo: 'bar', arr: [1, 3]});
    expect(op).toEqual({op: 'remove', path: '/arr/1'});
  });

  test('does nothing when key missing', () => {
    const model = Model.create();
    model.api.set({
      ui: {
        state: {
          foo: 'bar',
        },
      },
    });
    const store = new JsonPatchStore(model, ['ui', 'state']);
    const op1 = store.del('/foo');
    expect(store.getSnapshot()).toEqual({});
    const op2 = store.del('/foo');
    expect(op1).toEqual({op: 'remove', path: '/foo'});
    expect(op2).toBe(undefined);
    expect(() => store.del(['abc'])).not.toThrow();
    expect(() => store.del('/a/b/c')).not.toThrow();
  });
});
