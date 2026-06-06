import {defineComponent, type PropType} from 'vue';
import {useCtxModelStrict} from './context';
import {useModelTick, useNode} from './composables';
import type {Model} from 'json-joy/lib/json-crdt';
import type {CrdtNodeApi} from './types';

// Render-prop equivalents using Vue scoped slots — the analog of
// `@jsonjoy.com/collaborative-react`'s `<UseModel>` / `<UseNode>`. The default
// slot receives the live model/node and re-renders on the relevant change.
//
//   <UseModel :model="model" v-slot="{ model }">{{ model.api.view().title }}</UseModel>
//   <UseNode :node="node" event="subtree" v-slot="{ node }">{{ node.view() }}</UseNode>

/**
 * Re-renders its default slot whenever the model changes, passing the model as
 * the `model` slot prop. The `model` prop is optional — falls back to context.
 */
export const UseModel = defineComponent({
  name: 'UseModel',
  props: {model: {type: Object as PropType<Model<any>>, required: false, default: undefined}},
  setup(props, {slots}) {
    const model = props.model ?? useCtxModelStrict();
    // The model handle identity is stable, so depend on the tick to re-render.
    const tick = useModelTick(model);
    return () => {
      void tick.value;
      return slots.default?.({model});
    };
  },
});

/**
 * Re-renders its default slot on the given node change event, passing the node
 * as the `node` slot prop. Both props are optional — `node` falls back to context.
 */
export const UseNode = defineComponent({
  name: 'UseNode',
  props: {
    node: {type: Object as PropType<CrdtNodeApi>, required: false, default: undefined},
    event: {type: String as PropType<'self' | 'child' | 'subtree'>, required: false, default: 'subtree'},
  },
  setup(props, {slots}) {
    const node = useNode(props.node as CrdtNodeApi, props.event);
    return () => slots.default?.({node: node.value});
  },
});
