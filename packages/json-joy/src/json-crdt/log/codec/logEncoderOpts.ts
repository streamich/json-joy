import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {Encoder as SidecarEncoder} from '../../codec/sidecar/binary/Encoder';
import {Encoder as StructuralEncoderCompact} from '../../codec/structural/compact/Encoder';
import {Encoder as StructuralEncoderVerbose} from '../../codec/structural/verbose/Encoder';
import {encode as encodeCompact} from '../../../json-crdt-patch/codec/compact/encode';
import {encode as encodeVerbose} from '../../../json-crdt-patch/codec/verbose/encode';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import type {LogEncoderOpts} from './LogEncoder';

const writer = new Writer(4096);

/**
 * Default {@link LogEncoderOpts} for {@link LogEncoder}. Instantiates all
 * possible encoders.
 */
export const logEncoderOpts: LogEncoderOpts = {
  jsonEncoder: new JsonEncoder(writer),
  cborEncoder: new CborEncoder(writer),
  structuralCompactEncoder: new StructuralEncoderCompact(),
  structuralVerboseEncoder: new StructuralEncoderVerbose(),
  sidecarEncoder: new SidecarEncoder(),
  patchCompactEncoder: encodeCompact,
  patchVerboseEncoder: encodeVerbose,
};
