import {s} from '../../../../json-crdt-patch';
import {Model, ObjApi} from '../../../../json-crdt/model';
import type {SliceBehavior} from '../../../../json-crdt-extensions/peritext/registry/SliceBehavior';
import type {SliceConfigState} from './types';
import type {ObjNode} from '../../../../json-crdt/nodes';
import type {MenuItem} from '../types';
import type {ToolbarState} from '.';

export class NewSliceConfig<Node extends ObjNode = ObjNode> implements SliceConfigState<Node> {
  public readonly model: Model<ObjNode<{conf: any}>>;

  constructor(
    public readonly state: ToolbarState,
    public readonly def: SliceBehavior,
    public readonly menu?: MenuItem,
  ) {
    const schema = s.obj({conf: def.schema || s.con(void 0)});
    this.model = Model.create(schema);
  }

  public conf(): ObjApi<Node> {
    return this.model.api.obj(['conf']) as ObjApi<Node>;
  }

  public readonly save = () => {
    const state = this.state;
    state.newSliceConfig.next(void 0);
    const view = this.model.view();
    const data = view.conf as Record<string, unknown>;
    if (!data || typeof data !== 'object') return;
    if (!data.title) delete data.title;
    const et = state.surface.events.et;
    et.format(this.def.tag, 'many', data);
    et.cursor({move: [['focus', 'char', 0, true]]});
  };
}
