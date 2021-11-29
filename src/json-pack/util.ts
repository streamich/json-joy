import {Encoder} from './Encoder';
import {EncoderFull} from './EncoderFull';
import {Decoder} from './Decoder';
import {MsgPack} from './types';

export const encoder = new Encoder();
export const encoderFull = new EncoderFull();
export const decoder = new Decoder();

export const encode = <T>(data: T): MsgPack<T> => encoder.encode(data) as MsgPack<T>;
export const decode = <T>(blob: MsgPack<T>): T => decoder.decode(blob) as T;

export type {MsgPack};
