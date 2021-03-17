import type {Document} from './document';
import {LogicalTimestamp} from './clock';
import {CrdtType, JsonNode} from './types';

export class ObjectType implements JsonNode, CrdtType {
  public deleted = false;

  constructor(private readonly doc: Document, public readonly id: LogicalTimestamp, public readonly dep: LogicalTimestamp) {

  }

  update() {}
  merge() {}

  public toJson() {
    return {obj: 123};
  }
}
