/** @jest-environment jsdom */

import {renderHook, act} from '@testing-library/react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {usePath, usePathView} from '../hooks';

describe('usePath()', () => {
  test('scenario of a form editing', async () => {
    const model = Model.create({
      form: {
        name: 'Alice',
        address: {
          city: 'Wonderland',
          zip: '12345',
        },
        subscriptions: [
          {name: 'Newsletter', active: true},
          {name: 'Promotions', active: false},
        ],
      },
    });
    const names: string[] = [];
    const node = model.s.$;
    const subscriptions: unknown[] = [];
    renderHook(() => {
      const name = usePath('/form/name', node);
      const form = usePath('/form', node);
      if (name) names.push(name.view() as string);
      const subs = form?.read('/subscriptions') as unknown;
      if (subs) subscriptions.push(subs);
    });
    expect(names).toEqual(['Alice']);
    await act(async () => {
      node.merge('/form/name', 'Alice and Bob!');
    });
    expect(names).toEqual(['Alice', 'Alice and Bob!']);
    await act(async () => {
      node.replace('/form/subscriptions/0/active', false);
    });
    expect(subscriptions).toEqual([
      expect.any(Object),
      expect.any(Object),
      [
        {name: 'Newsletter', active: false},
        {name: 'Promotions', active: false},
      ]
    ]);
  });
});

describe('usePathView()', () => {
  test('re-renders with the latest view', async () => {
    const model = Model.create({obj: {foo: 'bar'}});
    const node = model.s.$;
    expect(node.view()).toEqual({obj: {foo: 'bar'}}); // sanity check
    const views: unknown[] = [];
    renderHook(() => {
      const view = usePathView('/obj/foo', node);
      views.push(view);
    });
    expect(views).toEqual(['bar']);
    await act(async () => {
      model.s.obj.foo.$.ins(3, '!');
    });
    expect(views).toEqual(['bar', 'bar!']);
    await act(async () => {
      model.s.obj.$.set({baz: 'qux'} as any);
    });
    expect(views).toEqual(['bar', 'bar!', 'bar!']);
    await act(async () => {
      model.s.obj.$.set({foo: s.con('aaa')} as any);
    });
    expect(views).toEqual(['bar', 'bar!', 'bar!', 'aaa']);
  });
});
