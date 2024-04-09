import type {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {BinaryEncoderCodegenContext, type BinaryEncoderCodegenContextOptions} from './BinaryEncoderCodegenContext';

export interface CborEncoderCodegenContextOptions extends BinaryEncoderCodegenContextOptions<CborEncoder> {}
export class CborEncoderCodegenContext extends BinaryEncoderCodegenContext<CborEncoder> {}
