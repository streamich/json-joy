import type {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {BinaryEncoderCodegenContext, type BinaryEncoderCodegenContextOptions} from './BinaryEncoderCodegenContext';

export interface JsonEncoderCodegenContextOptions extends BinaryEncoderCodegenContextOptions<JsonEncoder> {}
export class JsonEncoderCodegenContext extends BinaryEncoderCodegenContext<JsonEncoder> {}
