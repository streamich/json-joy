import {DelOp, InsObjOp, InsStrOp, InsBinOp, InsArrOp, UpdArrOp} from '../../../json-crdt-patch/operations';
import {RandomJson} from '@jsonjoy.com/json-random';
import type {JsonNode, ObjNode, ArrNode, BinNode, StrNode} from '../../nodes';
import type {Model} from '../../model/Model';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import type {FuzzerOptions} from './types';

type StringOp = typeof InsStrOp | typeof DelOp;
type BinaryOp = typeof InsBinOp | typeof DelOp;
type ArrayOp = typeof InsArrOp | typeof DelOp | typeof UpdArrOp;
type ObjectOp = typeof InsObjOp | typeof DelOp;

const commonKeys = ['a', 'op', 'test', 'name', '', '__proto__'];

/**
 * This class picks random nodes from a model and picks a random
 * operation to apply to that node.
 */
export class Picker {
  constructor(public opts: FuzzerOptions) {}

  public pickNode(model: Model): JsonNode | null {
    const nodes: JsonNode[] = [];
    const index = model.index;
    index.forEach(({v: node}) => nodes.push(node));
    if (!nodes.length) return null;
    return Fuzzer.pick(nodes);
  }

  public pickStringOperation(node: StrNode): StringOp {
    const length = node.length();
    if (!length) return InsStrOp;
    if (length >= this.opts.maxStringLength) return DelOp;
    if (Math.random() < this.opts.stringDeleteProbability) return DelOp;
    return InsStrOp;
  }

  public pickBinaryOperation(node: BinNode): BinaryOp {
    const length = node.length();
    if (!length) return InsBinOp;
    if (length >= this.opts.maxStringLength) return DelOp;
    if (Math.random() < this.opts.binaryDeleteProbability) return DelOp;
    return InsBinOp;
  }

  public pickObjectOperation(node: ObjNode): [key: string, opcode: ObjectOp] {
    if (!node.keys.size) return [this.generateObjectKey(), InsObjOp];
    if (Math.random() > 0.45) return [this.generateObjectKey(), InsObjOp];
    const keys = [...node.keys.keys()];
    if (!keys.length) return [this.generateObjectKey(), InsObjOp];
    const key = Fuzzer.pick(keys);
    return [key, DelOp];
  }

  public pickArrayOperation(node: ArrNode): ArrayOp {
    if (!node.length()) return InsArrOp;
    if (Math.random() > 0.45) return InsArrOp;
    if (Math.random() > 0.45) return UpdArrOp;
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
      const str = Fuzzer.pick(commonKeys);
      if (this.opts.noProtoString && str === '__proto__') return this.generateObjectKey();
      return str;
    } else {
      const length = Math.floor(Math.random() * 20) + 1;
      return RandomJson.genString(length);
    }
  }
}
