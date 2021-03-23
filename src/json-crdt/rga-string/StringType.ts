import {LogicalTimestamp} from '../../json-crdt-patch/clock';
import {DeleteOperation} from '../../json-crdt-patch/operations/DeleteOperation';
import {InsertStringSubstringOperation} from '../../json-crdt-patch/operations/InsertStringSubstringOperation';
import {Document} from '../document';
import {JsonNode} from '../types';
import {StringChunk} from './StringChunk';
import {StringOriginChunk} from './StringOriginChunk';

export class StringType implements JsonNode {
  public start: StringChunk;
  public end: StringChunk;
  
  constructor(public readonly doc: Document, public readonly id: LogicalTimestamp) {
    this.start = this.end = new StringOriginChunk(id);
  }

  public insert(op: InsertStringSubstringOperation) {
    let after: StringChunk | null = this.end;
    while (after) {
      if (after.id.isEqual(op.id)) return;
      if (after.id.inSpan(after.span(), op.after, 1)) break;
      after = after.left;
    }
    if (!after) return; // Should never happen.

    const chunk = new StringChunk(op.id, op.substring);

    const targetsLastElementInChunk = op.after.time === (after.id.time + after.span() - 1);
    if (targetsLastElementInChunk) {
      // Walk back skipping all chunks that have higher timestamps.
      while (after.right && (after.right.id.compare(op.id)) > 0) after = after!.right!;
      this.insertChunk(chunk, after);
      return;
    }

    this.splitChunk(after, op.after.time);
    this.insertChunk(chunk, after);
  }

  private insertChunk(chunk: StringChunk, after: StringChunk) {
    chunk.left = after;
    chunk.right = after.right;
    if (after.right) after.right.left = chunk; else this.end = chunk;
    after.right = chunk;
  }

  private splitChunk(chunk: StringChunk, time: number): StringChunk {
    const newChunk = chunk.split(time);
    this.insertChunk(newChunk, chunk);
    return newChunk;
  }

  public delete(op: DeleteOperation) {
    const {after, length} = op;
    let chunk: StringChunk | null = this.end;
    const chunks: StringChunk[] = [];
    while (chunk) {
      if (chunk.id.overlap(chunk.span(), after, length)) chunks.push(chunk);
      if (chunk.id.inSpan(chunk.span(), after, 1)) break;
      chunk = chunk.left;
    };
    for (const c of chunks) this.deleteInChunk(c, after.time, after.time + length - 1);
  }

  private deleteInChunk(chunk: StringChunk, t1: number, t2: number) {
    const c1 = chunk.id.time;
    const c2 = c1 + chunk.span() - 1;
    if (t1 <= c1) {
      if (t2 >= c2) chunk.delete();
      else {
        this.splitChunk(chunk, t2);
        chunk.delete();
      }
    } else {
      if (t2 >= c2) this.splitChunk(chunk, t1 - 1).delete();
      else {
        this.splitChunk(chunk, t2);
        this.splitChunk(chunk, t1 - 1).delete();
      }
    }
  }

  public findId(index: number): LogicalTimestamp {
    let chunk: null | StringChunk = this.start;
    let cnt: number = 0;
    const next = index + 1;
    while (chunk) {
      if (chunk.str) {
        cnt += chunk.str.length;
        if (cnt >= next) {
          return chunk.id.tick(chunk.str.length - (cnt - index));
        }
      }
      chunk = chunk.right;
    }
    throw new Error('OUT_OF_BOUNDS');
  }

  public toJson(): string {
    let str: string = '';
    let curr: StringChunk | null = this.start;
    while (curr = curr.right) if (curr.str) str += curr.str;
    return str;
  }

  public toString(tab: string = ''): string {
    let str = `${tab}StringType(${this.id.toDisplayString()})`;
    let curr: StringChunk | null = this.start;
    while (curr) {
      str += `\n${curr.toString(tab + '  ')}`
      curr = curr.right;
    }
    return str;
  }
}
