import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import type {ConNode} from './con/ConNode';
import type {ValNode} from './val/ValNode';
import type {VecNode} from './vec/VecNode';
import type {JsonNode} from './types';
import type {ObjectLww} from './obj/ObjectLww';
import type {StringRga} from './rga-string/StringRga';
import type {BinaryRga} from './rga-binary/BinaryRga';
import type {ArrayRga} from './rga-array/ArrayRga';

// tslint:disable-next-line:no-namespace
export namespace n {
  export type con<View = unknown | ITimestampStruct> = ConNode<View>;
  export type val<Value extends JsonNode = JsonNode> = ValNode<Value>;
  export type vec<Value extends JsonNode[] = JsonNode[]> = VecNode<Value>;
  export type obj<Value extends Record<string, JsonNode> = Record<string, JsonNode>> = ObjectLww<Value>;
  export type str<T extends string = string> = StringRga<T>;
  export type bin = BinaryRga;
  export type arr<Element extends JsonNode = JsonNode> = ArrayRga<Element>;
}

export {ConNode} from './con/ConNode';
export {ValNode} from './val/ValNode';
export {RootLww} from './lww-root/RootLww';
export {VecNode} from './vec/VecNode';
export {ObjectLww} from './obj/ObjectLww';
export {ArrayRga, ArrayChunk} from './rga-array/ArrayRga';
export {BinaryRga, BinaryChunk} from './rga-binary/BinaryRga';
export {StringRga, StringChunk} from './rga-string/StringRga';
