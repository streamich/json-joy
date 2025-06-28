import {Model} from '../../model';
import {Draft} from '../Draft';

test('base and head are independent', () => {
  const base = Model.withLogicalClock();
  base.api.set({
    foo: 'bar',
  });
  const draft = new Draft({
    base,
    head: [],
    tip: [],
  });
  expect(draft.base.view()).toEqual({foo: 'bar'});
  expect(draft.head.view()).toEqual({foo: 'bar'});
  draft.head.api.obj([]).set({
    x: 123,
  });
  expect(draft.base.view()).toEqual({foo: 'bar'});
  expect(draft.head.view()).toEqual({foo: 'bar', x: 123});
});

const setup = () => {
  const base = Model.withLogicalClock();
  base.api.set({});
  const draft = new Draft({
    base: base.fork(),
    head: [],
    tip: [],
  });
  return {base, draft};
};

test('can rebase operations', () => {
  const {base, draft} = setup();
  draft.head.api.obj([]).set({
    x: 'x',
  });
  base.api.obj([]).set({
    y: 'y',
  });
  expect(draft.head.view()).toEqual({x: 'x'});
  const patch = base.api.builder.flush();
  draft.rebase([patch]);
  expect(draft.head.view()).toEqual({
    x: 'x',
    y: 'y',
  });
});
