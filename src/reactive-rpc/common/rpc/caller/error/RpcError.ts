import {Value} from '../../../messages/Value';
import {IRpcError, RpcErrorType} from './RpcErrorType';

export enum RpcErrorCodes {
  /** Any unknown sever error is wrapped into INTERNAL_ERROR, error 500. */
  INTERNAL_ERROR,

  /** When request is not valid, e.g. when request validation fails, error 400. */
  BAD_REQUEST,

  /**
   * Error thrown when there was no activity on a
   * stream for a long time, and timeout was reached.
   */
  TIMEOUT,

  /** Resource not found, error 404. */
  NOT_FOUND,

  /** When operation cannot be performed due to a conflict, error 409. */
  CONFLICT,

  ID_TAKEN,
  INVALID_METHOD,
  INVALID_METHOD_NAME,
  NO_METHOD_SPECIFIED,
  METHOD_NOT_FOUND,

  STOP,
  DISCONNECT,
  BUFFER_OVERFLOW,
}

export type RpcErrorValue = Value<RpcError>;

export class RpcError extends Error implements IRpcError {
  public static from(error: unknown) {
    if (error instanceof RpcError) return error;
    return RpcError.internal();
  }

  public static fromCode(errno: RpcErrorCodes, message: string = '', meta: unknown = undefined) {
    const code = RpcErrorCodes[errno];
    return new RpcError(message || code, code, errno, undefined, meta || undefined);
  }

  public static internal(message: string = 'Internal Server Error') {
    return RpcError.fromCode(RpcErrorCodes.INTERNAL_ERROR, message);
  }

  /** @todo Rename to "badRequest". */
  public static invalidRequest() {
    return RpcError.fromCode(RpcErrorCodes.BAD_REQUEST, 'Bad Request');
  }

  public static validation(message: string, meta?: unknown) {
    return RpcError.fromCode(RpcErrorCodes.BAD_REQUEST, message, meta);
  }

  public static value(error: RpcError): RpcErrorValue {
    return new Value(error, RpcErrorType);
  }

  public static valueFrom(error: unknown, def = RpcError.internalErrorValue()): RpcErrorValue {
    if (error instanceof Value && error.data instanceof RpcError && error.type === RpcErrorType) return error;
    if (error instanceof RpcError) return RpcError.value(error);
    return def;
  }

  public static valueFromCode(errno: RpcErrorCodes, message?: string): RpcErrorValue {
    return RpcError.value(RpcError.fromCode(errno, message));
  }

  public static internalErrorValue(): RpcErrorValue {
    return RpcError.value(RpcError.internal());
  }

  public static isRpcError(error: unknown): error is RpcError {
    return error instanceof RpcError;
  }

  constructor(
    public readonly message: string,
    public readonly code: string | undefined,
    public readonly errno: number,
    public readonly errorId: string | undefined,
    public readonly meta: unknown | undefined,
  ) {
    super(message);
    if (message === code) this.code = undefined;
    Object.setPrototypeOf(this, RpcError.prototype);
  }

  public toJson(): IRpcError {
    const err: IRpcError = {message: this.message};
    if (this.code) err.code = this.code;
    if (this.errno) err.errno = this.errno;
    if (this.errorId) err.errorId = this.errorId;
    if (this.meta) err.meta = this.meta;
    return err;
  }
}