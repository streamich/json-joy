/** @jest-environment jsdom */

import {renderHook, act} from '@testing-library/react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {useModelTick, useModelView} from '../hooks';

describe('useModelTick()', () => {
  test('tick increases on model change (even if the view is the same)', async () => {
    const model = Model.create({obj: {foo: 'bar'}});
    const {result} = renderHook(() => useModelTick(model));
    const tickBefore = result.current;
    await act(async () => {
      model.api.obj(['obj']).set({foo: 'bar'});
    });
    expect(result.current).toBeGreaterThan(tickBefore);
  });

  test('ticks on counter increase', async () => {
    const model = Model.create(s.con(0));
    const ticks: number[] = [];
    renderHook(() => {
      const tick = useModelTick(model);
      ticks.push(tick);
      return tick;
    });
    await act(async () => {
      model.api.set(s.con(1));
    });
    await act(async () => {
      model.api.set(s.con(1));
    });
    expect(ticks.length).toBe(3);
    expect(ticks[1]).toBeGreaterThan(ticks[0]);
    expect(ticks[2]).toBeGreaterThan(ticks[1]);
  });
});

describe('useModelView()', () => {
  test('returns latest view on model change', async () => {
    const model = Model.create({obj: {foo: 'bar'}});
    const views: unknown[] = [];
    renderHook(() => {
      const view = useModelView(model);
      views.push(view);
    });
    expect(views[0]).toEqual({obj: {foo: 'bar'}});
    await act(async () => {
      model.api.obj(['obj']).set({foo: 'baz'});
    });
    expect(views[1]).toEqual({obj: {foo: 'baz'}});
  });

  test('returns correct view typing, for model with schema', async () => {
    const model = Model.create({obj: {foo: 'bar'}});
    renderHook(() => {
      const view = useModelView(model);
      expect(typeof view.obj.foo).toBe('string');
      // @ts-expect-error
      expect(view.obj.notKey).toBeUndefined();
    });
    await act(async () => {
      model.api.obj(['obj']).set({foo: 'baz'});
    });
  });

  test('works for model with NO schema', async () => {
    const model = Model.create();
    model.api.set({obj: {foo: 'bar'}});
    renderHook(() => {
      const view = useModelView(model) as {obj: {foo: string}};
      expect(typeof view.obj.foo).toBe('string');
    });
    await act(async () => {
      model.api.obj(['obj']).set({foo: 'baz'});
    });
  });

  test('does not trigger re-render if view is the same', async () => {
    const model = Model.create({obj: {foo: 'bar'}});
    let renderCount = 0;
    renderHook(() => {
      renderCount++;
      useModelView(model);
    });
    expect(renderCount).toBe(1);
    await act(async () => {
      model.api.obj(['obj']).set({foo: 'bar'});
    });
    expect(renderCount).toBe(1);
  });
});
