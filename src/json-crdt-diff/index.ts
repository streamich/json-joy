import {Patch} from '../json-crdt-patch';
import {NodeApi} from '../json-crdt/model';
import {JsonCrdtDiff} from './JsonCrdtDiff';

export const diff = (src: NodeApi<any>, dst: unknown): Patch => {
  const diff = new JsonCrdtDiff(src.api.model);
  const patch = diff.diff(src.api.model.root, dst);
  return patch;
}

export const merge = (src: NodeApi<any>, dst: unknown): void => {
  const patch = diff(src, dst);
  if (patch.ops.length) src.api.model.applyPatch(patch);
};
