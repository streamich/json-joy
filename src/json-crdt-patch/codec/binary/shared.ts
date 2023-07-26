import {Encoder} from './Encoder';
import {Decoder} from './Decoder';
import {Patch} from '../../Patch';
import {CrdtWriter} from '../../util/binary/CrdtEncoder';

const writer = new CrdtWriter(1024 * 16);
export const encoder = new Encoder(writer);

export const encode = (patch: Patch): Uint8Array => {
  return encoder.encode(patch);
};

export const decoder = new Decoder();

export const decode = (buf: Uint8Array): Patch => {
  return decoder.decode(buf);
};
