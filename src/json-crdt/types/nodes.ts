import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import type {Const} from './const/Const';
import type {ValueLww} from './lww-value/ValueLww';
import type {ArrayLww} from './lww-array/ArrayLww';
import type {JsonNode} from './types';
import type {ObjectLww} from './lww-object/ObjectLww';
import type {StringRga} from './rga-string/StringRga';
import type {BinaryRga} from './rga-binary/BinaryRga';
import type {ArrayRga} from './rga-array/ArrayRga';

export namespace n {
  export type con<View = unknown | ITimestampStruct> = Const<View>;
  export type val<Value extends JsonNode = JsonNode> = ValueLww<Value>;
  export type vec<Value extends JsonNode[] = JsonNode[]> = ArrayLww<Value>;
  export type obj<Value extends Record<string, JsonNode> = Record<string, JsonNode>> = ObjectLww<Value>;
  export type str = StringRga;
  export type bin = BinaryRga;
  export type arr<Element extends JsonNode = JsonNode> = ArrayRga<Element>;
}
