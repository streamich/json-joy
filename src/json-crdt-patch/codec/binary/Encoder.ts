import {ArrInsOp} from '../../operations/ArrInsOp';
import {ArrOp} from '../../operations/ArrOp';
import {BinInsOp} from '../../operations/BinInsOp';
import {BinOp} from '../../operations/BinOp';
import {Code} from '../compact/constants';
import {CrdtWriter} from '../../util/binary/CrdtEncoder';
import {DelOp} from '../../operations/DelOp';
import {ITimespanStruct, ITimestampStruct, Timestamp} from '../../clock';
import {JsonCrdtPatchOperation, Patch} from '../../Patch';
import {NoopOp} from '../../operations/NoopOp';
import {ObjOp} from '../../operations/ObjOp';
import {ObjSetOp} from '../../operations/ObjSetOp';
import {SESSION} from '../../constants';
import {StrInsOp} from '../../operations/StrInsOp';
import {StrOp} from '../../operations/StrOp';
import {ValOp} from '../../operations/ValOp';
import {ValSetOp} from '../../operations/ValSetOp';
import {ConstOp} from '../../operations/ConstOp';
import {MsgPackEncoder} from '../../../json-pack/msgpack/MsgPackEncoder';
import {TupOp} from '../../operations/TupOp';

export class Encoder extends MsgPackEncoder<CrdtWriter> {
  private patchId!: ITimestampStruct;

  constructor() {
    super(new CrdtWriter());
  }

  public encode(patch: Patch): Uint8Array {
    this.writer.reset();
    const id = (this.patchId = patch.getId()!);
    const isServerClock = id.sid === SESSION.SERVER;
    if (isServerClock) {
      this.writer.b1vu56(true, id.time);
    } else {
      this.writer.b1vu56(false, id.sid);
      this.writer.vu57(id.time);
    }
    this.encodeOperations(patch);
    return this.writer.flush();
  }

  public encodeOperations(patch: Patch): void {
    const ops = patch.ops;
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      this.encodeOperation(op);
    }
  }

  public encodeId(id: ITimestampStruct) {
    const sessionId = id.sid;
    const time = id.time;
    if (sessionId === SESSION.SERVER) {
      this.writer.b1vu56(true, id.time);
    } else {
      const patchId = this.patchId;
      if (sessionId === patchId.sid && time >= patchId.time) {
        this.writer.b1vu56(false, 1);
        this.writer.vu57(time - patchId.time);
      } else {
        this.writer.b1vu56(false, sessionId);
        this.writer.vu57(time);
      }
    }
  }

  protected encodeTss(span: ITimespanStruct): void {
    this.encodeId(span);
    this.writer.vu57(span.span);
  }

  public encodeOperation(op: JsonCrdtPatchOperation): void {
    if (op instanceof ObjOp) this.writer.u8(Code.MakeObject);
    else if (op instanceof ArrOp) this.writer.u8(Code.MakeArray);
    else if (op instanceof StrOp) this.writer.u8(Code.MakeString);
    else if (op instanceof ConstOp) {
      const val = op.val;
      if (val === undefined) {
        this.writer.u8(Code.MakeUndefined);
      } else if (val instanceof Timestamp) {
        this.writer.u8(Code.MakeConstId);
        this.encodeId(val);
      } else {
        this.writer.u8(Code.MakeConstant);
        this.encodeAny(op.val);
      }
    } else if (op instanceof ValOp) {
      this.writer.u8(Code.MakeValue);
      this.encodeId(op.val);
    } else if (op instanceof ObjSetOp) {
      this.writer.u8(Code.SetObjectKeys);
      this.encodeId(op.obj);
      this.writer.vu57(op.data.length);
      for (const [key, value] of op.data) {
        this.encodeId(value);
        if (typeof key === 'number') this.encodeNumber(key);
        else this.encodeString(key);
      }
    } else if (op instanceof ValSetOp) {
      this.writer.u8(Code.SetValue);
      this.encodeId(op.obj);
      this.encodeId(op.val);
    } else if (op instanceof StrInsOp) {
      this.writer.u8(Code.InsertStringSubstring);
      this.encodeId(op.obj);
      this.encodeId(op.ref);
      this.encodeString(op.data);
    } else if (op instanceof ArrInsOp) {
      const {obj: arr, ref: after, data: elements} = op;
      const length = elements.length;
      this.writer.u8(Code.InsertArrayElements);
      this.encodeId(arr);
      this.encodeId(after);
      this.writer.vu57(length);
      for (let i = 0; i < length; i++) this.encodeId(elements[i]);
    } else if (op instanceof DelOp) {
      const {obj, what} = op;
      const length = what.length;
      if (length > 1) {
        this.writer.u8(Code.Delete);
        this.encodeId(obj);
        this.writer.vu57(length);
        for (let i = 0; i < length; i++) this.encodeTss(what[i]);
      } else {
        this.writer.u8(Code.DeleteOne);
        this.encodeId(obj);
        this.encodeTss(what[0]);
      }
    } else if (op instanceof NoopOp) {
      const {len: length} = op;
      if (length > 1) {
        this.writer.u8(Code.Noop);
        this.writer.vu57(length);
      } else this.writer.u8(Code.NoopOne);
    } else if (op instanceof BinOp) this.writer.u8(Code.MakeBinary);
    else if (op instanceof BinInsOp) {
      const buf = op.data;
      const length = buf.length;
      this.writer.u8(Code.InsertBinaryData);
      this.encodeId(op.obj);
      this.encodeId(op.ref);
      this.writer.vu57(length);
      this.writer.buf(buf, length);
    } else if (op instanceof TupOp) this.writer.u8(Code.MakeTuple);
    else throw new Error('UNKNOWN_OP');
  }
}
