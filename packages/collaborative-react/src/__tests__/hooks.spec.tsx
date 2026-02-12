/** @jest-environment jsdom */

import {renderHook, act} from '@testing-library/react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {useModelTick} from '../hooks';

describe('useModelTick', () => {
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
    const {result: {current: res0}} = renderHook(() => useModelTick(model));
    await act(async () => {
      model.api.set(s.con(1));
    });
    const {result: {current: res1}} = renderHook(() => useModelTick(model));
    await act(async () => {
      model.api.set(s.con(1));
    });
    const {result: {current: res2}} = renderHook(() => useModelTick(model));
    expect(res1).toBeGreaterThan(res0);
    expect(res2).toBeGreaterThan(res1);
  });
});
