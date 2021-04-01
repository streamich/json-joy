import {AtomicMessages} from "./types";

export class BatchMessage {
  constructor (public readonly messages: AtomicMessages[]) {}
}
