import {MsgPackEncoderFast} from './MsgPackEncoderFast';
import {MsgPackEncoder} from './MsgPackEncoder';
import {MsgPackDecoderFast} from './MsgPackDecoderFast';
import type {MsgPack} from './types';

export const encoder = new MsgPackEncoderFast();
export const encoderFull = new MsgPackEncoder();
export const decoder = new MsgPackDecoderFast();

export const encode = <T>(data: T): MsgPack<T> => encoder.encode(data) as MsgPack<T>;
export const encodeFull = <T>(data: T): MsgPack<T> => encoderFull.encode(data) as MsgPack<T>;
export const decode = <T>(blob: MsgPack<T>): T => decoder.decode(blob) as T;

export type {MsgPack};
