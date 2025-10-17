import {Decoder as SidecarDecoder} from '../../codec/sidecar/binary/Decoder';
import {Decoder as StructuralDecoderCompact} from '../../codec/structural/compact/Decoder';
import {Decoder as StructuralDecoderVerbose} from '../../codec/structural/verbose/Decoder';
import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {decode as decodeCompact} from '../../../json-crdt-patch/codec/compact/decode';
import {decode as decodeVerbose} from '../../../json-crdt-patch/codec/verbose/decode';
import type {LogDecoderOpts} from './LogDecoder';

/**
 * Default {@link LogDecoderOpts} for {@link LogDecoder}. Instantiates all
 * possible decoders.
 */
export const logDecoderOpts: LogDecoderOpts = {
  jsonDecoder: new JsonDecoder(),
  cborDecoder: new CborDecoder(),
  structuralCompactDecoder: new StructuralDecoderCompact(),
  structuralVerboseDecoder: new StructuralDecoderVerbose(),
  sidecarDecoder: new SidecarDecoder(),
  patchCompactDecoder: decodeCompact,
  patchVerboseDecoder: decodeVerbose,
};
