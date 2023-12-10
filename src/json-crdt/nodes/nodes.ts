import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import type {ConNode} from './const/ConNode';
import type {ValNode} from './val/ValNode';
import type {VecNode} from './vec/VecNode';
import type {JsonNode} from './types';
import type {ObjNode} from './obj/ObjNode';
import type {StrNode} from './str/StrNode';
import type {BinNode} from './bin/BinNode';
import type {ArrNode} from './arr/ArrNode';

// tslint:disable-next-line:no-namespace
export namespace n {
  export type con<View = unknown | ITimestampStruct> = ConNode<View>;
  export type val<Value extends JsonNode = JsonNode> = ValNode<Value>;
  export type vec<Value extends JsonNode[] = JsonNode[]> = VecNode<Value>;
  export type obj<Value extends Record<string, JsonNode> = Record<string, JsonNode>> = ObjNode<Value>;
  export type str<T extends string = string> = StrNode<T>;
  export type bin = BinNode;
  export type arr<Element extends JsonNode = JsonNode> = ArrNode<Element>;
}

export {ConNode} from './const/ConNode';
export {ValNode} from './val/ValNode';
export {RootNode} from './root/RootNode';
export {VecNode} from './vec/VecNode';
export {ObjNode} from './obj/ObjNode';
export {ArrNode, ArrChunk} from './arr/ArrNode';
export {BinNode, BinChunk} from './bin/BinNode';
export {StrNode, StrChunk} from './str/StrNode';
