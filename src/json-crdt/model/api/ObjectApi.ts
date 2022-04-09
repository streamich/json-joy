import {NodeApi} from './NodeApi';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {UNDEFINED_ID} from '../../../json-crdt-patch/constants';

export class ObjectApi extends NodeApi<ObjectType, unknown[]> {
  public set(entries: Record<string, unknown>): this {
    const {api, node} = this;
    const {builder} = api;
    builder.setKeys(
      node.id,
      Object.entries(entries).map(([key, json]) => [key, builder.json(json)]),
    );
    return this;
  }

  public del(keys: string[]): this {
    const {api, node} = this;
    const {builder} = api;
    builder.setKeys(
      node.id,
      keys.map((key) => [key, UNDEFINED_ID]),
    );
    return this;
  }
}
