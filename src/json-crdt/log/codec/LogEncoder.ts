import {Log} from '../Log';
import {FileModelEncoding} from './constants';
import type {encode as encodeCompact} from '../../../json-crdt-patch/codec/compact/encode';
import type {encode as encodeVerbose} from '../../../json-crdt-patch/codec/verbose/encode';
import type {CborEncoder} from '../../../json-pack/cbor/CborEncoder';
import type {JsonEncoder} from '../../../json-pack/json/JsonEncoder';
import type {Encoder as StructuralEncoderCompact} from '../../codec/structural/compact/Encoder';
import type {Encoder as StructuralEncoderVerbose} from '../../codec/structural/verbose/Encoder';
import type {Encoder as SidecarEncoder} from '../../codec/sidecar/binary/Encoder';
import type * as types from './types';

export interface LogEncoderOpts {
  jsonEncoder?: JsonEncoder;
  cborEncoder?: CborEncoder;
  structuralCompactEncoder?: StructuralEncoderCompact;
  structuralVerboseEncoder?: StructuralEncoderVerbose;
  sidecarEncoder?: SidecarEncoder;
  patchCompactEncoder?: typeof encodeCompact;
  patchVerboseEncoder?: typeof encodeVerbose;
}

export class LogEncoder {
  constructor(
    protected readonly options: LogEncoderOpts = {},
  ) {}

  public serialize(log: Log, params: SerializeParams = {}): types.FileWriteSequence {
    if (params.noView && params.model === 'sidecar') throw new Error('SIDECAR_MODEL_WITHOUT_VIEW');
    const metadata: types.FileMetadata = [{}, FileModelEncoding.Auto];
    let model: Uint8Array | unknown | null = null;
    const modelFormat = params.model ?? 'sidecar';
    switch (modelFormat) {
      case 'sidecar': {
        metadata[1] = FileModelEncoding.SidecarBinary;
        const encoder = this.options.sidecarEncoder;
        if (!encoder) throw new Error('NO_SIDECAR_ENCODER');
        const [, uint8] = encoder.encode(log.end);
        model = uint8;
        break;
      }
      case 'binary': {
        model = log.end.toBinary();
        break;
      }
      case 'compact': {
        const encoder = this.options.structuralCompactEncoder;
        if (!encoder) throw new Error('NO_COMPACT_ENCODER');
        model = encoder.encode(log.end);
        break;
      }
      case 'verbose': {
        const encoder = this.options.structuralVerboseEncoder;
        if (!encoder) throw new Error('NO_VERBOSE_ENCODER');
        model = encoder.encode(log.end);
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
        history[0] = log.start().toBinary();
        log.patches.forEach(({v}) => {
          history[1].push(v.toBinary());
        });
        break;
      }
      case 'compact': {
        const encoder = this.options.structuralCompactEncoder;
        if (!encoder) throw new Error('NO_COMPACT_ENCODER');
        history[0] = encoder.encode(log.start());
        const encodeCompact = this.options.patchCompactEncoder;
        if (!encodeCompact) throw new Error('NO_COMPACT_PATCH_ENCODER');
        const list = history[1];
        log.patches.forEach(({v}) => {
          list.push(encodeCompact(v));
        });
        break;
      }
      case 'verbose': {
        const encoder = this.options.structuralVerboseEncoder;
        if (!encoder) throw new Error('NO_VERBOSE_ENCODER');
        history[0] = encoder.encode(log.start());
        const encodeVerbose = this.options.patchVerboseEncoder;
        if (!encodeVerbose) throw new Error('NO_VERBOSE_PATCH_ENCODER');
        const list = history[1];
        log.patches.forEach(({v}) => {
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
    return [params.noView ? null : log.end.view(), metadata, model, history];
  }

  public toBinary(log: Log, params: EncodingParams): Uint8Array {
    const sequence = this.serialize(log, params);
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
}

export interface SerializeParams {
  noView?: boolean;
  model?: 'sidecar' | 'binary' | 'compact' | 'verbose' | 'none';
  history?: 'binary' | 'compact' | 'verbose' | 'none';
}

export interface EncodingParams extends SerializeParams {
  format: 'ndjson' | 'seq.cbor';
}
