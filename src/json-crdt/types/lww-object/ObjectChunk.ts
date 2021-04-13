import {Timestamp} from '../../../json-crdt-patch/clock';
import {JsonNode} from '../../types';

export class ObjectChunk {
  constructor(public readonly id: Timestamp, public readonly node: JsonNode) {}
}
