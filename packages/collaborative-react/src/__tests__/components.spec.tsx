/** @jest-environment jsdom */

import * as React from 'react';
import {render, act} from '@testing-library/react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {UseModel, UseNode} from '../components';

describe('UseModel', () => {
  test('renders the model view using the render prop', () => {
    const model = Model.create({greeting: 'hello'});
    const {container} = render(<UseModel model={model} render={(m) => <span>{JSON.stringify(m.api.view())}</span>} />);
    expect(container.textContent).toContain('"greeting":"hello"');
  });

  test('re-renders when the model changes', async () => {
    const model = Model.create({count: 0});
    const views: unknown[] = [];
    render(
      <UseModel
        model={model}
        render={(m) => {
          const view = m.api.view();
          views.push(view);
          return <span>{JSON.stringify(view)}</span>;
        }}
      />,
    );
    expect(views).toEqual([{count: 0}]);
    await act(async () => {
      model.api.obj([]).set({count: 1});
    });
    expect(views.length).toBeGreaterThanOrEqual(2);
    expect(views[views.length - 1]).toEqual({count: 1});
  });

  test('provides the full model instance to the render prop', () => {
    const model = Model.create({items: ['a', 'b']});
    let receivedModel: Model<any> | undefined;
    render(
      <UseModel
        model={model}
        render={(m) => {
          receivedModel = m;
          return null;
        }}
      />,
    );
    expect(receivedModel).toBe(model);
  });

  test('re-renders on str node mutation', async () => {
    const model = Model.create({text: 'abc'});
    const texts: string[] = [];
    render(
      <UseModel
        model={model}
        render={(m) => {
          const text = m.s.text.$.view();
          texts.push(text);
          return <span>{text}</span>;
        }}
      />,
    );
    expect(texts).toEqual(['abc']);
    await act(async () => {
      model.s.text.$.ins(3, 'def');
    });
    expect(texts).toEqual(['abc', 'abcdef']);
  });
});

describe('UseNode', () => {
  test('renders the node view using the render prop', () => {
    const model = Model.create({foo: 'bar'});
    const node = model.s.$;
    const {container} = render(<UseNode node={node} render={(n) => <span>{JSON.stringify(n.view())}</span>} />);
    expect(container.textContent).toContain('"foo":"bar"');
  });

  test('re-renders on subtree changes by default', async () => {
    const model = Model.create({nested: {value: 1}});
    const node = model.s.$;
    const views: unknown[] = [];
    render(
      <UseNode
        node={node}
        render={(n) => {
          const view = n.view();
          views.push(view);
          return <span>{JSON.stringify(view)}</span>;
        }}
      />,
    );
    expect(views).toEqual([{nested: {value: 1}}]);
    await act(async () => {
      model.api.obj(['nested']).set({value: 2});
    });
    expect(views.length).toBeGreaterThanOrEqual(2);
    expect(views[views.length - 1]).toEqual({nested: {value: 2}});
  });

  test('renders with event="self"', async () => {
    const model = Model.create({a: 1, b: 2});
    const node = model.s.$;
    const views: unknown[] = [];
    render(
      <UseNode
        node={node}
        event="self"
        render={(n) => {
          const view = n.view();
          views.push(view);
          return <span>{JSON.stringify(view)}</span>;
        }}
      />,
    );
    expect(views).toEqual([{a: 1, b: 2}]);
    await act(async () => {
      model.api.obj([]).set({a: 10, b: 2});
    });
    expect(views.length).toBeGreaterThanOrEqual(2);
    expect(views[views.length - 1]).toEqual({a: 10, b: 2});
  });

  test('re-renders on child event', async () => {
    const model = Model.create({x: 'hello'});
    const node = model.s.$;
    const views: unknown[] = [];
    render(
      <UseNode
        node={node}
        event="child"
        render={(n) => {
          const view = n.view();
          views.push(view);
          return <span>{JSON.stringify(view)}</span>;
        }}
      />,
    );
    expect(views).toEqual([{x: 'hello'}]);
    await act(async () => {
      model.s.x.$.ins(5, ' world');
    });
    expect(views.length).toBeGreaterThanOrEqual(2);
    expect(views[views.length - 1]).toEqual({x: 'hello world'});
  });

  test('provides the node instance to the render prop', () => {
    const model = Model.create({val: 42});
    const node = model.s.$;
    let receivedNode: unknown;
    render(
      <UseNode
        node={node}
        render={(n) => {
          receivedNode = n;
          return null;
        }}
      />,
    );
    expect(receivedNode).toBe(node);
  });

  test('works with a sub-node', async () => {
    const model = Model.create({obj: {foo: 'bar'}});
    const subNode = model.s.obj.$;
    const views: unknown[] = [];
    render(
      <UseNode
        node={subNode}
        render={(n) => {
          const view = n.view();
          views.push(view);
          return <span>{JSON.stringify(view)}</span>;
        }}
      />,
    );
    expect(views).toEqual([{foo: 'bar'}]);
    await act(async () => {
      model.s.obj.foo.$.ins(3, '!');
    });
    expect(views.length).toBeGreaterThanOrEqual(2);
    expect(views[views.length - 1]).toEqual({foo: 'bar!'});
  });
});
