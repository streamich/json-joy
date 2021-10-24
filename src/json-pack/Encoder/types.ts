import type {IEncoderWriter} from '../../util/encoder';

export interface IMessagePackEncoder extends IEncoderWriter {
  encodeAny(value: unknown): void;
  encodeNumber(num: number): void;
  encodeString(str: string): void;
  encodeArray(arr: unknown[]): void;
  encodeArrayHeader(length: number): void;
  encodeObject(obj: Record<string, unknown>): void;
  encodeObjectHeader(length: number): void;
}
