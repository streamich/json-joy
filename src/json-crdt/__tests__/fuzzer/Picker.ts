import {DelOp} from '../../../json-crdt-patch/operations/DelOp';
import {ArrInsOp} from '../../../json-crdt-patch/operations/ArrInsOp';
import {BinInsOp} from '../../../json-crdt-patch/operations/BinInsOp';
import {StrInsOp} from '../../../json-crdt-patch/operations/StrInsOp';
import {ObjSetOp} from '../../../json-crdt-patch/operations/ObjSetOp';
import {RandomJson} from '../../../json-random';
import {JsonNode} from '../../types';
import {ObjectLww} from '../../types/lww-object/ObjectLww';
import {ArrayRga} from '../../types/rga-array/ArrayRga';
import {BinaryRga} from '../../types/rga-binary/BinaryRga';
import {StringRga} from '../../types/rga-string/StringRga';
import {Model} from '../../model/Model';
import {Fuzzer} from '../../../util/Fuzzer';
import {FuzzerOptions} from './types';

type StringOp = typeof StrInsOp | typeof DelOp;
type BinaryOp = typeof BinInsOp | typeof DelOp;
type ArrayOp = typeof ArrInsOp | typeof DelOp;
type ObjectOp = typeof ObjSetOp | typeof DelOp;

const commonKeys = ['a', 'op', 'test', 'name', '', '__proto__'];

/**
 * This class picks random nodes from a model and picks a random
 * operation to apply to that node.
 */
export class Picker {
  constructor(public opts: FuzzerOptions) {}

  public pickNode(model: Model): JsonNode | null {
    const sessions = [...model.index.entries.keys()];
    if (!sessions.length) return null;
    const sessionId = sessions[Math.floor(Math.random() * sessions.length)];
    const map = model.index.entries.get(sessionId)!;
    const nodeCount = map.size;
    const index = Math.floor(Math.random() * nodeCount);
    let pos = 0;
    for (const node of map.values()) {
      if (pos === index) return node;
      pos++;
    }
    return null;
  }

  public pickStringOperation(node: StringRga): StringOp {
    const length = node.length();
    if (!length) return StrInsOp;
    if (length >= this.opts.maxStringLength) return DelOp;
    if (Math.random() < this.opts.stringDeleteProbability) return DelOp;
    return StrInsOp;
  }

  public pickBinaryOperation(node: BinaryRga): BinaryOp {
    const length = node.length();
    if (!length) return BinInsOp;
    if (length >= this.opts.maxStringLength) return DelOp;
    if (Math.random() < this.opts.binaryDeleteProbability) return DelOp;
    return BinInsOp;
  }

  public pickObjectOperation(node: ObjectLww): [key: string, opcode: ObjectOp] {
    if (!node.keys.size) return [this.generateObjectKey(), ObjSetOp];
    if (Math.random() > 0.45) return [this.generateObjectKey(), ObjSetOp];
    const keys = [...node.keys.keys()];
    if (!keys.length) return [this.generateObjectKey(), ObjSetOp];
    const key = keys[Math.floor(Math.random() * keys.length)];
    return [key, DelOp];
  }

  public pickArrayOperation(node: ArrayRga): ArrayOp {
    if (!node.length()) return ArrInsOp;
    if (Math.random() > 0.45) return ArrInsOp;
    else return DelOp;
  }

  public generateSubstring(): string {
    const length = Math.floor(Math.random() * this.opts.maxSubstringLength) + 1;
    return RandomJson.genString(length);
  }

  public generateBinaryData(): Uint8Array {
    const length = Math.floor(Math.random() * this.opts.maxBinaryChunkLength) + 1;
    return RandomJson.genBinary(length);
  }

  public generateObjectKey(): string {
    const useCommonKey = Math.random() < 0.25;
    if (useCommonKey) {
      return Fuzzer.pick(commonKeys);
    } else {
      const length = Math.floor(Math.random() * 20) + 1;
      return RandomJson.genString(length);
    }
  }
}
