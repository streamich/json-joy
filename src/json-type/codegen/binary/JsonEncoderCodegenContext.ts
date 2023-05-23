import type {JsonEncoder} from '../../../json-pack/json/JsonEncoder';
import {BinaryEncoderCodegenContext, type BinaryEncoderCodegenContextOptions} from './BinaryEncoderCodegenContext';

export interface JsonEncoderCodegenContextOptions extends BinaryEncoderCodegenContextOptions<JsonEncoder> {}
export class JsonEncoderCodegenContext extends BinaryEncoderCodegenContext<JsonEncoder> {}
