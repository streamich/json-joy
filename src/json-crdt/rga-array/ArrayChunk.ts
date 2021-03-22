import type {JsonChunk} from '../types';
import type {LogicalTimestamp} from '../../json-crdt-patch/clock';

export class ArrayChunk implements JsonChunk {
  public left: ArrayChunk | null = null;
  public right: ArrayChunk | null = null;

  /**
   * Whether this array chunk was deleted by a delete operation.
   */
  public deleted: boolean = false;

  constructor(public readonly id: LogicalTimestamp, public readonly values: LogicalTimestamp[]) {}

  public getSpan(): number {
    return this.values.length;
  }

  public toString(tab: string = ''): string {
    let str = `${tab}ArrayChunk(${this.id.toDisplayString()}) { ${this.values.map(val => val.toString()).join(', ')} }`;
    return str;
  }
}
