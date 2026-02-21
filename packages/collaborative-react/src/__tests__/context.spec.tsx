/** @jest-environment jsdom */

import * as React from 'react';
import {renderHook, act} from '@testing-library/react';
import {Model} from 'json-joy/lib/json-crdt';
import {
  NodeCtx,
  ModelCtx,
  useCtxNode,
  useCtxModel,
  useCtxNodeStrict,
  useCtxModelStrict,
  createNodeCtx,
} from '../context';
import {useNode, useNodeView} from '../hooks';

describe('context: provider and retrieval', () => {
  describe('no context', () => {
    test('useCtxNode() returns undefined when no provider is set', () => {
      const {result} = renderHook(() => useCtxNode());
      expect(result.current).toBeUndefined();
    });

    test('useCtxModel() returns undefined when no provider is set', () => {
      const {result} = renderHook(() => useCtxModel());
      expect(result.current).toBeUndefined();
    });

    test('useCtxNodeStrict() throws when no provider is set', () => {
      expect(() => renderHook(() => useCtxNodeStrict())).toThrow('NO_NODE');
    });

    test('useCtxModelStrict() throws when no provider is set', () => {
      expect(() => renderHook(() => useCtxModelStrict())).toThrow();
    });
  });

  describe('NodeCtx', () => {
    test('NodeCtx provides a node retrievable via useCtxNode()', () => {
      const model = Model.create({foo: 'bar'});
      const node = model.s.$;
      const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => <NodeCtx node={node}>{children}</NodeCtx>;
      const {result} = renderHook(() => useCtxNode(), {wrapper});
      expect(result.current).toBe(node);
    });

    test('NodeCtx provides a node retrievable via useCtxNodeStrict()', () => {
      const model = Model.create({foo: 'bar'});
      const node = model.s.$;
      const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => <NodeCtx node={node}>{children}</NodeCtx>;
      const {result} = renderHook(() => useCtxNodeStrict(), {wrapper});
      expect(result.current).toBe(node);
    });
  });

  describe('ModelCtx', () => {
    test('ModelCtx provides the model retrievable via useCtxModel()', () => {
      const model = Model.create({foo: 'bar'});
      const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
        <ModelCtx model={model}>{children}</ModelCtx>
      );
      const {result} = renderHook(() => useCtxModel(), {wrapper});
      expect(result.current).toBe(model);
    });

    test('ModelCtx provides the model retrievable via useCtxModelStrict()', () => {
      const model = Model.create({foo: 'bar'});
      const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
        <ModelCtx model={model}>{children}</ModelCtx>
      );
      const {result} = renderHook(() => useCtxModelStrict(), {wrapper});
      expect(result.current).toBe(model);
    });

    test('ModelCtx also exposes node (model.api) via useCtxNode()', () => {
      const model = Model.create({foo: 'bar'});
      const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
        <ModelCtx model={model}>{children}</ModelCtx>
      );
      const {result} = renderHook(() => useCtxNode(), {wrapper});
      expect(result.current).toBe(model.api);
    });
  });
});

describe('context: useNode* hooks pull NodeApi from context', () => {
  test('useNode() retrieves the node from context and re-renders on changes', async () => {
    const model = Model.create({count: 0});
    const node = model.s.$;
    const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => <NodeCtx node={node}>{children}</NodeCtx>;
    const views: unknown[] = [];
    renderHook(
      () => {
        const n = useNode();
        views.push(n.view());
      },
      {wrapper},
    );
    expect(views[0]).toEqual({count: 0});
    await act(async () => {
      model.api.obj([]).set({count: 1});
    });
    expect(views.length).toBeGreaterThan(1);
    expect(views[views.length - 1]).toEqual({count: 1});
  });

  test('useNodeView() retrieves the node from context and returns its view', async () => {
    const model = Model.create({msg: 'hello'});
    const node = model.s.$;
    const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => <NodeCtx node={node}>{children}</NodeCtx>;
    const views: unknown[] = [];
    renderHook(
      () => {
        const view = useNodeView();
        views.push(view);
      },
      {wrapper},
    );
    expect(views[0]).toEqual({msg: 'hello'});
    await act(async () => {
      model.s.msg.$.ins(5, ' world');
    });
    expect(views[views.length - 1]).toEqual({msg: 'hello world'});
  });

  test('useNodeView() works with a sub-node from context', async () => {
    const model = Model.create({nested: {value: 'a'}});
    const subNode = model.s.nested.$;
    const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => <NodeCtx node={subNode}>{children}</NodeCtx>;
    const views: unknown[] = [];
    renderHook(
      () => {
        const view = useNodeView();
        views.push(view);
      },
      {wrapper},
    );
    expect(views[0]).toEqual({value: 'a'});
    await act(async () => {
      model.s.nested.$.set({value: 'b'} as any);
    });
    expect(views[views.length - 1]).toEqual({value: 'b'});
  });
});

