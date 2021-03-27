import {LogicalTimestamp} from '../../../json-crdt-patch/clock';

export class LWWObjectEntry {
  constructor(public readonly id: LogicalTimestamp, public readonly value: LogicalTimestamp) {}
}
