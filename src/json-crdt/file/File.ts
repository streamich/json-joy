import {Model} from '../model';
import {PatchLog} from '../history/PatchLog';
import {printTree} from '../../util/print/printTree';
import {decodeModel, decodeNdjsonComponents, decodePatch, decodeSeqCborComponents} from './util';
import {Patch} from '../../json-crdt-patch';
import {FileModelEncoding} from './constants';
import type {encode as encodeCompact} from '../../json-crdt-patch/codec/compact/encode';
import type {encode as encodeVerbose} from '../../json-crdt-patch/codec/verbose/encode';
import type {CborEncoder} from '../../json-pack/cbor/CborEncoder';
import type {JsonEncoder} from '../../json-pack/json/JsonEncoder';
import type {Encoder as StructuralEncoderCompact} from '../codec/structural/compact/Encoder';
import type {Encoder as StructuralEncoderVerbose} from '../codec/structural/verbose/Encoder';
import type {Decoder as SidecarDecoder} from '../codec/sidecar/binary/Decoder';
import type {Encoder as SidecarEncoder} from '../codec/sidecar/binary/Encoder';
import type * as types from './types';
import type {Printable} from '../../util/print/types';

export interface FileOptions {
  jsonEncoder?: JsonEncoder;
  cborEncoder?: CborEncoder;
  structuralCompactEncoder?: StructuralEncoderCompact;
  structuralVerboseEncoder?: StructuralEncoderVerbose;
  sidecarEncoder?: SidecarEncoder;
  sidecarDecoder?: SidecarDecoder;
  patchCompactEncoder?: typeof encodeCompact;
  patchVerboseEncoder?: typeof encodeVerbose;
}

export class File implements Printable {
  public static unserialize(components: types.FileReadSequence, options: FileOptions = {}): File {
    const [view, metadata, model, history, ...frontier] = components;
    const modelFormat = metadata[1];
    let decodedModel: Model<any> | null = null;
    if (model) {
      const isSidecar = modelFormat === FileModelEncoding.SidecarBinary;
      if (isSidecar) {
        const decoder = options.sidecarDecoder;
        if (!decoder) throw new Error('NO_SIDECAR_DECODER');
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
    if (frontier.length) {
      for (const patch of frontier) {
        const patchDecoded = decodePatch(patch);
        decodedModel.applyPatch(patchDecoded);
        log.push(patchDecoded);
      }
    }
    const file = new File(decodedModel, log);
    return file;
  }

  public static fromNdjson(blob: Uint8Array, options: FileOptions = {}): File {
    const components = decodeNdjsonComponents(blob);
    return File.unserialize(components as types.FileReadSequence, options);
  }

  public static fromSeqCbor(blob: Uint8Array, options: FileOptions = {}): File {
    const components = decodeSeqCborComponents(blob);
    return File.unserialize(components as types.FileReadSequence, options);
  }

  public static fromModel(model: Model<any>, options: FileOptions = {}): File {
    return new File(model, PatchLog.fromNewModel(model), options);
  }

  constructor(
    public readonly model: Model,
    public readonly log: PatchLog,
    protected readonly options: FileOptions = {},
  ) {}

  public apply(patch: Patch): void {
    const id = patch.getId();
    if (!id) return;
    this.model.applyPatch(patch);
    this.log.push(patch);
  }

  /**
   * @todo Remove synchronization from here. Make `File` just responsible for
   * serialization and deserialization.
   */
  public sync(): () => void {
    const {model, log} = this;
    const api = model.api;
    const autoflushUnsubscribe = api.autoFlush();
    const onPatchUnsubscribe = api.onPatch.listen((patch) => {
      log.push(patch);
    });
    const onFlushUnsubscribe = api.onFlush.listen((patch) => {
      log.push(patch);
    });
    return () => {
      autoflushUnsubscribe();
      onPatchUnsubscribe();
      onFlushUnsubscribe();
    };
  }

  public serialize(params: types.FileSerializeParams = {}): types.FileWriteSequence {
    if (params.noView && params.model === 'sidecar') throw new Error('SIDECAR_MODEL_WITHOUT_VIEW');
    const metadata: types.FileMetadata = [{}, FileModelEncoding.Auto];
    let model: Uint8Array | unknown | null = null;
    const modelFormat = params.model ?? 'sidecar';
    switch (modelFormat) {
      case 'sidecar': {
        metadata[1] = FileModelEncoding.SidecarBinary;
        const encoder = this.options.sidecarEncoder;
        if (!encoder) throw new Error('NO_SIDECAR_ENCODER');
        const [, uint8] = encoder.encode(this.model);
        model = uint8;
        break;
      }
      case 'binary': {
        model = this.model.toBinary();
        break;
      }
      case 'compact': {
        const encoder = this.options.structuralCompactEncoder;
        if (!encoder) throw new Error('NO_COMPACT_ENCODER');
        model = encoder.encode(this.model);
        break;
      }
      case 'verbose': {
        const encoder = this.options.structuralVerboseEncoder;
        if (!encoder) throw new Error('NO_VERBOSE_ENCODER');
        model = encoder.encode(this.model);
        break;
      }
      case 'none': {
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
        const encoder = this.options.structuralCompactEncoder;
        if (!encoder) throw new Error('NO_COMPACT_ENCODER');
        history[0] = encoder.encode(this.log.start);
        const encodeCompact = this.options.patchCompactEncoder;
        if (!encodeCompact) throw new Error('NO_COMPACT_PATCH_ENCODER');
        const list = history[1];
        this.log.patches.forEach(({v}) => {
          list.push(encodeCompact(v));
        });
        break;
      }
      case 'verbose': {
        const encoder = this.options.structuralVerboseEncoder;
        if (!encoder) throw new Error('NO_VERBOSE_ENCODER');
        history[0] = encoder.encode(this.log.start);
        const encodeVerbose = this.options.patchVerboseEncoder;
        if (!encodeVerbose) throw new Error('NO_VERBOSE_PATCH_ENCODER');
        const list = history[1];
        this.log.patches.forEach(({v}) => {
          list.push(encodeVerbose(v));
        });
        break;
      }
      case 'none': {
        break;
      }
      default:
        throw new Error(`Invalid history format: ${patchFormat}`);
    }
    return [params.noView ? null : this.model.view(), metadata, model, history];
  }

  public toBinary(params: types.FileEncodingParams): Uint8Array {
    const sequence = this.serialize(params);
    switch (params.format) {
      case 'ndjson': {
        const json = this.options.jsonEncoder;
        if (!json) throw new Error('NO_JSON_ENCODER');
        for (const component of sequence) {
          json.writeAny(component);
          json.writer.u8('\n'.charCodeAt(0));
        }
        return json.writer.flush();
      }
      case 'seq.cbor': {
        const cbor = this.options.cborEncoder;
        if (!cbor) throw new Error('NO_CBOR_ENCODER');
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
