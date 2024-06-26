import * as operations from './operations';
import {ITimestampStruct, ts, printTs} from './clock';
import {SESSION} from './constants';
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
  public readonly ops: JsonCrdtPatchOperation[] = [];

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
      else if (op instanceof operations.NewConOp) patchOps.push(new operations.NewConOp(ts(op.id), op.val));
      else if (op instanceof operations.NewVecOp) patchOps.push(new operations.NewVecOp(ts(op.id)));
      else if (op instanceof operations.NewValOp) patchOps.push(new operations.NewValOp(ts(op.id)));
      else if (op instanceof operations.NewObjOp) patchOps.push(new operations.NewObjOp(ts(op.id)));
      else if (op instanceof operations.NewStrOp) patchOps.push(new operations.NewStrOp(ts(op.id)));
      else if (op instanceof operations.NewBinOp) patchOps.push(new operations.NewBinOp(ts(op.id)));
      else if (op instanceof operations.NewArrOp) patchOps.push(new operations.NewArrOp(ts(op.id)));
      else if (op instanceof operations.InsArrOp)
        patchOps.push(new operations.InsArrOp(ts(op.id), ts(op.obj), ts(op.ref), op.data.map(ts)));
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
      else if (op instanceof operations.NopOp) patchOps.push(new operations.NopOp(ts(op.id), op.len));
    }
    return patch;
  }

  /**
   * The .rebase() operation is meant to work only with patch that use
   * the server clock. When receiving a patch from a client, the starting
   * ID of the patch can be out of sync with the server clock. For example,
   * if some other user has in the meantime pushed operations to the server.
   *
   * The .rebase() operation returns a new `Patch` with the IDs recalculated
   * such that the first operation has ID of the patch is equal to the
   * actual server time tip.
   *
   * @param serverTime Real server time tip (ID of the next expected operation).
   */
  public rebase(serverTime: number, transformHorizon: number): Patch {
    const id = this.getId();
    if (!id) throw new Error('EMPTY_PATCH');
    const patchStartTime = id.time;
    if (patchStartTime === serverTime) return this;
    const delta = serverTime - patchStartTime;
    return this.rewriteTime((id: ITimestampStruct): ITimestampStruct => {
      const sessionId = id.sid;
      const isServerTimestamp = sessionId === SESSION.SERVER;
      if (!isServerTimestamp) return id;
      const time = id.time;
      if (time < transformHorizon) return id;
      return ts(SESSION.SERVER, time + delta);
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
    let out = `${this.constructor.name} ${id ? printTs(id) : '(nil)'}!${this.span()}`;
    for (let i = 0; i < this.ops.length; i++) {
      const isLast = i === this.ops.length - 1;
      out += `\n${tab}${isLast ? '└─' : '├─'} ${this.ops[i].toString(tab + (isLast ? '  ' : '│ '))}`;
    }
    return out;
  }
}
