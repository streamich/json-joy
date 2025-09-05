import {Model} from '../../model';
import {Log} from '../Log';
import {Patch} from '../../../json-crdt-patch';
import {FileModelEncoding} from './constants';
import {SESSION} from '../../../json-crdt-patch/constants';
import type * as types from './types';
import type {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import type {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import type {Decoder as SidecarDecoder} from '../../codec/sidecar/binary/Decoder';
import type {Decoder as StructuralDecoderCompact} from '../../codec/structural/compact/Decoder';
import type {Decoder as StructuralDecoderVerbose} from '../../codec/structural/verbose/Decoder';
import type {decode as decodeCompact} from '../../../json-crdt-patch/codec/compact/decode';
import type {decode as decodeVerbose} from '../../../json-crdt-patch/codec/verbose/decode';
import type {CompactCodecPatch} from '../../../json-crdt-patch/codec/compact';
import type {JsonCodecPatch} from '../../../json-crdt-patch/codec/verbose';
import type {JsonCrdtCompactDocument} from '../../codec/structural/compact';
import type {JsonCrdtVerboseDocument} from '../../codec/structural/verbose';

export interface LogDecoderOpts {
  jsonDecoder?: JsonDecoder;
  cborDecoder?: CborDecoder;
  structuralCompactDecoder?: StructuralDecoderCompact;
  structuralVerboseDecoder?: StructuralDecoderVerbose;
  sidecarDecoder?: SidecarDecoder;
  patchCompactDecoder?: typeof decodeCompact;
  patchVerboseDecoder?: typeof decodeVerbose;
}

export class LogDecoder {
  constructor(protected readonly opts: LogDecoderOpts = {}) {}

  public decode(blob: Uint8Array, params: DecodeParams = {}): DecodeResult {
    switch (params.format) {
      case 'ndjson': {
        const components = this.decodeNdjsonComponents(blob);
        const result = this.deserialize(components, params);
        return result;
      }
      default: {
        // 'seq.cbor'
        const components = this.decodeSeqCborComponents(blob);
        const result = this.deserialize(components, params);
        return result;
      }
    }
  }

  public decodeNdjsonComponents(blob: Uint8Array): types.LogComponentsWithFrontier {
    const decoder = this.opts.jsonDecoder;
    if (!decoder) throw new Error('NO_JSON_DECODER');
    const reader = decoder.reader;
    reader.reset(blob);
    const components: unknown[] = [];
    while (reader.x < blob.length) {
      components.push(decoder.readAny());
      const nl = reader.u8();
      if (nl !== '\n'.charCodeAt(0)) throw new Error('NDJSON_UNEXPECTED_NEWLINE');
    }
    return components as types.LogComponentsWithFrontier;
  }

  public decodeSeqCborComponents(blob: Uint8Array): types.LogComponentsWithFrontier {
    const decoder = this.opts.cborDecoder;
    if (!decoder) throw new Error('NO_CBOR_DECODER');
    const reader = decoder.reader;
    reader.reset(blob);
    const components: unknown[] = [];
    while (reader.x < blob.length) components.push(decoder.val());
    return components as types.LogComponentsWithFrontier;
  }

  public deserialize(components: types.LogComponentsWithFrontier, params: DeserializeParams = {}): DecodeResult {
    const [view, header, model, , ...frontier] = components;
    const result: DecodeResult = {};
    if (params.view) result.view = view;
    if (params.history) result.history = this.deserializeHistory(components);
    if (params.frontier) {
      if (!model) result.history = this.deserializeHistory(components);
      if (result.history) {
        result.frontier = result.history;
      } else if (model) {
        const modelFormat = header[1];
        const start = (): Model => {
          const isSidecar = modelFormat === FileModelEncoding.SidecarBinary;
          if (isSidecar) {
            const decoder = this.opts.sidecarDecoder;
            if (!decoder) throw new Error('NO_SIDECAR_DECODER');
            if (!(model instanceof Uint8Array)) throw new Error('NOT_BLOB');
            return decoder.decode(view, model);
          }
          return this.deserializeModel(model);
        };
        const log = new Log(start);
        const end = log.end;
        if (frontier && frontier.length) for (const patch of frontier) end.applyPatch(this.deserializePatch(patch));
        result.frontier = log;
      } else {
        throw new Error('NO_MODEL');
      }
    }
    return result;
  }

  public deserializeHistory(components: types.LogComponentsWithFrontier): Log {
    const [, header, , history, ...frontier] = components;
    const [startSerialized] = history;
    const start = (): Model => {
      if (!history || !startSerialized) {
        // TODO: Handle case where new model should be started with server clock: `return Model.withServerClock()`.
        // TODO: Handle case where model has to be started with extensions...
        return Model.create(void 0, SESSION.GLOBAL);
      }
      return this.deserializeModel(startSerialized);
    };
    const log = new Log(start, void 0, header[0]);
    const end = log.end;
    if (history) {
      const [, patches] = history;
      if (patches) for (const patch of patches) end.applyPatch(this.deserializePatch(patch));
    }
    if (frontier.length) for (const patch of frontier) end.applyPatch(this.deserializePatch(patch));
    return log;
  }

  public deserializeModel(serialized: unknown): Model {
    if (!serialized) throw new Error('NO_MODEL');
    if (serialized instanceof Uint8Array) return Model.fromBinary(serialized);
    if (Array.isArray(serialized)) {
      const decoder = this.opts.structuralCompactDecoder;
      if (!decoder) throw new Error('NO_STRUCTURAL_COMPACT_DECODER');
      return decoder.decode(<JsonCrdtCompactDocument>serialized);
    }
    if (typeof serialized === 'object') {
      const decoder = this.opts.structuralVerboseDecoder;
      if (!decoder) throw new Error('NO_STRUCTURAL_VERBOSE_DECODER');
      return decoder.decode(<JsonCrdtVerboseDocument>serialized);
    }
    throw new Error('UNKNOWN_MODEL');
  }

  public deserializePatch(serialized: unknown): Patch {
    if (!serialized) throw new Error('NO_MODEL');
    if (serialized instanceof Uint8Array) return Patch.fromBinary(serialized);
    if (Array.isArray(serialized)) {
      const decodeCompact = this.opts.patchCompactDecoder;
      if (!decodeCompact) throw new Error('NO_PATCH_COMPACT_DECODER');
      return decodeCompact(<CompactCodecPatch>serialized);
    }
    if (typeof serialized === 'object') {
      const decodeVerbose = this.opts.patchVerboseDecoder;
      if (!decodeVerbose) throw new Error('NO_PATCH_VERBOSE_DECODER');
      return decodeVerbose(<JsonCodecPatch>serialized);
    }
    throw new Error('UNKNOWN_MODEL');
  }
}

export interface DeserializeParams {
  /**
   * Whether to return decoded `view` of the end state of the log as a POJO in
   * the {@link DecodeResult}.
   */
  view?: boolean;

  /**
   * Whether to return decoded frontier of the log in the {@link DecodeResult}.
   */
  frontier?: boolean;

  /**
   * Whether to return the full history of the log in the {@link DecodeResult}.
   */
  history?: boolean;
}

export interface DecodeParams extends DeserializeParams {
  /**
   * The format of the input binary blob, whether it is NDJSON or CBOR-Sequence
   * format.
   */
  format?: 'ndjson' | 'seq.cbor';
}

/**
 * Decoding result of a log binary blob.
 */
export interface DecodeResult {
  /**
   * Plain POJO view of the end state of the log.
   */
  view?: unknown;

  /**
   * Final state of the log, the end state of the document.
   */
  frontier?: Log;

  /**
   * The full history of the log, from the start to the end state.
   */
  history?: Log;
}
