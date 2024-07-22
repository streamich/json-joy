import {tick} from 'thingies';
import {s} from '../../../json-crdt-patch';
import {Model} from '../../model';
import {JsonPatchStore} from '../JsonPatchStore';

test('can make updates', () => {
  const model = Model.create(s.obj({
    ui: s.obj({
      state: s.obj({
        text: s.str('abc'),
        counter: s.con(123),
      }),
    }),
  }));
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

test('can subscribe and unsubscribe to changes', async () => {
  const model = Model.create(s.obj({
    ui: s.obj({
      state: s.obj({
        text: s.str('abc'),
        counter: s.con(123),
      }),
    }),
  }));
  const store = new JsonPatchStore(model, ['ui', 'state']);
  let cnt = 0;
  const unsubscribe = store.subscribe(() => {
    cnt++;
  });
  await tick(1);
  expect(cnt).toBe(0);
  store.update({op: 'str_ins', path: '/text', pos: 1, str: 'x'});
  await tick(1);
  expect(cnt).toBe(1);
  store.update({op: 'str_ins', path: '/text', pos: 1, str: 'x'});
  await tick(1);
  expect(cnt).toBe(2);
  unsubscribe();
  store.update({op: 'str_ins', path: '/text', pos: 1, str: 'x'});
  await tick(1);
  expect(cnt).toBe(2);
  expect(store.getSnapshot()).toEqual({
    text: 'axxxbc',
    counter: 123
  });
});
