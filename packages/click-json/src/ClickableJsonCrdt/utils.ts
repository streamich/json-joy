import {NodeRef} from './NodeRef';
import type {JsonNode, Model} from 'json-joy/lib/json-crdt';
import type {ITimestampStruct} from 'json-joy/lib/json-crdt-patch/clock';

export const id = (node: NodeRef<JsonNode>) => {
  const id = node.node.id;
  return id.sid + '.' + id.time;
};

export const createValue = (
  model: Model,
  json: string,
  type: 'any' | 'con' | 'vec' | 'val',
  constOrJson?: boolean,
): ITimestampStruct => {
  let value: unknown = json;
  try {
    value = JSON.parse(json);
  } catch {}
  const api = model.api;
  const builder = api.builder;
  const valueId =
    type === 'any'
      ? constOrJson
        ? builder.constOrJson(value)
        : builder.json(value)
      : type === 'con'
        ? api.builder.con(value)
        : type === 'vec'
          ? api.builder.vec()
          : type === 'val'
            ? api.builder.val()
            : api.builder.con(undefined);
  if (type === 'vec') {
    if (json) {
      const valueVec = Array.isArray(value) ? value : [value];
      builder.insVec(
        valueId,
        valueVec.map((x, i) => [i, api.builder.maybeConst(x)]),
      );
    }
  } else if (type === 'val') {
    builder.setVal(valueId, json ? api.builder.maybeConst(value) : api.builder.con(undefined));
  }
  return valueId;
};

export const isContainer = (value: unknown): boolean => !!value && typeof value === 'object';
