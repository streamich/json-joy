import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {JsonNode} from '../../types';

export class ObjectChunk {
  constructor(public readonly id: LogicalTimestamp, public readonly node: JsonNode) {}
}
