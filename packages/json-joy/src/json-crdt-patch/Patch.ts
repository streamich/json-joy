import * as operations from './operations';
import {type ITimestampStruct, ts, printTs, Timestamp} from './clock';
import {printTree} from 'tree-dump/lib/printTree';
import {encode, decode} from './codec/binary';
import type {Printable} from 'tree-dump/lib/types';

/**
 * A union type of all possible JSON CRDT patch operations.
 */
export type JsonCrdtPatchOperation =
  | operations.NewConOp
  | operations.NewValOp
  | operations.NewVecOp
  | operations.NewObjOp
  | operations.NewStrOp
  | operations.NewBinOp
  | operations.NewArrOp
  | operations.InsValOp
  | operations.InsObjOp
  | operations.InsVecOp
  | operations.InsStrOp
  | operations.InsBinOp
  | operations.InsArrOp
  | operations.UpdArrOp
  | operations.DelOp
  | operations.NopOp;

/**
 * Represents a JSON CRDT patch.
 *
 * Normally, you would create a new patch using the {@link PatchBuilder} class.
 *
 * ```ts
 * import {Patch, PatchBuilder, LogicalClock} from 'json-joy/lib/json-crdt-patch';
 *
 * const clock = new LogicalClock(3, 100);
 * const builder = new PatchBuilder(clock);
 * const patch = builder.flush();
 * ```
 *
 * Save patch to a binary representation:
 *
 * ```ts
 * const binary = patch.toBinary();
 * ```
 *
 * Load patch from a binary representation:
 *
 * ```ts
 * const patch = Patch.fromBinary(binary);
 * ```
 *
 * @category Patch
 */
export class Patch implements Printable {
  /**
   * Un-marshals a JSON CRDT patch from a binary representation.
   */
  public static fromBinary(data: Uint8Array): Patch {
    return decode(data);
  }

  /**
   * A list of operations in the patch.
   */
  public ops: JsonCrdtPatchOperation[] = [];

  /**
   * Arbitrary metadata associated with the patch, which is not used by the
   * library.
   */
  public meta: unknown = undefined;

  /**
   * Returns the patch ID, which is equal to the ID of the first operation
   * in the patch.
   *
   * @returns The ID of the first operation in the patch.
   */
  public getId(): ITimestampStruct | undefined {
    const op = this.ops[0];
    if (!op) return undefined;
    return op.id;
  }

  /**
   * Returns the total time span of the patch, which is the sum of all
   * operation spans.
   *
   * @returns The length of the patch.
   */
  public span(): number {
    let span = 0;
    for (const op of this.ops) span += op.span();
    return span;
  }

  /**
   * Returns the expected time of the next inserted operation.
   */
  public nextTime(): number {
    const ops = this.ops;
    const length = ops.length;
    if (!length) return 0;
    const lastOp = ops[length - 1];
    return lastOp.id.time + lastOp.span();
  }

