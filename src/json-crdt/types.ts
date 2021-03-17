import type {LogicalTimestamp} from './clock';

export interface CrdtOperation {
  id: LogicalTimestamp;
  dep: LogicalTimestamp
  deleted?: boolean;
}

export interface CrdtType extends CrdtOperation {
  update(operation: CrdtOperation): void;
  merge(type: CrdtType): void;
}

export interface JsonNode {
  toJson(): unknown;
}
