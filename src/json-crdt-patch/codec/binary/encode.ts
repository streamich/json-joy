import {Encoder} from './Encoder';
import {Patch} from '../../Patch';

const encoder = new Encoder();

export const encode = (patch: Patch): Uint8Array => {
  return encoder.encode(patch);
};
