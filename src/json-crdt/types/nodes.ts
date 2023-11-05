import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import type {ConNode} from './con/Const';
import type {ValueLww} from './lww-value/ValueLww';
import type {ArrayLww} from './lww-array/ArrayLww';
import type {JsonNode} from './types';
import type {ObjectLww} from './lww-object/ObjectLww';
import type {StringRga} from './rga-string/StringRga';
import type {BinaryRga} from './rga-binary/BinaryRga';
import type {ArrayRga} from './rga-array/ArrayRga';

// tslint:disable-next-line:no-namespace
export namespace n {
  export type con<View = unknown | ITimestampStruct> = ConNode<View>;
  export type val<Value extends JsonNode = JsonNode> = ValueLww<Value>;
  export type vec<Value extends JsonNode[] = JsonNode[]> = ArrayLww<Value>;
  export type obj<Value extends Record<string, JsonNode> = Record<string, JsonNode>> = ObjectLww<Value>;
  export type str<T extends string = string> = StringRga<T>;
  export type bin = BinaryRga;
  export type arr<Element extends JsonNode = JsonNode> = ArrayRga<Element>;
}

export {ConNode as Const} from './con/Const';
export {ValueLww} from './lww-value/ValueLww';
export {RootLww} from './lww-root/RootLww';
export {ArrayLww} from './lww-array/ArrayLww';
export {ObjectLww} from './lww-object/ObjectLww';
export {ArrayRga, ArrayChunk} from './rga-array/ArrayRga';
export {BinaryRga, BinaryChunk} from './rga-binary/BinaryRga';
export {StringRga, StringChunk} from './rga-string/StringRga';
