import {CONST, updateNum} from '../json-hash';
import {ConNode} from './types';
import {ValueLww} from './types/lww-value/ValueLww';
import {ObjectLww} from './types/lww-object/ObjectLww';
import {ArrayLww} from './types/lww-array/ArrayLww';
import {ArrayRga} from './types/rga-array/ArrayRga';
import {AbstractRga} from './types/rga';
import {last2} from '../util/trees/util2';
import type {JsonNode} from './types';
import type {ITimestampStruct} from '../json-crdt-patch/clock';
import type {Model} from './model';

export const updateId = (state: number, id: ITimestampStruct): number => {
  const sid = id.sid;
  state = updateNum(state, sid >>> 0);
  // state = updateNum(state, Math.round(sid / 0x100000000));
  state = updateNum(state, id.time);
  return state;
};

export const updateRga = (state: number, node: AbstractRga<unknown>): number => {
  state = updateNum(state, node.length());
  state = updateNum(state, node.size());
  const maxIdChunk = last2(node.ids);
  if (maxIdChunk) state = updateId(state, maxIdChunk.id);
  return updateId(state, node.id);
};

/**
 * Updates the hash state with the given JSON CRDT node.
 * @param state Current hash state.
 * @param node JSON CRDT node from which to compute the hash.
 */
export const updateNode = (state: number, node: JsonNode): number => {
  if (node instanceof ConNode) return updateId(state, node.id);
  if (node instanceof ValueLww) {
    const child = node.child();
    if (child) state = updateNode(state, child);
    return updateId(state, node.id);
  }
  if (node instanceof ObjectLww || node instanceof ArrayLww) {
    node.children((child) => {
      state = updateNode(state, child);
    });
    return updateId(state, node.id);
  }
  if (node instanceof ArrayRga) {
    node.children((child) => {
      state = updateNode(state, child);
    });
  }
  if (node instanceof AbstractRga) return updateRga(state, node);
  throw new Error('UNKNOWN_NODE');
};

export const hashNode = (node: JsonNode): number => {
  return updateNode(CONST.START_STATE, node) >>> 0;
};

export const hashModel = (model: Model): number => {
  return hashNode(model.root);
};