  /**
   * Creates a new patch where all timestamps are transformed using the
   * provided function.
   *
   * @param ts Timestamp transformation function.
   * @returns A new patch with transformed timestamps.
   */
  public rewriteTime(ts: (id: ITimestampStruct) => ITimestampStruct): Patch {
    const patch = new Patch();
    const ops = this.ops;
    const length = ops.length;
    const patchOps = patch.ops;
    for (let i = 0; i < length; i++) {
      const op = ops[i];
      if (op instanceof operations.DelOp) patchOps.push(new operations.DelOp(ts(op.id), ts(op.obj), op.what));
      else if (op instanceof operations.NewConOp)
        patchOps.push(new operations.NewConOp(ts(op.id), op.val instanceof Timestamp ? ts(op.val) : op.val));
      else if (op instanceof operations.NewVecOp) patchOps.push(new operations.NewVecOp(ts(op.id)));
      else if (op instanceof operations.NewValOp) patchOps.push(new operations.NewValOp(ts(op.id)));
      else if (op instanceof operations.NewObjOp) patchOps.push(new operations.NewObjOp(ts(op.id)));
      else if (op instanceof operations.NewStrOp) patchOps.push(new operations.NewStrOp(ts(op.id)));
      else if (op instanceof operations.NewBinOp) patchOps.push(new operations.NewBinOp(ts(op.id)));
      else if (op instanceof operations.NewArrOp) patchOps.push(new operations.NewArrOp(ts(op.id)));
      else if (op instanceof operations.InsArrOp)
        patchOps.push(new operations.InsArrOp(ts(op.id), ts(op.obj), ts(op.ref), op.data.map(ts)));
      else if (op instanceof operations.UpdArrOp)
        patchOps.push(new operations.UpdArrOp(ts(op.id), ts(op.obj), ts(op.ref), ts(op.val)));
      else if (op instanceof operations.InsStrOp)
        patchOps.push(new operations.InsStrOp(ts(op.id), ts(op.obj), ts(op.ref), op.data));
      else if (op instanceof operations.InsBinOp)
        patchOps.push(new operations.InsBinOp(ts(op.id), ts(op.obj), ts(op.ref), op.data));
      else if (op instanceof operations.InsValOp)
        patchOps.push(new operations.InsValOp(ts(op.id), ts(op.obj), ts(op.val)));
      else if (op instanceof operations.InsObjOp)
        patchOps.push(
          new operations.InsObjOp(
            ts(op.id),
            ts(op.obj),
            op.data.map(([key, value]) => [key, ts(value)]),
          ),
        );
      else if (op instanceof operations.InsVecOp)
        patchOps.push(
          new operations.InsVecOp(
            ts(op.id),
            ts(op.obj),
            op.data.map(([key, value]) => [key, ts(value)]),
          ),
        );
      else if (op instanceof operations.NopOp) patchOps.push(new operations.NopOp(ts(op.id), op.len));
    }
    return patch;
  }

  /**
   * The `.rebase()` operation is meant to be applied to patches which have not
   * yet been advertised to the server (other peers), or when
   * the server clock is used and concurrent change on the server happened.
   *
   * The .rebase() operation returns a new `Patch` with the IDs recalculated
   * such that the first operation has the `time` equal to `newTime`.
   *
   * @param newTime Time where the patch ID should begin (ID of the first operation).
   * @param transformAfter Time after (and including) which the IDs should be
   *     transformed. If not specified, equals to the time of the first operation.
   */
  public rebase(newTime: number, transformAfter?: number): Patch {
    const id = this.getId();
    if (!id) throw new Error('EMPTY_PATCH');
    const sid = id.sid;
    const patchStartTime = id.time;
    transformAfter ??= patchStartTime;
    if (patchStartTime === newTime) return this;
    const delta = newTime - patchStartTime;
    return this.rewriteTime((id: ITimestampStruct): ITimestampStruct => {
      if (id.sid !== sid) return id;
      const time = id.time;
      if (time < transformAfter) return id;
      return ts(sid, time + delta);
    });
  }

  /**
   * Creates a deep clone of the patch.
   *
   * @returns A deep clone of the patch.
   */
  public clone(): Patch {
    return this.rewriteTime((id) => id);
  }

  /**
   * Marshals the patch into a binary representation.
   *
   * @returns A binary representation of the patch.
   */
  public toBinary() {
    return encode(this);
  }

  // ---------------------------------------------------------------- Printable

  /**
   * Returns a textual human-readable representation of the patch. This can be
   * used for debugging purposes.
   *
   * @param tab Start string for each line.
   * @returns Text representation of the patch.
   */
  public toString(tab: string = ''): string {
    const id = this.getId();
    const header = `Patch ${id ? printTs(id) : '(nil)'}!${this.span()}`;
    return (
      header +
      printTree(
        tab,
        this.ops.map((op) => (tab) => op.toString(tab)),
      )
    );
  }
}
