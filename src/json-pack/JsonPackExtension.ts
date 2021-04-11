/**
 * A wrapping for MessagePack extension value. When encoder encounters {@link JsonPackExtension}
 * it will encode it as MessagePack extension. Likewise, the decoder will
 * decode extensions into {@link JsonPackExtension}.
 *
 * @category Value
 */
export class JsonPackExtension {
  constructor(public readonly type: number, public readonly buf: Uint8Array) {}
}
