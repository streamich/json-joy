export class NotificationMessage {
  constructor (public readonly method: string, public readonly payload: undefined | Uint8Array) {}
}
