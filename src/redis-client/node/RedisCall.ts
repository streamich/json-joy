import {Defer} from "thingies/es2020/Defer";

/**
 * Represents a single Redis request/response command call.
 */
export class RedisCall {
  /**
   * Whether to try to decode RESP responses binary strings as UTF-8 strings.
   */
  public utf8Res?: boolean;

  /**
   * Whether to ignore the response. This is useful for commands like PUBLISH
   * where the response is not useful. Or where it is not needed.
   */
  public noRes?: boolean;

  public readonly response = new Defer<unknown>();

  constructor(public readonly args: unknown[]) {}
}
