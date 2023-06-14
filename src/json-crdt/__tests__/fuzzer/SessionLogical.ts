import {ArrayRga} from '../../types/rga-array/ArrayRga';
import {BinaryRga} from '../../types/rga-binary/BinaryRga';
import {decode as decodeJson} from '../../../json-crdt-patch/codec/json/decode';
import {DelOp} from '../../../json-crdt-patch/operations/DelOp';
import {encode as encodeJson} from '../../../json-crdt-patch/codec/json/encode';
import {generateInteger} from './util';
import {ArrInsOp} from '../../../json-crdt-patch/operations/ArrInsOp';
import {BinInsOp} from '../../../json-crdt-patch/operations/BinInsOp';
import {StrInsOp} from '../../../json-crdt-patch/operations/StrInsOp';
import {Model} from '../../model';
import {ObjectLww} from '../../types/lww-object/ObjectLww';
import {Patch} from '../../../json-crdt-patch/Patch';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {RandomJson} from '../../../json-random/RandomJson';
import {randomU32} from 'hyperdyperid/lib/randomU32';
import {ObjSetOp} from '../../../json-crdt-patch/operations/ObjSetOp';
import {StringRga} from '../../types/rga-string/StringRga';
import {interval} from '../../../json-crdt-patch/clock';
import {ValueLww} from '../../types/lww-value/ValueLww';
import {Fuzzer} from '../../../util/Fuzzer';
import type {JsonCrdtFuzzer} from './JsonCrdtFuzzer';

export class SessionLogical {
  public models: Model[] = [];
  public patches: Patch[][] = [];

  public modelStart: unknown;
  public modelsStart: unknown[] = [];
  public modelsEnd: unknown[] = [];
  public patchesSerialized: unknown[][] = [];

  public readonly debug = false;

  public constructor(public fuzzer: JsonCrdtFuzzer, public concurrency: number) {
    if (this.debug) this.modelStart = fuzzer.model.toBinary();
    for (let i = 0; i < concurrency; i++) {
      const model = fuzzer.model.fork();
      this.models.push(model);
      if (this.debug) this.modelsStart.push(model.toBinary());
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
    if (node instanceof StringRga) patch = this.generateStringPatch(model, node);
    else if (node instanceof BinaryRga) patch = this.generateBinaryPatch(model, node);
    else if (node instanceof ObjectLww) patch = this.generateObjectPatch(model, node);
    else if (node instanceof ArrayRga) patch = this.generateArrayPatch(model, node);
    else if (node instanceof ValueLww) patch = this.generateValuePatch(model, node);
    else return;
    if (!patch) return;
    model.applyPatch(patch);
    if (this.fuzzer.opts.testCodecs) {
      if (patch.span()) {
        if (randomU32(0, 1)) patch = decodeJson(encodeJson(patch));
      }
    }
    this.patches[peer].push(patch);
    if (this.debug) this.patchesSerialized[peer].push(encodeJson(patch));
  }

  private generateStringPatch(model: Model, node: StringRga): Patch | null {
    const opcode = this.fuzzer.picker.pickStringOperation(node);
    const builder = new PatchBuilder(model.clock);
    const size = node.length();
    if (opcode === StrInsOp) {
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

  private generateBinaryPatch(model: Model, node: BinaryRga): Patch | null {
    const opcode = this.fuzzer.picker.pickBinaryOperation(node);
    const builder = new PatchBuilder(model.clock);
    const size = node.length();
    if (opcode === BinInsOp) {
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

  private generateObjectPatch(model: Model, node: ObjectLww): Patch {
    const [key, opcode] = this.fuzzer.picker.pickObjectOperation(node);
    const builder = new PatchBuilder(model.clock);
    if (opcode === ObjSetOp) {
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
      builder.setKeys(node.id, [[key, valueId]]);
    } else {
      // console.log('DELETING KEY', JSON.stringify(key))
      builder.setKeys(node.id, [[key, builder.const(undefined)]]);
    }
    return builder.patch;
  }

  private generateArrayPatch(model: Model, node: ArrayRga): Patch {
    const opcode = this.fuzzer.picker.pickArrayOperation(node);
    const builder = new PatchBuilder(model.clock);
    const length = node.length();
    if (opcode === ArrInsOp) {
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
    } else {
      if (!length) return builder.patch;
      const pos = Math.floor(Math.random() * length);
      const valueId = node.find(pos)!;
      builder.del(node.id, [interval(valueId, 0, 1)]);
    }
    return builder.patch;
  }

  private generateValuePatch(model: Model, node: ValueLww): Patch {
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
    if (this.debug) for (const model of this.models) this.modelsEnd.push(model.toBinary());
  }
}
