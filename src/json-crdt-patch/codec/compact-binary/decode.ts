import {decode as decodeJson, type CborUint8Array} from '@jsonjoy.com/json-pack/lib/cbor/shared';
import {decode as decodeCompact} from '../compact/decode';
import type {Patch} from '../../Patch';
import type {CompactCodecPatch} from '../compact/types';

export const decode = (buf: CborUint8Array<CompactCodecPatch>): Patch => {
  return decodeCompact(decodeJson(buf as CborUint8Array<CompactCodecPatch>));
};
