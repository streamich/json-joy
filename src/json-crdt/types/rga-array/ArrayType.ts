import type {JsonNode} from '../../types';
import type {Document} from '../../document';
import type {json_string} from 'ts-brand-json';
import {LogicalTimespan, LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {DeleteOperation} from '../../../json-crdt-patch/operations/DeleteOperation';
import {InsertArrayElementsOperation} from '../../../json-crdt-patch/operations/InsertArrayElementsOperation';
import {ArrayChunk} from './ArrayChunk';
import {ArrayOriginChunk} from './ArrayOriginChunk';
import {ClockCodec} from '../../codec/compact/ClockCodec';

export class ArrayType implements JsonNode {
  public start: ArrayChunk;
  public end: ArrayChunk;
  
  constructor(public readonly doc: Document, public readonly id: LogicalTimestamp) {
    this.start = this.end = new ArrayOriginChunk(id);
  }

  public insert(op: InsertArrayElementsOperation) {
    let curr: ArrayChunk | null = this.end;
    while (curr) {
      if (curr.id.overlap(curr.span(), op.id, op.span())) return;
      if (curr.id.inSpan(curr.span(), op.after, 1)) break;
      curr = curr.left;
    }
    if (!curr) return; // Should never happen.
    const isOriginChunk = curr instanceof ArrayOriginChunk;
    if (!curr.deleted && !isOriginChunk) {
      const doesAfterMatch = (curr.id.sessionId === op.after.sessionId) && (curr.id.time + curr.span() - 1 === op.after.time);
      const isIdSameSession = curr.id.sessionId === op.id.sessionId;
      const isIdIncreasingWithoutAGap = curr.id.time + curr.span() === op.id.time;
      if (doesAfterMatch && isIdSameSession && isIdIncreasingWithoutAGap) {
        curr.merge(op.elements);
        return;
      }
    }
    const chunk = new ArrayChunk(op.id, op.elements);
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

  private insertChunk(chunk: ArrayChunk, after: ArrayChunk) {
    chunk.left = after;
    chunk.right = after.right;
    if (after.right) after.right.left = chunk; else this.end = chunk;
    after.right = chunk;
  }

  private splitChunk(chunk: ArrayChunk, time: number): ArrayChunk {
    const newChunk = chunk.split(time);
    this.insertChunk(newChunk, chunk);
    return newChunk;
  }

  public delete(op: DeleteOperation) {
    const {after, length} = op;
    let chunk: ArrayChunk | null = this.end;
    const chunks: ArrayChunk[] = [];
    while (chunk) {
      if (chunk.id.overlap(chunk.span(), after, length)) chunks.push(chunk);
      if (chunk.id.inSpan(chunk.span(), after, 1)) break;
      chunk = chunk.left;
    };
    for (const c of chunks) this.deleteInChunk(c, after.time, after.time + length - 1);
  }

  private deleteInChunk(chunk: ArrayChunk, t1: number, t2: number) {
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
    let chunk: null | ArrayChunk = this.start;
    let cnt: number = 0;
    const next = index + 1;
    while (chunk) {
      if (chunk.values) {
        cnt += chunk.values.length;
        if (cnt >= next)
          return chunk.id.tick(chunk.values.length - (cnt - index));
      }
      chunk = chunk.right;
    }
    throw new Error('OUT_OF_BOUNDS');
  }

  public findValue(index: number): LogicalTimestamp {
    let chunk: null | ArrayChunk = this.start;
    let cnt: number = 0;
    const next = index + 1;
    while (chunk) {
      if (chunk.values) {
        cnt += chunk.values.length;
        if (cnt >= next)
          return chunk.values[chunk.values.length - (cnt - index)];
      }
      chunk = chunk.right;
    }
    throw new Error('OUT_OF_BOUNDS');
  }

  public findIdSpan(index: number, length: number): LogicalTimespan[] {
    let chunk: null | ArrayChunk = this.start;
    let cnt: number = 0;
    const next = index + 1;
    while (chunk) {
      if (chunk.values) {
        cnt += chunk.values.length;
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

  public toJson(): unknown[] {
    const arr: unknown[] = [];
    const nodes = this.doc.nodes;
    let curr: ArrayChunk | null = this.start;
    while (curr) {
      if (curr.values)
        arr.push(...curr.values!.map(value => nodes.get(value)?.toJson()));
      curr = curr.right;
    }
    return arr;
  }

  public clone(doc: Document): ArrayType {
    const copy = new ArrayType(doc, this.id);
    let i: null | ArrayChunk = this.start;
    let j: ArrayChunk = copy.start;
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

  public *children(): IterableIterator<LogicalTimestamp> {
    let chunk: null | ArrayChunk = this.start;
    while (chunk = chunk.right) if (chunk.values) for (const value of chunk.values) yield value;
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

  public serialize(codec: ClockCodec): json_string<Array<number | string>> {
    let str: string = '[1,' + codec.encodeTs(this.id);
    let chunk: null | ArrayChunk = this.start;
    while (chunk = chunk.right) {
      str += ',' + codec.encodeTs(chunk.id);
      if (chunk.values) str += ',[' + chunk.values.map(value => codec.encodeTs(value)).join(',') + ']';
      else str += ',' + chunk.deleted;
    }
    return str + ']' as json_string<Array<number | string>>;
  }

  public static deserialize(doc: Document, codec: ClockCodec, data: unknown[]): ArrayType {
    const [, sessionId, time] = data;
    const id = codec.decodeTs(sessionId as number, time as number);
    const arr = new ArrayType(doc, id);
    const length = data.length;
    let i = 3;
    let curr = arr.start;
    for (; i < length; i++) {
      const chunkId = codec.decodeTs(data[i++] as number, data[i++] as number);
      const content = data[i++];
      let chunk: ArrayChunk;
      if (Array.isArray(content)) {
        const values: LogicalTimestamp[] = [];
        const len = content.length;
        let j = 0; while (j < len) values.push(codec.decodeTs(content[j++], content[j++]));
        chunk = new ArrayChunk(chunkId, values);
      } else {
        chunk = new ArrayChunk(chunkId, undefined);
        chunk.deleted = Number(content);
      }
      chunk.left = curr;
      curr.right = chunk;
    }
    arr.end = curr;
    return arr;
  }
}
