import type {JsonNode} from '../../types';
import type {Document} from '../../document';
import type {ClockCodec} from '../../codec/compact/ClockCodec';
import type {json_string} from 'ts-brand-json';
import {LogicalTimespan, LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {DeleteOperation} from '../../../json-crdt-patch/operations/DeleteOperation';
import {InsertStringSubstringOperation} from '../../../json-crdt-patch/operations/InsertStringSubstringOperation';
import {StringChunk} from './StringChunk';
import {StringOriginChunk} from './StringOriginChunk';
import {asString} from 'json-schema-serializer';

export class StringType implements JsonNode {
  public start: StringChunk;
  public end: StringChunk;
  
  constructor(public readonly doc: Document, public readonly id: LogicalTimestamp) {
    this.start = this.end = new StringOriginChunk(id);
  }

  public onInsert(op: InsertStringSubstringOperation) {
    let curr: StringChunk | null = this.end;
    while (curr) {
      if (curr.id.overlap(curr.span(), op.id, op.span())) return;
      if (curr.id.inSpan(curr.span(), op.after, 1)) break;
      curr = curr.left;
    }
    if (!curr) return; // Should never happen.
    const isOriginChunk = curr instanceof StringOriginChunk;
    if (!curr.deleted && !isOriginChunk) {
      const doesAfterMatch = (curr.id.sessionId === op.after.sessionId) && (curr.id.time + curr.span() - 1 === op.after.time);
      const isIdSameSession = curr.id.sessionId === op.id.sessionId;
      const isIdIncreasingWithoutAGap = curr.id.time + curr.span() === op.id.time;
      if (doesAfterMatch && isIdSameSession && isIdIncreasingWithoutAGap) {
        curr.merge(op.substring);
        return;
      }
    }
    const chunk = new StringChunk(op.id, op.substring);
    const targetsLastElementInChunk = op.after.time === (curr.id.time + curr.span() - 1);
    if (targetsLastElementInChunk) {
      // Walk back skipping all chunks that have higher timestamps.
      while (curr.right && (curr.right.id.compare(op.id)) > 0) curr = curr!.right!;
      this.insertChunk(chunk, curr);
      return;
    }
    this.splitChunk(curr, op.after.time);
    this.insertChunk(chunk, curr);
  }

  public onDelete(op: DeleteOperation) {
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
        if (cnt >= next)
          return chunk.id.tick(chunk.str.length - (cnt - index));
      }
      chunk = chunk.right;
    }
    throw new Error('OUT_OF_BOUNDS');
  }

  public findIdSpan(index: number, length: number): LogicalTimespan[] {
    let chunk: null | StringChunk = this.start;
    let cnt: number = 0;
    const next = index + 1;
    while (chunk) {
      if (chunk.str) {
        cnt += chunk.str.length;
        if (cnt >= next) {
          const remaining = cnt - index;
          if (remaining >= length) return [chunk.id.interval(chunk.span() - remaining, length)];
          length -= remaining;
          const result: LogicalTimespan[] = [chunk.id.interval(chunk.span() - remaining, remaining)];
          while(chunk.right) {
            chunk = chunk!.right;
            if (chunk.deleted) continue;
            const span = chunk.span();
            if (span >= length) {
              result.push(chunk.id.interval(0, length));
              break;
            }
            result.push(chunk.id.interval(0, span));
            length -= span;
          }
          return result
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

  public clone(doc: Document): StringType {
    const copy = new StringType(this.doc, this.id);
    let i: null | StringChunk = this.start;
    let j: StringChunk = copy.start;
    while (i.right) {
      const cloned = i.right.clone();
      j.right = cloned;
      cloned.left = j;
      j = cloned;
      i = i.right;
    }
    copy.end = j;
    return copy;
  }

  public *children(): IterableIterator<LogicalTimestamp> {}

  public toString(tab: string = ''): string {
    let str = `${tab}StringType(${this.id.toDisplayString()})`;
    let curr: StringChunk | null = this.start;
    while (curr) {
      str += `\n${curr.toString(tab + '  ')}`
      curr = curr.right;
    }
    return str;
  }

  public encodeCompact(codec: ClockCodec): json_string<unknown[]> {
    let str: string = '[2,' + codec.encodeTs(this.id);
    let chunk: null | StringChunk = this.start;
    while (chunk = chunk.right) {
      str += ',' + codec.encodeTs(chunk.id) + ',' +
        (chunk.str ? asString(chunk.str) : chunk.deleted);
    }
    return str + ']' as json_string<Array<number | string>>;
  }

  public static decodeCompact(doc: Document, codec: ClockCodec, data: unknown[]): StringType {
    const id = codec.decodeTs(data[1] as number, data[2] as number);
    const arr = new StringType(doc, id);
    const length = data.length;
    let i = 3;
    let curr = arr.start;
    while (i < length) {
      const chunkId = codec.decodeTs(data[i++] as number, data[i++] as number);
      const chunkValue = data[i++] as string | number;
      const chunk = new StringChunk(chunkId, typeof chunkValue === 'string' ? chunkValue : undefined);
      if (typeof chunkValue !== 'string') {
        chunk.deleted = Number(chunkValue);
        delete chunk.str;
      }
      chunk.left = curr;
      curr.right = chunk;
    }
    arr.end = curr;
    return arr;
  }
}
