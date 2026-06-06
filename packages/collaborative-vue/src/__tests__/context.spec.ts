/**
 * @jest-environment jsdom
 */
import {createApp, defineComponent, h, nextTick, type Component} from 'vue';
import {Model, s} from 'json-joy/lib/json-crdt';
import {ModelProvider, UseModel, UseNode, useCtxModel, useCtxModelStrict} from '..';

const newModel = () =>
  Model.create(s.obj({title: s.str('Untitled')})) as unknown as Model<any>;

function mount(component: Component) {
  const el = document.createElement('div');
  const app = createApp(component);
  app.mount(el);
  return {el, app};
}

// Model-level changes buffer on a microtask; then Vue flushes its render queue.
// A macrotask tick drains both before we read the DOM.
const flush = async () => {
  await new Promise((resolve) => setTimeout(resolve));
  await nextTick();
};

describe('context', () => {
  test('ModelProvider supplies the model to descendants', () => {
    const model = newModel();
    let resolved: Model<any> | undefined;
    const Child = defineComponent({
      setup() {
        resolved = useCtxModelStrict();
        return () => h('div');
      },
    });
    const Root = defineComponent({
      setup() {
        return () => h(ModelProvider, {model}, () => h(Child));
      },
    });
    const {app} = mount(Root);
    expect(resolved).toBe(model);
    app.unmount();
  });

  test('non-strict context returns undefined without a provider', () => {
    const app = createApp({render: () => null});
    const result = app.runWithContext(() => useCtxModel());
    expect(result).toBeUndefined();
  });

  test('strict context throws without a provider', () => {
    const app = createApp({render: () => null});
    expect(() => app.runWithContext(() => useCtxModelStrict())).toThrow('NO_NODE');
  });
});

describe('render-prop components', () => {
  test('UseModel renders the view and updates on change', async () => {
    const model = newModel();
    const Root = defineComponent({
      setup() {
        return () =>
          h(UseModel, {model}, {default: ({model: m}: {model: Model<any>}) => h('span', (m.api.view() as any).title)});
      },
    });
    const {el, app} = mount(Root);
    expect(el.textContent).toBe('Untitled');

    model.api.obj([]).set({title: 'Hello'});
    await flush();
    expect(el.textContent).toBe('Hello');
    app.unmount();
  });

  test('UseNode renders a node view from context and updates on change', async () => {
    const model = newModel();
    const Root = defineComponent({
      setup() {
        return () =>
          h(ModelProvider, {model}, () =>
            h(UseNode, {event: 'subtree'}, {default: ({node}: {node: any}) => h('span', node.view().title)}),
          );
      },
    });
    const {el, app} = mount(Root);
    expect(el.textContent).toBe('Untitled');

    model.api.obj([]).set({title: 'World'});
    await flush();
    expect(el.textContent).toBe('World');
    app.unmount();
  });
});
