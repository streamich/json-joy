import {decode as decodeCompact} from '../compact/decode';
import {decode as decodeJson, type CborUint8Array} from '../../../json-pack/cbor/shared';
import type {Patch} from '../../Patch';
import type {CompactCodecPatch} from '../compact/types';

export const decode = (buf: CborUint8Array<CompactCodecPatch>): Patch => {
  return decodeCompact(decodeJson(buf as CborUint8Array<CompactCodecPatch>));
};
