import {
  NewConOp,
  NewObjOp,
  NewValOp,
  NewVecOp,
  NewStrOp,
  NewBinOp,
  NewArrOp,
  InsValOp,
  InsObjOp,
  InsStrOp,
  InsBinOp,
  InsArrOp,
  DelOp,
  NopOp,
} from './operations';
import {ITimestampStruct, ts, toDisplayString} from './clock';
import {SESSION} from './constants';
import {encode, decode} from './codec/binary';

export type JsonCrdtPatchOperation =
  | NewConOp
  | NewValOp
  | NewVecOp
  | NewObjOp
  | NewStrOp
  | NewBinOp
  | NewArrOp
  | InsValOp
  | InsObjOp
  | InsStrOp
  | InsBinOp
  | InsArrOp
  | DelOp
  | NopOp;

export class Patch {
  public static fromBinary(data: Uint8Array): Patch {
    return decode(data);
  }

  public readonly ops: JsonCrdtPatchOperation[] = [];
  public meta: unknown = undefined;

  public getId(): ITimestampStruct | undefined {
    const op = this.ops[0];
    if (!op) return undefined;
    return op.id;
  }

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

  public rewriteTime(ts: (id: ITimestampStruct) => ITimestampStruct): Patch {
    const patch = new Patch();
    const ops = this.ops;
    const length = ops.length;
    const patchOps = patch.ops;
    for (let i = 0; i < length; i++) {
      const op = ops[i];
      if (op instanceof DelOp) patchOps.push(new DelOp(ts(op.id), ts(op.obj), op.what));
      else if (op instanceof NewConOp) patchOps.push(new NewConOp(ts(op.id), op.val));
      else if (op instanceof NewVecOp) patchOps.push(new NewVecOp(ts(op.id)));
      else if (op instanceof NewValOp) patchOps.push(new NewValOp(ts(op.id), ts(op.val)));
      else if (op instanceof NewObjOp) patchOps.push(new NewObjOp(ts(op.id)));
      else if (op instanceof NewStrOp) patchOps.push(new NewStrOp(ts(op.id)));
      else if (op instanceof NewBinOp) patchOps.push(new NewBinOp(ts(op.id)));
      else if (op instanceof NewArrOp) patchOps.push(new NewArrOp(ts(op.id)));
      else if (op instanceof InsArrOp) patchOps.push(new InsArrOp(ts(op.id), ts(op.obj), ts(op.ref), op.data.map(ts)));
      else if (op instanceof InsStrOp) patchOps.push(new InsStrOp(ts(op.id), ts(op.obj), ts(op.ref), op.data));
      else if (op instanceof InsBinOp) patchOps.push(new InsBinOp(ts(op.id), ts(op.obj), ts(op.ref), op.data));
      else if (op instanceof InsValOp) patchOps.push(new InsValOp(ts(op.id), ts(op.obj), ts(op.val)));
      else if (op instanceof InsObjOp)
        patchOps.push(
          new InsObjOp(
            ts(op.id),
            ts(op.obj),
            op.data.map(([key, value]) => [key, ts(value)]),
          ),
        );
      else if (op instanceof NopOp) patchOps.push(new NopOp(ts(op.id), op.len));
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

  public clone(): Patch {
    return this.rewriteTime((id) => id);
  }

  public toString(tab: string = ''): string {
    const id = this.getId();
    let out = `${this.constructor.name} ${id ? toDisplayString(id) : '(nil)'}!${this.span()}`;
    for (let i = 0; i < this.ops.length; i++) {
      const isLast = i === this.ops.length - 1;
      out += `\n${tab}${isLast ? '└─' : '├─'} ${this.ops[i].toString(tab + (isLast ? '  ' : '│ '))}`;
    }
    return out;
  }

  public toBinary() {
    return encode(this);
  }
}
