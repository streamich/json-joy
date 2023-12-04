import {Model} from '../model';
import {PatchLog} from './PatchLog';
import {FileModelEncoding} from './constants';
import {Encoder as SidecarEncoder} from '../codec/sidecar/binary/Encoder';
import {Decoder as SidecarDecoder} from '../codec/sidecar/binary/Decoder';
import {Encoder as StructuralEncoderCompact} from '../codec/structural/compact/Encoder';
import {Encoder as StructuralEncoderVerbose} from '../codec/structural/verbose/Encoder';
import {encode as encodeCompact} from '../../json-crdt-patch/codec/compact/encode';
import {encode as encodeVerbose} from '../../json-crdt-patch/codec/verbose/encode';
import {Writer} from '../../util/buffers/Writer';
import {CborEncoder} from '../../json-pack/cbor/CborEncoder';
import {JsonEncoder} from '../../json-pack/json/JsonEncoder';
import {printTree} from '../../util/print/printTree';
import {decodeModel, decodeNdjsonComponents, decodePatch, decodeSeqCborComponents} from './util';
import type * as types from './types';
import type {Printable} from '../../util/print/types';

export class File implements Printable {
  public static unserialize(components: types.FileReadSequence): File {
    const [view, metadata, model, history, ...frontier] = components;
    const modelFormat = metadata[1];
    let decodedModel: Model<any> | null = null;
    if (model && modelFormat !== FileModelEncoding.None) {
      const isSidecar = modelFormat === FileModelEncoding.SidecarBinary;
      if (isSidecar) {
        const decoder = new SidecarDecoder();
        if (!(model instanceof Uint8Array)) throw new Error('NOT_BLOB');
        decodedModel = decoder.decode(view, model);
      } else {
        decodedModel = decodeModel(model);
      }
    }
    let log: PatchLog | null = null;
    if (history) {
      const [start, patches] = history;
      if (start) {
        const startModel = decodeModel(start);
        log = new PatchLog(startModel);
        for (const patch of patches) log.push(decodePatch(patch));
      }
    }
    if (!log) throw new Error('NO_HISTORY');
    if (!decodedModel) decodedModel = log.replayToEnd();
    const file = new File(decodedModel, log);
    return file;
  }

  public static fromNdjson(blob: Uint8Array): File {
    const components = decodeNdjsonComponents(blob);
    return File.unserialize(components as types.FileReadSequence);
  }

  public static fromSeqCbor(blob: Uint8Array): File {
    const components = decodeSeqCborComponents(blob);
    return File.unserialize(components as types.FileReadSequence);
  }

  public static fromModel(model: Model<any>): File {
    return new File(model, PatchLog.fromModel(model));
  }

  constructor(public readonly model: Model, public readonly log: PatchLog) {}

  public serialize(params: types.FileSerializeParams = {}): types.FileWriteSequence {
    const view = this.model.view();
    const metadata: types.FileMetadata = [{}, FileModelEncoding.SidecarBinary];
    let model: Uint8Array | unknown | null = null;
    const modelFormat = params.model ?? 'sidecar';
    switch (modelFormat) {
      case 'sidecar': {
        metadata[1] = FileModelEncoding.SidecarBinary;
        const encoder = new SidecarEncoder();
        const [, uint8] = encoder.encode(this.model);
        model = uint8;
        break;
      }
      case 'binary': {
        metadata[1] = FileModelEncoding.StructuralBinary;
        model = this.model.toBinary();
        break;
      }
      case 'compact': {
        metadata[1] = FileModelEncoding.StructuralCompact;
        model = new StructuralEncoderCompact().encode(this.model);
        break;
      }
      case 'verbose': {
        metadata[1] = FileModelEncoding.StructuralVerbose;
        model = new StructuralEncoderVerbose().encode(this.model);
        break;
      }
      case 'none': {
        metadata[1] = FileModelEncoding.None;
        model = null;
        break;
      }
      default:
        throw new Error(`Invalid model format: ${modelFormat}`);
    }
    const history: types.FileWriteSequenceHistory = [null, []];
    const patchFormat = params.history ?? 'binary';
    switch (patchFormat) {
      case 'binary': {
        history[0] = this.log.start.toBinary();
        this.log.patches.forEach(({v}) => {
          history[1].push(v.toBinary());
        });
        break;
      }
      case 'compact': {
        history[0] = new StructuralEncoderCompact().encode(this.log.start);
        this.log.patches.forEach(({v}) => {
          history[1].push(encodeCompact(v));
        });
        break;
      }
      case 'verbose': {
        history[0] = new StructuralEncoderVerbose().encode(this.log.start);
        this.log.patches.forEach(({v}) => {
          history[1].push(encodeVerbose(v));
        });
        break;
      }
      case 'none': {
        break;
      }
      default:
        throw new Error(`Invalid history format: ${patchFormat}`);
    }
    return [view, metadata, model, history];
  }

  public toBinary(params: types.FileEncodingParams): Uint8Array {
    const sequence = this.serialize(params);
    const writer = new Writer(16 * 1024);
    switch (params.format) {
      case 'ndjson': {
        const json = new JsonEncoder(writer);
        for (const component of sequence) {
          json.writeAny(component);
          json.writer.u8('\n'.charCodeAt(0));
        }
        return json.writer.flush();
      }
      case 'seq.cbor': {
        const cbor = new CborEncoder(writer);
        for (const component of sequence) cbor.writeAny(component);
        return cbor.writer.flush();
      }
    }
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab?: string) {
    return `file` + printTree(tab, [(tab) => this.model.toString(tab), () => '', (tab) => this.log.toString(tab)]);
  }
}
