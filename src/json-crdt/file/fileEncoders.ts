import {Writer} from '../../util/buffers/Writer';
import {Encoder as SidecarEncoder} from '../codec/sidecar/binary/Encoder';
import {Decoder as SidecarDecoder} from '../codec/sidecar/binary/Decoder';
import {Encoder as StructuralEncoderCompact} from '../codec/structural/compact/Encoder';
import {Encoder as StructuralEncoderVerbose} from '../codec/structural/verbose/Encoder';
import {encode as encodeCompact} from '../../json-crdt-patch/codec/compact/encode';
import {encode as encodeVerbose} from '../../json-crdt-patch/codec/verbose/encode';
import {CborEncoder} from '../../json-pack/cbor/CborEncoder';
import {JsonEncoder} from '../../json-pack/json/JsonEncoder';
import type {FileOptions} from './File';

const writer = new Writer(4096);

export const fileEncoders: FileOptions = {
  jsonEncoder: new JsonEncoder(writer),
  cborEncoder: new CborEncoder(writer),
  structuralCompactEncoder: new StructuralEncoderCompact(),
  structuralVerboseEncoder: new StructuralEncoderVerbose(),
  sidecarEncoder: new SidecarEncoder(),
  sidecarDecoder: new SidecarDecoder(),
  patchCompactEncoder: encodeCompact,
  patchVerboseEncoder: encodeVerbose,
};
