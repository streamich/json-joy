import {LogicalTimestamp} from '../../../json-crdt-patch/clock';

export class ObjectEntry {
  constructor(public readonly id: LogicalTimestamp, public readonly value: LogicalTimestamp) {}
}
