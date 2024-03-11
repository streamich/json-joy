// import {bufferToUint8Array} from '../../../util/buffers/bufferToUint8Array';
import type {IpldCodec} from '../types';

export const raw: IpldCodec = {
  name: 'Raw',
  encoder: {
    encode: (value: unknown): Uint8Array => {
      if (value instanceof Uint8Array) return value;
      // if (typeof Buffer !== 'undefined') {
      //   if(Buffer.isBuffer(value)) return bufferToUint8Array(value as Buffer);
      //   return bufferToUint8Array(Buffer.from(String(value)));
      // }
      throw new Error('VALUE_NOT_SUPPORTED');
    },
  },
  decoder: {
    decode: (data: Uint8Array): unknown => data,
  },
};
