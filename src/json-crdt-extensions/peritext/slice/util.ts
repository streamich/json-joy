import {SliceTypeName} from './constants';
import type {SliceType, SliceTypeStep} from '../slice/types';

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

export const formatType = (step: SliceTypeStep): string => {
  let discriminant: number = -1;
  let tag: string | number = Array.isArray(step) ? step[0] : step;
  if (typeof tag === 'number' && Math.abs(tag) <= 64 && SliceTypeName[tag]) tag = SliceTypeName[tag] ?? tag;
  return '<' + tag + ':' + (discriminant >= 0 ? ':' + discriminant : '') + '>';
};
