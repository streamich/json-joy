import {Decoder} from './Decoder';
import type {JsonCrdtSnapshot} from './types';

export const crdtJsonDecoder = new Decoder();
export const crdtJsonDecode = (encoded: JsonCrdtSnapshot) => crdtJsonDecoder.decode(encoded);
