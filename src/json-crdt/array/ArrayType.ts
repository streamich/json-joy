import {LogicalTimestamp} from '../../json-crdt-patch/clock';
import {InsertArrayElementsOperation} from '../../json-crdt-patch/operations/InsertArrayElementsOperation';
import {Document} from '../document';
import {JsonNode} from '../types';
import {ArrayChunk} from './ArrayChunk';

export type ArrayLinkedListItem = ArrayType | ArrayChunk;

export class ArrayType implements JsonNode {
  public start: ArrayChunk | null = null;
  public end: ArrayChunk | null = null;
  

  constructor(public readonly doc: Document, public readonly id: LogicalTimestamp) {}

  public insert(op: InsertArrayElementsOperation) {
    
  }

  public toJson(): unknown[] {
    return [];
  }

  public toString(tab: string = ''): string {
    return `${tab}arr(${this.id.toString()})`;
  }
}
