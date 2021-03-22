import {LogicalTimestamp} from '../../json-crdt-patch/clock';
import {InsertArrayElementsOperation} from '../../json-crdt-patch/operations/InsertArrayElementsOperation';
import {Document} from '../document';
import {JsonNode} from '../types';
import {ArrayChunk} from './ArrayChunk';
import {ArrayOriginChunk} from './ArrayOriginChunk';

export type ArrayLinkedListItem = ArrayType | ArrayChunk;

export class ArrayType implements JsonNode {
  public start: ArrayChunk;
  public end: ArrayChunk;
  
  constructor(public readonly doc: Document, public readonly id: LogicalTimestamp) {
    this.start = this.end = new ArrayOriginChunk(id);
  }

  public insert(op: InsertArrayElementsOperation) {
    // First we right-to-left find the chunk after which we want to insert.
    let after: ArrayChunk | null = this.end;
    while (after) {
      if (after.id.isEqual(op.id)) return;
      if (after.id.inSpan(after.getSpan(), op.after)) break;
      after = after.left;
    }
    if (!after) return; // Should never happen.

    const targetsLastElementInChunk = op.after.time === (after.id.time + after.getSpan() - 1);
    if (targetsLastElementInChunk) {
      let comp;
      // Walk back skipping all chunks that have higher timestamps.
      while (after.right && ((comp = after.right.id.compare(op.id)) > 0)) after = after!.right!;
      if (comp === 0) return;
      const chunk = new ArrayChunk(op.id, op.elements);
      chunk.left = after;
      chunk.right = after.right;
      if (after.right) after.right.left = chunk;
      else this.end = chunk;
      after.right = chunk;
      return;
    }
  }

  public toJson(): unknown[] {
    const arr: unknown[] = [];
    const nodes = this.doc.nodes;
    let curr: ArrayChunk | null = this.start;
    while (curr) {
      if (!curr.deleted)
        arr.push(...curr.values.map(value => nodes.get(value)?.toJson()));
      curr = curr.right;
    }
    return arr;
  }

  public toString(tab: string = ''): string {
    let str = `${tab}ArrayType(${this.id.toDisplayString()})`;
    let curr: ArrayChunk | null = this.start;
    while (curr) {
      str += `\n${curr.toString(tab + '  ')}`
      curr = curr.right;
    }
    return str;
  }
}
