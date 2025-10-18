import {decode as decodeBinary, encode as encodeBinary} from '../../../json-crdt-patch/codec/binary';
import {decode as decodeCompact} from '../../../json-crdt-patch/codec/compact/decode';
import {decode as decodeJson} from '../../../json-crdt-patch/codec/verbose/decode';
import {Decoder as BinaryDecoder} from '../../codec/structural/binary/Decoder';
import {Decoder as CompactDecoder} from '../../codec/structural/compact/Decoder';
import {Decoder as JsonDecoder} from '../../codec/structural/verbose/Decoder';
import {DelOp, InsObjOp, InsStrOp, InsBinOp, InsArrOp, UpdArrOp} from '../../../json-crdt-patch/operations';
import {encode as encodeCompact} from '../../../json-crdt-patch/codec/compact/encode';
import {encode as encodeJson} from '../../../json-crdt-patch/codec/verbose/encode';
import {Encoder as BinaryEncoder} from '../../codec/structural/binary/Encoder';
import {Encoder as CompactEncoder} from '../../codec/structural/compact/Encoder';
import {Encoder as JsonEncoder} from '../../codec/structural/verbose/Encoder';
import {Encoder as IndexedBinaryEncoder} from '../../codec/indexed/binary/Encoder';
import {Decoder as IndexedBinaryDecoder} from '../../codec/indexed/binary/Decoder';
import {generateInteger} from './util';
import type {Model} from '../..';
import type {Patch} from '../../../json-crdt-patch/Patch';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {RandomJson} from '@jsonjoy.com/json-random/lib/RandomJson';
import {randomU32} from 'hyperdyperid/lib/randomU32';
import {StrNode, ValNode, ObjNode, ArrNode, BinNode} from '../../nodes';
import {interval} from '../../../json-crdt-patch/clock';
import type {JsonCrdtFuzzer} from './JsonCrdtFuzzer';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';

const jsonEncoder = new JsonEncoder();
const jsonDecoder = new JsonDecoder();
const compactEncoder = new CompactEncoder();
const compactDecoder = new CompactDecoder();
const binaryEncoder = new BinaryEncoder();
const binaryDecoder = new BinaryDecoder();
const indexedBinaryEncoder = new IndexedBinaryEncoder();
const indexedBinaryDecoder = new IndexedBinaryDecoder();

export class SessionLogical {
  public models: Model[] = [];
  public patches: Patch[][] = [];

  public modelStart: unknown;
  public modelsStart: unknown[] = [];
  public modelsEnd: unknown[] = [];
  public patchesSerialized: unknown[][] = [];

  public readonly debug = false;

  public constructor(
    public fuzzer: JsonCrdtFuzzer,
    public concurrency: number,
  ) {
    if (this.debug) this.modelStart = jsonEncoder.encode(fuzzer.model);
    for (let i = 0; i < concurrency; i++) {
      const model = fuzzer.model.fork();
      this.models.push(model);
      if (this.debug) this.modelsStart.push(jsonEncoder.encode(model));
      this.patches.push([]);
      this.patchesSerialized.push([]);
    }
  }

  public generateEdits() {
    for (let i = 0; i < this.concurrency; i++) {
      this.generatePeerEdits(i);
    }
  }

  private generatePeerEdits(peer: number) {
    const patchCount = generateInteger(...this.fuzzer.opts.patchesPerPeer);
    for (let patchIndex = 0; patchIndex < patchCount; patchIndex++) {
      this.generatePatchForPeer(peer);
    }
  }

  private generatePatchForPeer(peer: number) {
    const model = this.models[peer];
    const node = this.fuzzer.picker.pickNode(model);
    let patch: Patch | null = null;
    if (node instanceof StrNode) patch = this.generateStringPatch(model, node);
    else if (node instanceof BinNode) patch = this.generateBinaryPatch(model, node);
    else if (node instanceof ObjNode) patch = this.generateObjectPatch(model, node);
    else if (node instanceof ArrNode) patch = this.generateArrayPatch(model, node);
    else if (node instanceof ValNode) patch = this.generateValuePatch(model, node);
    else return;
    if (!patch) return;
    model.applyPatch(patch);
    if (this.fuzzer.opts.testCodecs) {
      if (patch.span()) {
        if (randomU32(0, 1)) patch = decodeJson(encodeJson(patch));
        if (randomU32(0, 1)) patch = decodeCompact(encodeCompact(patch));
        if (randomU32(0, 1)) patch = decodeBinary(encodeBinary(patch));
      }
    }
    this.patches[peer].push(patch);
    if (this.debug) this.patchesSerialized[peer].push(encodeJson(patch));
  }

