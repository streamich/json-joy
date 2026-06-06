import {defineComponent, inject, provide, type InjectionKey, type PropType} from 'vue';
import type {Model} from 'json-joy/lib/json-crdt';
import type {CrdtNodeApi} from './types';

// Vue analog of `@jsonjoy.com/collaborative-react`'s React context. A single
// context carries a `CrdtNodeApi`; the `Model` is derived from `node.api.model`
// (so `provideModel` is just `provideNode(model.api)`). Provide it with the
// `provide*` composables or the `*Provider` components, read it with the
// `useCtx*` composables — exactly mirroring the React surface.

/**
 * Create an isolated node context — a fresh injection key plus the `provide*` /
 * `useCtx*` bindings scoped to it. Use this when you need a second, independent
 * context in the same component tree (the default export below is one such
 * context, shared by the rest of the package).
 */
export const createNodeCtx = <N extends CrdtNodeApi = CrdtNodeApi>(defaultNode?: N) => {
  const key: InjectionKey<N> = Symbol('json-joy.node');

  /** Provide a node to descendants (call inside `setup()`). */
  const provideNode = (node: N): void => provide(key, node);
  /** Provide a model (its root `api`) to descendants (call inside `setup()`). */
  const provideModel = (model: Model<any>): void => provide(key, model.api as unknown as N);

  /** Read the context node, or `undefined` if none was provided. */
  const useCtxNode = (): N | undefined => inject(key, defaultNode);
  /** Read the context model, or `undefined` if none was provided. */
  const useCtxModel = (): Model<any> | undefined => useCtxNode()?.api.model;
  /** Read the context node, throwing `NO_NODE` if none was provided. */
  const useCtxNodeStrict = (): N => {
    const node = useCtxNode();
    if (!node) throw new Error('NO_NODE');
    return node;
  };
  /** Read the context model, throwing `NO_NODE` if none was provided. */
  const useCtxModelStrict = (): Model<any> => useCtxNodeStrict().api.model;

  /** Provider component: makes `node` available to its default slot. */
  const NodeProvider = defineComponent({
    name: 'NodeProvider',
    props: {node: {type: Object as PropType<N>, required: true}},
    setup(props, {slots}) {
      provideNode(props.node as N);
      return () => slots.default?.();
    },
  });

  /** Provider component: makes `model` (its root `api`) available to its slot. */
  const ModelProvider = defineComponent({
    name: 'ModelProvider',
    props: {model: {type: Object as PropType<Model<any>>, required: true}},
    setup(props, {slots}) {
      provideModel(props.model);
      return () => slots.default?.();
    },
  });

  return {
    key,
    provideNode,
    provideModel,
    useCtxNode,
    useCtxModel,
    useCtxNodeStrict,
    useCtxModelStrict,
    NodeProvider,
    ModelProvider,
  };
};

const ctx = createNodeCtx();

export const {
  key,
  provideNode,
  provideModel,
  useCtxNode,
  useCtxModel,
  useCtxNodeStrict,
  useCtxModelStrict,
  NodeProvider,
  ModelProvider,
} = ctx;
