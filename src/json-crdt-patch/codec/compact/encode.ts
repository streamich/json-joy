import {ArrInsOp} from '../../operations/ArrInsOp';
import {ArrOp} from '../../operations/ArrOp';
import {BinInsOp} from '../../operations/BinInsOp';
import {BinOp} from '../../operations/BinOp';
import {Code} from './constants';
import {ConstOp} from '../../operations/ConstOp';
import {DelOp} from '../../operations/DelOp';
import {ITimespanStruct, ITimestampStruct, Timestamp} from '../../clock';
import {NoopOp} from '../../operations/NoopOp';
import {ObjOp} from '../../operations/ObjOp';
import {ObjSetOp} from '../../operations/ObjSetOp';
import {Patch} from '../../Patch';
import {SESSION} from '../../constants';
import {StrInsOp} from '../../operations/StrInsOp';
import {StrOp} from '../../operations/StrOp';
import {toBase64} from '../../../util/base64/toBase64';
import {ValOp} from '../../operations/ValOp';
import {ValSetOp} from '../../operations/ValSetOp';
import {TupOp} from '../../operations/TupOp';

export const encode = (patch: Patch): unknown[] => {
  const id = patch.getId();
  if (!id) throw new Error('PATCH_EMPTY');

  const sessionId = id.sid;
  const {time} = id;
  const res: unknown[] = sessionId === SESSION.SERVER ? [time] : [[sessionId, time]];

  const pushTimestamp = (ts: ITimestampStruct) => {
    const tsSessionId = ts.sid;
    if (tsSessionId === SESSION.SERVER) res.push(ts.time);
    else if (tsSessionId === sessionId && ts.time >= time) res.push(time - ts.time - 1);
    else res.push([tsSessionId, ts.time]);
  };

  const pushTimespan = (span: ITimespanStruct) => {
    pushTimestamp(span);
    res.push(span.span);
  };

  for (const op of patch.ops) {
    if (op instanceof ObjOp) {
      res.push(Code.MakeObject);
    } else if (op instanceof ArrOp) {
      res.push(Code.MakeArray);
    } else if (op instanceof StrOp) {
      res.push(Code.MakeString);
      continue;
    } else if (op instanceof BinOp) {
      res.push(Code.MakeBinary);
      continue;
    } else if (op instanceof ObjSetOp) {
      const {obj: object, data: tuples} = op;
      res.push(Code.SetObjectKeys, tuples.length);
      pushTimestamp(object);
      for (const [key, value] of tuples) {
        res.push(key);
        pushTimestamp(value);
      }
    } else if (op instanceof StrInsOp) {
      const {obj, ref: after, data: substring} = op;
      res.push(Code.InsertStringSubstring, substring);
      pushTimestamp(obj);
      pushTimestamp(after);
    } else if (op instanceof BinInsOp) {
      const {obj, ref: after, data} = op;
      res.push(Code.InsertBinaryData, toBase64(data));
      pushTimestamp(obj);
      pushTimestamp(after);
    } else if (op instanceof ArrInsOp) {
      const {obj: arr, ref: after, data: elements} = op;
      res.push(Code.InsertArrayElements, elements.length);
      pushTimestamp(arr);
      pushTimestamp(after);
      for (const element of elements) pushTimestamp(element);
    } else if (op instanceof DelOp) {
      const {obj, what} = op;
      const length = what.length;
      if (length === 1) {
        res.push(Code.DeleteOne);
        pushTimestamp(obj);
        pushTimespan(what[0]);
      } else {
        res.push(Code.Delete, length);
        pushTimestamp(obj);
        for (const span of what) pushTimespan(span);
      }
    } else if (op instanceof NoopOp) {
      const {len: length} = op;
      if (length === 1) res.push(Code.NoopOne);
      else res.push(Code.Noop, length);
    } else if (op instanceof ConstOp) {
      if (op.val === undefined) {
        res.push(Code.MakeUndefined);
      } else if (op.val instanceof Timestamp) {
        res.push(Code.MakeConstId);
        pushTimestamp(op.val);
      } else {
        res.push(Code.MakeConstant);
        res.push(op.val);
      }
    } else if (op instanceof ValOp) {
      res.push(Code.MakeValue);
      pushTimestamp(op.val);
    } else if (op instanceof ValSetOp) {
      res.push(Code.SetValue);
      pushTimestamp(op.obj);
      pushTimestamp(op.val);
    } else if (op instanceof TupOp) {
      res.push(Code.MakeTuple);
      continue;
    }
  }

  return res;
};
