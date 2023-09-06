export interface CliCodec<Id extends string> {
  id: Id;
  encode: (value: unknown) => Uint8Array;
  decode: (bytes: Uint8Array) => unknown;
}
