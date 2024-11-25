import {SliceTypeName} from './constants';
import type {SliceType} from '../slice/types';

export const validateType = (type: SliceType) => {
  switch (typeof type) {
    case 'string':
    case 'number':
      return;
    case 'object': {
      if (!(type instanceof Array)) throw new Error('INVALID_TYPE');
      if (type.length > 32) throw new Error('INVALID_TYPE');
      const length = type.length;
      LOOP: for (let i = 0; i < length; i++) {
        const step = type[i];
        switch (typeof step) {
          case 'string':
          case 'number':
            continue LOOP;
          default:
            throw new Error('INVALID_TYPE');
        }
      }
      return;
    }
    default:
      throw new Error('INVALID_TYPE');
  }
};

export const formatType = (type: SliceType): string => {
  let formatted: string = JSON.stringify(type);
  const num = Number(type);
  if ((typeof type === 'number' || num + '' === type) && Math.abs(num) <= 64 && SliceTypeName[num])
    formatted = '<' + SliceTypeName[num] + '>';
  return formatted;
};
