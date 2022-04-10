import {decode as decodeCompact} from '../compact/decode';
import {decode as decodeMsgPack} from '../../../json-pack/util';
import {Patch} from '../../Patch';
import type {MsgPack} from '../../../json-pack';

export const decode = (buf: MsgPack<unknown[]>): Patch => {
  return decodeCompact(decodeMsgPack(buf as MsgPack<unknown[]>));
};
