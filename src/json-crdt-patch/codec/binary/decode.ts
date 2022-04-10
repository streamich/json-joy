import {Decoder} from './Decoder';
import {Patch} from '../../Patch';

const decoder = new Decoder();

export const decode = (buf: Uint8Array): Patch => {
  return decoder.decode(buf);
};
