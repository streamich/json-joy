import {encode as encodeCompact} from '../compact/encode';
import {encodeFull as encodeMsgPack} from '../../../json-pack/msgpack/util';
import {Patch} from '../../Patch';
import type {MsgPack} from '../../../json-pack/msgpack';

export const encode = (patch: Patch): MsgPack<unknown[]> => {
  return encodeMsgPack(encodeCompact(patch));
};
