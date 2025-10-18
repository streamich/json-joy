import Delta from 'quill-delta';
import {randomU32} from 'hyperdyperid/lib/randomU32';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import {isEmpty} from '@jsonjoy.com/util/lib/isEmpty';
import type {QuillDeltaAttributes, QuillDeltaOp, QuillDeltaOpInsert, QuillDeltaOpRetain, QuillTrace} from '../types';
import {RandomJson} from '@jsonjoy.com/json-random';
import {removeErasures} from '../util';

export interface QuillDeltaFuzzerOptions {
  maxOperationsPerPatch: number;
}

export class QuillDeltaFuzzer {
  public options: QuillDeltaFuzzerOptions;
  public delta: Delta = new Delta([]);
  public patch: QuillDeltaOp[] = [];
  public transactions: QuillDeltaOp[][] = [];

  constructor(options: Partial<QuillDeltaFuzzerOptions> = {}) {
    this.options = {
      maxOperationsPerPatch: 3,
      ...options,
    };
  }

  public trace(): QuillTrace {
    return {
      contents: {ops: this.delta.ops as QuillDeltaOp[]},
      transactions: this.transactions,
    };
  }

  public applyPatch(): Delta {
    this.transactions.push(this.patch);
    this.delta = this.delta.compose(new Delta(this.patch));
    return this.delta;
  }

  public createPatch(): QuillDeltaOp[] {
    this.patch = [];
    let pos = 0;
    const length = this.delta.length();
    const opCount = randomU32(1, this.options.maxOperationsPerPatch);
    for (let i = 0; i < opCount; i++) {
      const remaining = length - pos;
      if (!remaining) {
        const op = Fuzzer.pick([
          () => {
            const [offset, patch] = this.createInsertTextOp(this.delta, pos);
            this.patch.push(...patch);
            pos += offset;
          },
          () => {
            const [offset, patch] = this.createInsertEmbedOp(this.delta, pos);
            this.patch.push(...patch);
            pos += offset;
          },
        ]);
        op();
        break;
      }
      const op = Fuzzer.pick([
        () => {
          const [offset, patch] = this.createInsertTextOp(this.delta, pos);
          this.patch.push(...patch);
          pos += offset;
        },
        () => {
          const [offset, patch] = this.createInsertEmbedOp(this.delta, pos);
          this.patch.push(...patch);
          pos += offset;
        },
        () => {
          const [offset, patch] = this.createDeleteOp(length, pos);
          this.patch.push(...patch);
          pos += offset;
        },
        () => {
          const [offset, patch] = this.createAnnotateOp(length, pos);
          this.patch.push(...patch);
          pos += offset;
        },
      ]);
      op();
    }
    return this.patch;
  }

  public createInsertOp(delta: Delta, pos: number): [offset: number, patch: QuillDeltaOp[]] {
    const [offset, patch] = this.createInsertTextOp(delta, pos);
    return [offset, patch];
  }

  public createInsertTextOp(delta: Delta, pos: number): [offset: number, patch: QuillDeltaOp[]] {
    const length = delta.length();
    const remaining = length - pos;
    const offset = !remaining ? 0 : randomU32(0, remaining);
    const text = RandomJson.genString(randomU32(1, 5));
    const patch: QuillDeltaOp[] = [];
    if (offset > 0) {
      patch.push({retain: offset});
    }
    const insertOp: QuillDeltaOpInsert = {insert: text};
    if (randomU32(0, 1)) {
      const attributes = removeErasures(this.createAttributes());
      if (attributes && !isEmpty(attributes)) {
        insertOp.attributes = attributes;
      }
    }
    patch.push(insertOp);
    return [offset, patch];
  }

  public createInsertEmbedOp(delta: Delta, pos: number): [offset: number, patch: QuillDeltaOp[]] {
    const length = delta.length();
    const remaining = length - pos;
    const offset = !remaining ? 0 : randomU32(0, remaining);
    const insert = {link: RandomJson.genString(randomU32(1, 5))};
    const patch: QuillDeltaOp[] = [];
    if (offset > 0) {
      patch.push({retain: offset});
    }
    const insertOp: QuillDeltaOpInsert = {insert};
    if (randomU32(0, 1)) {
      const attributes = removeErasures(this.createAttributes());
      if (attributes && !isEmpty(attributes)) {
        insertOp.attributes = attributes;
      }
    }
    return [offset, patch];
  }

  public createDeleteOp(length: number, pos: number): [offset: number, patch: QuillDeltaOp[]] {
    const remaining = length - pos;
    if (remaining <= 0) return [pos, []];
    const deleteLength = randomU32(1, remaining);
    const patch: QuillDeltaOp[] = [{delete: deleteLength}];
    return [deleteLength, patch];
  }

  public createAnnotateOp(length: number, pos: number): [offset: number, patch: QuillDeltaOp[]] {
    const remaining = length - pos;
    if (remaining <= 0) return [pos, []];
    const offset = remaining < 2 ? 0 : randomU32(0, remaining - 1);
    const annotationLength = randomU32(1, remaining - offset);
    const patch: QuillDeltaOp[] = [];
    if (offset > 0) {
      patch.push({retain: offset});
    }
    const retainOp: QuillDeltaOpRetain = {retain: annotationLength};
    const attributes = this.createAttributes();
    if (attributes && !isEmpty(attributes)) {
      retainOp.attributes = attributes;
    }
    patch.push(retainOp);
    return [offset + annotationLength, patch];
  }

  public createAttributes(): QuillDeltaAttributes {
    const length = randomU32(1, 3);
    const attrKeys = ['bold', 'italic', 'color'];
    const attributes: QuillDeltaAttributes = {};
    for (let i = 0; i < length; i++) {
      const attrKey = Fuzzer.pick(attrKeys);
      switch (attrKey) {
        case 'bold': {
          attributes.bold = Fuzzer.pick([true, null]);
          break;
        }
        case 'italic': {
          attributes.italic = Fuzzer.pick([true, null]);
          break;
        }
        case 'color': {
          attributes.color = Fuzzer.pick(['red', 'blue', null]);
          break;
        }
      }
    }
    return attributes;
  }
}
