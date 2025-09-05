import type {Log} from '../Log';
import {FileModelEncoding} from './constants';
import type * as types from './types';
import type {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import type {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import type {Encoder as StructuralEncoderCompact} from '../../codec/structural/compact/Encoder';
import type {Encoder as StructuralEncoderVerbose} from '../../codec/structural/verbose/Encoder';
import type {Encoder as SidecarEncoder} from '../../codec/sidecar/binary/Encoder';
import type {encode as encodeCompact} from '../../../json-crdt-patch/codec/compact/encode';
import type {encode as encodeVerbose} from '../../../json-crdt-patch/codec/verbose/encode';

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
  constructor(protected readonly options: LogEncoderOpts = {}) {}

  public serialize(log: Log, params: SerializeParams = {}): types.LogComponents {
    if (params.noView && params.model === 'sidecar') throw new Error('SIDECAR_MODEL_WITHOUT_VIEW');
    const header: types.LogHeader = [log.metadata ?? {}, FileModelEncoding.Auto];
    let model: Uint8Array | unknown | null = null;
    const modelFormat = params.model ?? 'sidecar';
    switch (modelFormat) {
      case 'sidecar': {
        header[1] = FileModelEncoding.SidecarBinary;
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
    const history: types.LogHistory = [null, []];
    const patchFormat = params.history ?? 'binary';
    switch (patchFormat) {
      case 'binary': {
        history[0] = log.start().toBinary();
        // biome-ignore lint: allow .forEach(), for now
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
        // biome-ignore lint: allow .forEach(), for now
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
        // biome-ignore lint: allow .forEach(), for now
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
    return [params.noView ? null : log.end.view(), header, model, history];
  }

  public encode(log: Log, params: EncodingParams): Uint8Array {
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

/**
 * High-level serialization parameters for encoding a {@link Log} instance into
 * a sequence of components.
 */
export interface SerializeParams {
  /**
   * If set to `false`, will not encode the view of the model as the very first
   * component. Encoding the view of the latest known state as the first
   * component of NDJSON or CBOR-Sequence is useful for allowing the decoders,
   * which do not know the details of JSON CRDTs, to just read the view and
   * ignore the rest of the components.
   */
  noView?: boolean;

  /**
   * Specifies the model encoding format for the latest state `.end` for
   * the {@link Log}. The default is `'sidecar'`. The `'sidecar'` model format
   * is a binary format which encodes only the metadata, which is very compact
   * if the view was encoded separately. As it can then be used together with
   * the view to decode it back.
   */
  model?: 'sidecar' | 'binary' | 'compact' | 'verbose' | 'none';

  /**
   * Specifies the patch `log.patches` and start model `log.start()` encoding
   * encoding format of the "history" part of the document. The default is
   * `'binary'`.
   */
  history?: 'binary' | 'compact' | 'verbose' | 'none';
}

/**
 * High-level encoding parameters for encoding a {@link Log} instance into a
 * binary blob.
 */
export interface EncodingParams extends SerializeParams {
  /**
   * Specifies the encoding format of the whole log document. The document is
   * encoded as a sequence of JSON/CBOR-like components. Those can be encoded
   * as JSON (for human-readable text) or CBOR (for compact binary data).
   *
   * - `ndjson` - encodes the log document as a sequence of new-line delimited
   *   JSON values.
   * - `seq.cbor` - encodes the log document as a CBOR sequence binary data.
   */
  format: 'ndjson' | 'seq.cbor';
}
