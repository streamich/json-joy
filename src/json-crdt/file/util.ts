import {JsonDecoder} from '../../json-pack/json/JsonDecoder';
import {CborDecoder} from '../../json-pack/cbor/CborDecoder';
import {Model} from '../model';
import {Decoder as StructuralDecoderCompact} from '../codec/structural/compact/Decoder';
import {Decoder as StructuralDecoderVerbose} from '../codec/structural/verbose/Decoder';
import {decode as decodeCompact} from '../../json-crdt-patch/codec/compact/decode';
import {decode as decodeVerbose} from '../../json-crdt-patch/codec/verbose/decode';
import {Patch} from '../../json-crdt-patch';
import type {JsonCrdtCompactDocument} from '../codec/structural/compact';
import type {JsonCrdtVerboseDocument} from '../codec/structural/verbose';
import type {CompactCodecPatch} from '../../json-crdt-patch/codec/compact';
import type {JsonCodecPatch} from '../../json-crdt-patch/codec/verbose';

export const decodeNdjsonComponents = (blob: Uint8Array): unknown[] => {
  const decoder = new JsonDecoder();
  const reader = decoder.reader;
  reader.reset(blob);
  const components: unknown[] = [];
  while (reader.x < blob.length) {
    components.push(decoder.readAny());
    const nl = reader.u8();
    if (nl !== '\n'.charCodeAt(0)) throw new Error('NDJSON_UNEXPECTED_NEWLINE');
  }
  return components;
};

export const decodeSeqCborComponents = (blob: Uint8Array): unknown[] => {
  const decoder = new CborDecoder();
  const reader = decoder.reader;
  reader.reset(blob);
  const components: unknown[] = [];
  while (reader.x < blob.length) components.push(decoder.val());
  return components;
};

export const decodeModel = (serialized: unknown): Model => {
  if (!serialized) throw new Error('NO_MODEL');
  if (serialized instanceof Uint8Array) return Model.fromBinary(serialized);
  if (Array.isArray(serialized))
    return new StructuralDecoderCompact().decode(<JsonCrdtCompactDocument>serialized);
  if (typeof serialized === 'object')
    return new StructuralDecoderVerbose().decode(<JsonCrdtVerboseDocument>serialized);
  throw new Error('UNKNOWN_MODEL');
};

export const decodePatch = (serialized: unknown): Patch => {
  if (!serialized) throw new Error('NO_MODEL');
  if (serialized instanceof Uint8Array) return Patch.fromBinary(serialized);
  if (Array.isArray(serialized)) return decodeCompact(<CompactCodecPatch>serialized);
  if (typeof serialized === 'object') return decodeVerbose(<JsonCodecPatch>serialized);
  throw new Error('UNKNOWN_MODEL');
};
