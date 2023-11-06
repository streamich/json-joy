import {encode as encodeCompact} from '../compact/encode';
import {encode as encodeJson, type CborUint8Array} from '../../../json-pack/cbor/shared';
import type {Patch} from '../../Patch';
import type {CompactCodecPatch} from '../compact/types';

export const encode = (patch: Patch): CborUint8Array<CompactCodecPatch> => {
  return encodeJson(encodeCompact(patch));
};
