import {RpcServerError} from "./constants";

export interface ErrorFormatter<E = unknown> {
  /**
   * Method to format any error thrown by application to correct format.
   */
  format(error: E | Error | unknown): E;

   /**
    * Method to format validation error thrown by .validate() function of a
    * method. If this property not provided, defaults to `.formatError`.
    */
  formatValidation(error: E | Error | unknown): E;

   /**
    * Method to format error into the correct format.
    */
  formatCode(code: RpcServerError): E;
}

export interface ErrorLike {
  message: string;
  status?: number;
  code?: string;
  errno?: number;
  errorId?: number;
}

export const formatErrorLike = (error: ErrorLike): ErrorLike => {
  const out: ErrorLike = {message: error.message};
  if (typeof error.status === 'number') out.status = error.status;
  if (typeof error.code === 'string') out.code = error.code;
  if (typeof error.errno === 'number') out.errno = error.errno;
  if (typeof error.errorId === 'number') out.errorId = error.errorId;
  return out;
};

const isErrorLike = (error: unknown): error is ErrorLike => {
  if (error instanceof Error) return true;
  if (typeof error === 'object')
    if (typeof (error as Record<string, unknown>).message === 'string') return true;
  return false;
};

export const formatError = (error: unknown): ErrorLike => {
  if (isErrorLike(error)) return formatErrorLike(error);
  return {
    message: String(error),
  };
};

export const formatErrorCode = (errno: number): ErrorLike => {
  return {
    message: 'PROTOCOL',
    errno,
  };
};

export class ErrorLikeErrorFormatter implements ErrorFormatter<ErrorLike> {
  public format(error: ErrorLike | Error | unknown): ErrorLike {
    return formatError(error);
  }

  public formatValidation(error: ErrorLike | Error | unknown): ErrorLike {
    return this.format(error);
  }

  public formatCode(code: RpcServerError): ErrorLike {
    return formatErrorCode(code);
  }
}
