import {RpcError} from './caller';

export const validateId = (id: unknown) => {
  if (typeof id !== 'number' || !Number.isInteger(id) || id < 0) {
    throw RpcError.value(RpcError.validation('Invalid id'));
  }
};

export const validateMethod = (method: unknown) => {
  if (!method || typeof method !== 'string' || method.length > 64) {
    throw RpcError.value(RpcError.validation('Invalid method'));
  }
};
