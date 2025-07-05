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
          case 'object':
            if (!Array.isArray(step) || step.length > 3 || step.length < 1) throw new Error('INVALID_TYPE');
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

export const getTag = (type: SliceType): string | number => {
  if (!Array.isArray(type)) return type;
  const length = type.length;
  if (!length) return '';
  const tagWithMaybeDiscriminant = type[length - 1];
  const hasDiscriminant = Array.isArray(tagWithMaybeDiscriminant);
  const tag = hasDiscriminant ? tagWithMaybeDiscriminant[0] : tagWithMaybeDiscriminant;
  return tag;
};

export const formatType = (step: SliceTypeStep): string => {
  let tag: string | number = '';
  let discriminant: number = -1;
  if (Array.isArray(step)) {
    tag = step[0];
    discriminant = step[1];
  } else {
    tag = step;
  }
  if (typeof tag === 'number' && Math.abs(tag) <= 64 && SliceTypeName[tag]) tag = SliceTypeName[tag] ?? tag;
  return '<' + tag + (discriminant >= 0 ? ':' + discriminant : '') + '>';
};
