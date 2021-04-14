import {ITimestamp} from '../../../json-crdt-patch/clock';
import {JsonNode} from '../types';

export class ObjectChunk {
  constructor(public readonly id: ITimestamp, public readonly node: JsonNode) {}
}
