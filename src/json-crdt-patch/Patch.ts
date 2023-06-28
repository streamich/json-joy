import {ArrInsOp} from './operations/ArrInsOp';
import {ArrOp} from './operations/ArrOp';
import {BinInsOp} from './operations/BinInsOp';
import {BinOp} from './operations/BinOp';
import {ConstOp} from './operations/ConstOp';
import {DelOp} from './operations/DelOp';
import {ITimestampStruct, ts, toDisplayString} from './clock';
import {NoopOp} from './operations/NoopOp';
import {ObjOp} from './operations/ObjOp';
import {ObjSetOp} from './operations/ObjSetOp';
import {SESSION} from './constants';
import {StrInsOp} from './operations/StrInsOp';
import {StrOp} from './operations/StrOp';
import {ValOp} from './operations/ValOp';
import {ValSetOp} from './operations/ValSetOp';
import {encode} from './codec/binary/encode';
import {decode} from './codec/binary/decode';
import {TupOp} from './operations/TupOp';

export type JsonCrdtPatchOperation =
  | DelOp
  | ArrInsOp
  | StrInsOp
  | BinInsOp
  | ArrOp
  | TupOp
  | ConstOp
  | ObjOp
  | StrOp
  | BinOp
  | ValOp
  | NoopOp
  | ValSetOp
  | ObjSetOp;

export class Patch {
  public static fromBinary(data: Uint8Array): Patch {
    return decode(data);
  }

  public readonly ops: JsonCrdtPatchOperation[] = [];

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
    for (let i = 0; i < length; i++) {
      const op = ops[i];
      if (op instanceof DelOp) patch.ops.push(new DelOp(ts(op.id), ts(op.obj), op.what));
      else if (op instanceof ArrInsOp) patch.ops.push(new ArrInsOp(ts(op.id), ts(op.obj), ts(op.ref), op.data.map(ts)));
      else if (op instanceof StrInsOp) patch.ops.push(new StrInsOp(ts(op.id), ts(op.obj), ts(op.ref), op.data));
      else if (op instanceof BinInsOp) patch.ops.push(new BinInsOp(ts(op.id), ts(op.obj), ts(op.ref), op.data));
      else if (op instanceof ArrOp) patch.ops.push(new ArrOp(ts(op.id)));
      else if (op instanceof TupOp) patch.ops.push(new TupOp(ts(op.id)));
      else if (op instanceof ConstOp) patch.ops.push(new ConstOp(ts(op.id), op.val));
      else if (op instanceof ValOp) patch.ops.push(new ValOp(ts(op.id), ts(op.val)));
      else if (op instanceof ObjOp) patch.ops.push(new ObjOp(ts(op.id)));
      else if (op instanceof StrOp) patch.ops.push(new StrOp(ts(op.id)));
      else if (op instanceof BinOp) patch.ops.push(new BinOp(ts(op.id)));
      else if (op instanceof ValSetOp) patch.ops.push(new ValSetOp(ts(op.id), ts(op.obj), ts(op.val)));
      else if (op instanceof ObjSetOp)
        patch.ops.push(
          new ObjSetOp(
            ts(op.id),
            ts(op.obj),
            op.data.map(([key, value]) => [key, ts(value)]),
          ),
        );
      else if (op instanceof NoopOp) patch.ops.push(new NoopOp(ts(op.id), op.len));
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

  public toBinary(): Uint8Array {
    return encode(this);
  }
}
