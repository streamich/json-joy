/**
 * Use this wrapper is you have a pre-encoded MessagePack value and you would
 * like to dump it into a MessagePack document as-is. The contents of `buf` will
 * be written as is to the MessagePack document.
 * 
 * @category Value
 */
export class JsonPackValue {
  constructor(public readonly buf: Uint8Array) {}
}