  private generateStringPatch(model: Model, node: StrNode): Patch | null {
    const opcode = this.fuzzer.picker.pickStringOperation(node);
    const builder = new PatchBuilder(model.clock);
    const size = node.length();
    if (opcode === InsStrOp) {
      const substring = this.fuzzer.picker.generateSubstring();
      const pos = !size ? 0 : Math.min(size - 1, Math.floor(Math.random() * (size + 1)));
      const posId = !size ? node.id : node.find(pos)!;
      builder.insStr(node.id, posId, substring);
    } else if (opcode === DelOp) {
      if (!size) return null;
      const pos = randomU32(0, size - 1);
      const length = randomU32(1, size - pos);
      const spans = node.findInterval(pos, length);
      builder.del(node.id, spans);
    }
    return builder.patch;
  }

  private generateBinaryPatch(model: Model, node: BinNode): Patch | null {
    const opcode = this.fuzzer.picker.pickBinaryOperation(node);
    const builder = new PatchBuilder(model.clock);
    const size = node.length();
    if (opcode === InsBinOp) {
      const substring = this.fuzzer.picker.generateBinaryData();
      const pos = !size ? 0 : Math.min(size - 1, Math.floor(Math.random() * (size + 1)));
      const posId = !size ? node.id : node.find(pos)!;
      builder.insBin(node.id, posId, substring);
    } else if (opcode === DelOp) {
      if (!size) return null;
      const pos = randomU32(0, size - 1);
      const length = randomU32(1, size - pos);
      const spans = node.findInterval(pos, length);
      builder.del(node.id, spans);
    }
    return builder.patch;
  }

  private generateObjectPatch(model: Model, node: ObjNode): Patch {
    const [key, opcode] = this.fuzzer.picker.pickObjectOperation(node);
    const builder = new PatchBuilder(model.clock);
    if (opcode === InsObjOp) {
      const json = RandomJson.generate({
        nodeCount: 3,
        odds: {
          null: 1,
          boolean: 2,
          number: 10,
          string: 8,
          binary: 4,
          array: 2,
          object: 2,
        },
      });
      // console.log('ADDING KEY', key, json);
      const valueId = builder.json(json);
      builder.insObj(node.id, [[key, valueId]]);
    } else {
      // console.log('DELETING KEY', JSON.stringify(key))
      builder.insObj(node.id, [[key, builder.con(undefined)]]);
    }
    return builder.patch;
  }

  private generateArrayPatch(model: Model, node: ArrNode): Patch {
    const opcode = this.fuzzer.picker.pickArrayOperation(node);
    const builder = new PatchBuilder(model.clock);
    const length = node.length();
    if (!length || opcode === InsArrOp) {
      const json = RandomJson.generate({nodeCount: Math.ceil(Math.random() * 5)});
      const valueId = builder.json(json);
      if (!length) builder.insArr(node.id, node.id, [valueId]);
      else {
        const pos = Math.ceil(Math.random() * length);
        if (!pos) builder.insArr(node.id, node.id, [valueId]);
        else {
          const afterId = node.find(pos - 1)!;
          builder.insArr(node.id, afterId, [valueId]);
        }
      }
    } else if (opcode === UpdArrOp) {
      const pos = Math.floor(Math.random() * length);
      const keyId = node.find(pos);
      if (keyId) {
        const json = RandomJson.generate({nodeCount: Math.ceil(Math.random() * 5)});
        const valueId = builder.json(json);
        builder.updArr(node.id, keyId, valueId);
      }
    } else {
      if (!length) return builder.patch;
      const pos = Math.floor(Math.random() * length);
      const valueId = node.find(pos)!;
      builder.del(node.id, [interval(valueId, 0, 1)]);
    }
    return builder.patch;
  }

  private generateValuePatch(model: Model, node: ValNode): Patch {
    const builder = new PatchBuilder(model.clock);
    const value =
      Math.random() > 0.1
        ? Fuzzer.pick([0, 1, -1, 5, -5, 1111, -2222, 4444444444, -888888888888, RandomJson.genNumber()])
        : RandomJson.generate();
    builder.setVal(node.id, builder.constOrJson(value));
    return builder.patch;
  }

  public synchronize() {
    for (let i = 0; i < this.concurrency; i++) {
      let model = this.models[i];
      if (this.fuzzer.opts.testCodecs) {
        if (randomU32(0, 1)) model = jsonDecoder.decode(jsonEncoder.encode(model));
        if (randomU32(0, 1)) model = compactDecoder.decode(compactEncoder.encode(model));
        if (randomU32(0, 1)) model = binaryDecoder.decode(binaryEncoder.encode(model));
        if (randomU32(0, 1)) model = indexedBinaryDecoder.decode(indexedBinaryEncoder.encode(model));
      }
      for (let j = 0; j < this.concurrency; j++) {
        const patches = this.patches[j];
        for (const patch of patches) {
          model.applyPatch(patch);
        }
      }
      this.models[i] = model;
    }
    for (let j = 0; j < this.concurrency; j++) {
      const patches = this.patches[j];
      for (const patch of patches) {
        this.fuzzer.model.applyPatch(patch);
      }
    }
    if (this.debug) for (const model of this.models) this.modelsEnd.push(jsonEncoder.encode(model));
  }
}
