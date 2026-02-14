/** @jest-environment jsdom */

import {renderHook, act} from '@testing-library/react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {usePathView} from '../hooks';

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
 