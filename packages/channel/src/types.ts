import type {BehaviorSubject, Observable} from "rxjs";
import type {ChannelState} from "./constants";

export interface CloseEventBase {
  readonly code: number;
  readonly reason: string;
  readonly wasClean: boolean;
}

export interface PhysicalChannel<T extends string | Uint8Array = string | Uint8Array> {
  /**
   * Emits on every new incoming message.
   */
  message$: Observable<T>;

  /**
   * Emits when error in channel is raised.
   */
  error$: Observable<Error>;

  /**
   * Contains the current state of the channel and emits on state every state
   * transition.
   */
  state$: BehaviorSubject<ChannelState>;

  /**
   * Emits once when channel transitions into "open" state.
   */
  open$: Observable<PhysicalChannel>;

  /**
   * Emits once when channel transitions into "close" state.
   */
  close$: Observable<[self: PhysicalChannel, event: CloseEventBase]>;

  /**
   * Whether the channel currently is open.
   */
  isOpen(): boolean;

  /**
   * Sends an outgoing message to the channel immediately.
   *
   * @param data A message payload.
   * @returns Number of bytes buffered or -1 if channel is not ready.
   */
  send(data: T): number;

  /**
   * Waits for the channel to connect and only then sends out the message. If
   * channel is closed, emits an error.
   *
   * @param data A message payload.
   * @returns Number of bytes buffered.
   */
  send$(data: T): Observable<number>;

  /**
   * Closes the channel.
   *
   * @param code Closure code.
   * @param reason Closure reason.
   */
  close(code?: number, reason?: string): void;

  /**
   * Amount of buffered outgoing messages in bytes.
   */
  buffer(): number;
}
