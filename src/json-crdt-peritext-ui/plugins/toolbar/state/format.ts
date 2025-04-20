import {s} from '../../../../json-crdt-patch';
import {Model, ObjApi} from '../../../../json-crdt/model';
import type {SliceRegistryEntry} from '../../../../json-crdt-extensions/peritext/registry/SliceRegistryEntry';
import type {SliceConfigState} from './types';
import type {ObjNode} from '../../../../json-crdt/nodes';
import type {MenuItem} from '../types';

export class NewSliceConfig<Node extends ObjNode = ObjNode> implements SliceConfigState<Node> {
  public readonly model: Model<ObjNode<{conf: any}>>;

  constructor(
    public readonly def: SliceRegistryEntry,
    public readonly menu?: MenuItem,
  ) {
    const schema = s.obj({conf: def.schema || s.con(void 0)});
    this.model = Model.create(schema);
  }

  public conf(): ObjApi<Node> {
    return this.model.api.obj(['conf']) as ObjApi<Node>;
  }
}
