import {encode as encodeJson, type CborUint8Array} from '@jsonjoy.com/json-pack/lib/cbor/shared';
import {encode as encodeCompact} from '../compact/encode';
import type {Patch} from '../../Patch';
import type {CompactCodecPatch} from '../compact/types';

export const encode = (patch: Patch): CborUint8Array<CompactCodecPatch> => {
  return encodeJson(encodeCompact(patch));
};
