/** @jest-environment jsdom */

import {renderHook, act} from '@testing-library/react';
import {Model} from 'json-joy/lib/json-crdt';
import {useNodeView} from '../hooks';

describe('useNodeView()', () => {
  test('re-renders with the latest view', async () => {
    const model = Model.create({obj: {foo: 'bar'}});
    const node = model.s.$;
    expect(node.view()).toEqual({obj: {foo: 'bar'}}); // sanity check
    const views: unknown[] = [];
    renderHook(() => {
      const view = useNodeView(node);
      views.push(view);
    });
    expect(views[0]).toEqual({obj: {foo: 'bar'}});
    await act(async () => {
      model.s.obj.foo.$.ins(3, '!');
    });
    expect(views).toEqual([
      {obj: {foo: 'bar'}},
      {obj: {foo: 'bar!'}},
    ]);
    await act(async () => {
      model.s.obj.$.set({baz: 'qux'} as any);
    });
    expect(views).toEqual([
      {obj: {foo: 'bar'}},
      {obj: {foo: 'bar!'}},
      {obj: {foo: 'bar!', baz: 'qux'}},
    ]);
  });
});
