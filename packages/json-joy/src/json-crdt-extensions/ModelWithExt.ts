import type * as clock from '../json-crdt-patch/clock';
import * as ext from './ext';
import {Extensions} from '../json-crdt/extensions/Extensions';
import {Model} from '../json-crdt/model';
import type {NodeBuilder} from '../json-crdt-patch';
import type {SchemaToJsonNode} from '../json-crdt/schema/types';

const extensions = new Extensions();

extensions.register(ext.cnt);
extensions.register(ext.mval);
extensions.register(ext.peritext);
extensions.register(ext.quill);
extensions.register(ext.prosemirror);

export {ext};

export class ModelWithExt {
  public static readonly ext = ext;

  public static readonly create = <S extends NodeBuilder | unknown>(
    schema?: S,
    sidOrClock: clock.ClockVector | number = Model.sid(),
  ) => {
    const model = Model.create(schema, sidOrClock);
    model.ext = extensions;
    return model;
  };

  public static readonly load = <S extends NodeBuilder>(
    data: Uint8Array,
    sid?: number,
    schema?: S,
  ): Model<SchemaToJsonNode<S>> => {
    const model = Model.load<S>(data, sid, schema);
    model.ext = extensions;
    return model;
  };
}
