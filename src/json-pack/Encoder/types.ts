export interface IMessagePackEncoder {
  encodeAny(value: unknown): void;
  encodeNumber(num: number): void;
  encodeString(str: string): void;
  encodeArray(arr: unknown[]): void;
  encodeArrayHeader(length: number): void;
  encodeObject(obj: Record<string, unknown>): void;
  encodeObjectHeader(length: number): void;
}
