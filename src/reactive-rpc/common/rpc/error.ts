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

export const formatError = (error: unknown): unknown => {
  if (isErrorLike(error)) return formatErrorLike(error);
  return error;
};

export const formatErrorCode = (errno: number): ErrorLike => {
  return {
    message: 'PROTOCOL',
    errno,
  };
};
