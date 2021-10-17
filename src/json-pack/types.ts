export type MsgPack<T> = Uint8Array & {__BRAND__: T}
