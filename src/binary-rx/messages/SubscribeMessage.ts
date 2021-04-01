export class SubscribeMessage {
  constructor (public readonly id: number, public readonly method: string, public readonly payload: undefined | Uint8Array) {}
}
