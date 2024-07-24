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
