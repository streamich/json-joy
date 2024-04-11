import {RpcValue} from '../../../messages/Value';
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

export type RpcErrorValue = RpcValue<RpcError>;

export class RpcError extends Error implements IRpcError {
  public static from(error: unknown): RpcError {
    if (error instanceof RpcError) return error;
    return RpcError.internal(error);
  }

  public static fromCode(
    errno: RpcErrorCodes,
    message: string = '',
    meta: unknown = undefined,
    originalError: unknown = undefined,
  ): RpcError {
    const code = RpcErrorCodes[errno];
    return new RpcError(message || code, code, errno, undefined, meta || undefined, originalError);
  }

  public static internal(originalError: unknown, message: string = 'Internal Server Error'): RpcError {
    return RpcError.fromCode(RpcErrorCodes.INTERNAL_ERROR, message, undefined, originalError);
  }

  public static badRequest(message = 'Bad Request'): RpcError {
    return RpcError.fromCode(RpcErrorCodes.BAD_REQUEST, message);
  }

  public static validation(message: string, meta?: unknown): RpcError {
    return RpcError.fromCode(RpcErrorCodes.BAD_REQUEST, message, meta);
  }

  public static value(error: RpcError): RpcErrorValue {
    return new RpcValue(error, RpcErrorType);
  }

  public static valueFrom(error: unknown, def = RpcError.internalErrorValue(error)): RpcErrorValue {
    if (error instanceof RpcValue && error.data instanceof RpcError && error.type === RpcErrorType) return error;
    if (error instanceof RpcError) return RpcError.value(error);
    return def;
  }

  public static valueFromCode(errno: RpcErrorCodes, message?: string): RpcErrorValue {
    return RpcError.value(RpcError.fromCode(errno, message));
  }

  public static internalErrorValue(originalError: unknown): RpcErrorValue {
    return RpcError.value(RpcError.internal(originalError));
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
    public readonly originalError: unknown | undefined,
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
