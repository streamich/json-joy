/** @jest-environment jsdom */

import * as React from 'react';
import {renderHook, act} from '@testing-library/react';
import {ArrApi, Model, ObjApi, s, StrApi} from 'json-joy/lib/json-crdt';
import {useArr, useObj, usePath, usePathView, useStr} from '../hooks';
import {NodeCtx} from '../context';

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

describe('useArr()', () => {
  test('re-renders with the latest view', async () => {
    const model = Model.create({obj: {foo: [1, 2, 3]}});
    const node = model.s.$;
    const views: unknown[] = [];
    const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => <NodeCtx node={node}>{children}</NodeCtx>;
    renderHook(() => {
      const arr = useArr('/obj/foo');
      expect(arr instanceof ArrApi).toBe(true);
      React.useEffect(() => {
        arr?.ins(3, [4]);
      }, [arr]);
      views.push(arr?.view());
    }, {wrapper});
    expect(views).toEqual([
      [1, 2, 3],
      [1, 2, 3, 4],
    ]);
  });
});

describe('useObj()', () => {
  test('re-renders with the latest view', async () => {
    const model = Model.create({obj: {foo: {bar: 'baz'}}});
    const node = model.s.$;
    const views: unknown[] = [];
    const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => <NodeCtx node={node}>{children}</NodeCtx>;
    renderHook(() => {
      const obj = useObj('/obj/foo');
      expect(obj instanceof ObjApi).toBe(true);
      React.useEffect(() => {
        obj?.set({x: 'y'} as any);
      }, [obj]);
      views.push(obj?.view());
    }, {wrapper});
    expect(views).toEqual([
      {bar: 'baz'},
      {bar: 'baz', x: 'y'},
    ]);
  });
});

describe('useStr()', () => {
  test('re-renders with the latest view', async () => {
    const model = Model.create({obj: {foo: {bar: 'baz'}}});
    const node = model.s.$;
    const views: unknown[] = [];
    const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => <NodeCtx node={node}>{children}</NodeCtx>;
    renderHook(() => {
      const str = useStr('/obj/foo/bar');
      expect(str instanceof StrApi).toBe(true);
      React.useEffect(() => {
        str?.ins(3, '!');
      }, [str]);
      views.push(str?.view());
    }, {wrapper});
    expect(views).toEqual([
      'baz',
      'baz!',
    ]);
  });
});
