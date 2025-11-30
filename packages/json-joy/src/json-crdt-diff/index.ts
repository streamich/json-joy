import type {Patch} from '../json-crdt-patch';
import type {NodeApi} from '../json-crdt/model';
import {JsonCrdtDiff} from './JsonCrdtDiff';

export const diff = (src: NodeApi<any>, dst: unknown): Patch | undefined => {
  const diff = new JsonCrdtDiff(src.api.model);
  const patch = diff.diff(src.node, dst);
  return patch.ops.length ? patch : void 0;
};

export const merge = (src: NodeApi<any>, dst: unknown): Patch | undefined => {
  const patch = diff(src, dst);
  if (patch) src.api.model.applyLocalPatch(patch);
  return patch;
};