describe('context: nested context overrides parent', () => {
  test('inner NodeCtx overrides the outer NodeCtx', () => {
    const model = Model.create({outer: {x: 1}, inner: {y: 2}});
    const outerNode = model.s.outer.$;
    const innerNode = model.s.inner.$;
    const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
      <NodeCtx node={outerNode}>
        <NodeCtx node={innerNode}>{children}</NodeCtx>
      </NodeCtx>
    );
    const {result} = renderHook(() => useCtxNodeStrict(), {wrapper});
    expect(result.current).toBe(innerNode);
    expect(result.current.view()).toEqual({y: 2});
  });

  test('useNodeView() in nested context returns inner node view', async () => {
    const model = Model.create({outer: 'OUT', inner: 'IN'});
    const outerNode = model.s.outer.$;
    const innerNode = model.s.inner.$;
    const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
      <NodeCtx node={outerNode}>
        <NodeCtx node={innerNode}>{children}</NodeCtx>
      </NodeCtx>
    );
    const views: unknown[] = [];
    renderHook(
      () => {
        const view = useNodeView();
        views.push(view);
      },
      {wrapper},
    );
    expect(views[0]).toBe('IN');
    await act(async () => {
      model.s.inner.$.ins(2, 'NER');
    });
    expect(views[views.length - 1]).toBe('INNER');
  });

  test('outer context is not affected by inner context override', () => {
    const model = Model.create({outer: {a: 1}, inner: {b: 2}});
    const outerNode = model.s.outer.$;
    const innerNode = model.s.inner.$;
    const outerResults: unknown[] = [];
    const innerResults: unknown[] = [];
    const InnerComponent: React.FC = () => {
      const node = useCtxNodeStrict();
      innerResults.push(node.view());
      return null;
    };
    const OuterComponent: React.FC = () => {
      const node = useCtxNodeStrict();
      outerResults.push(node.view());
      return (
        <NodeCtx node={innerNode}>
          <InnerComponent />
        </NodeCtx>
      );
    };
    const {unmount} = renderHook(() => null, {
      wrapper: ({children}) => (
        <NodeCtx node={outerNode}>
          <OuterComponent />
          {children}
        </NodeCtx>
      ),
    });
    expect(outerResults[0]).toEqual({a: 1});
    expect(innerResults[0]).toEqual({b: 2});
    unmount();
  });

  test('createNodeCtx creates an independent context', () => {
    const model = Model.create({shared: 'hello', custom: 'world'});
    const {NodeCtx: CustomNodeCtx, useCtxNodeStrict: useCustomNode} = createNodeCtx();
    const sharedNode = model.s.shared.$;
    const customNode = model.s.custom.$;
    const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
      <NodeCtx node={sharedNode}>
        <CustomNodeCtx node={customNode}>{children}</CustomNodeCtx>
      </NodeCtx>
    );
    const {result} = renderHook(
      () => ({
        defaultNode: useCtxNodeStrict(),
        customNode: useCustomNode(),
      }),
      {wrapper},
    );
    expect(result.current.defaultNode.view()).toBe('hello');
    expect(result.current.customNode.view()).toBe('world');
  });
});
