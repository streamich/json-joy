import type {Patch} from '../json-crdt-patch';
import type {NodeApi} from '../json-crdt/model';
import {JsonCrdtDiff} from './JsonCrdtDiff';

export const diff = (src: NodeApi<any>, dst: unknown): Patch => {
  const diff = new JsonCrdtDiff(src.api.model);
  const patch = diff.diff(src.node, dst);
  return patch;
};

export const merge = (src: NodeApi<any>, dst: unknown): void => {
  const patch = diff(src, dst);
  if (patch.ops.length) src.api.model.applyPatch(patch);
};
