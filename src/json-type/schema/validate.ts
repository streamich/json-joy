import type {Display} from './common';
import type {TExample, TType, WithValidator} from './schema';

export const validateDisplay = ({title, description, intro}: Display): void => {
  if (title !== undefined && typeof title !== 'string') throw new Error('INVALID_TITLE');
  if (description !== undefined && typeof description !== 'string') throw new Error('INVALID_DESCRIPTION');
  if (intro !== undefined && typeof intro !== 'string') throw new Error('INVALID_INTRO');
};

export const validateTExample = (example: TExample): void => {
  validateDisplay(example);
};

export const validateTType = (tType: TType, kind: string): void => {
  validateDisplay(tType);
  const {id} = tType;
  if (id !== undefined && typeof id !== 'string') throw new Error('INVALID_ID');
  if (tType.kind !== kind) throw new Error('INVALID_TYPE');
  const {examples} = tType;
  if (examples) {
    if (!Array.isArray(examples)) throw new Error('INVALID_EXAMPLES');
    examples.forEach(validateTExample);
  }
};

export const validateWithValidator = ({validator}: WithValidator): void => {
  if (validator !== undefined) {
    if (Array.isArray(validator)) {
      for (const v of validator) if (typeof v !== 'string') throw new Error('INVALID_VALIDATOR');
    } else if (typeof validator !== 'string') throw new Error('INVALID_VALIDATOR');
  }
};

export const validateMinMax = (min: number | undefined, max: number | undefined) => {
  if (min !== undefined) {
    if (typeof min !== 'number') throw new Error('MIN_TYPE');
    if (min < 0) throw new Error('MIN_NEGATIVE');
    if (min % 1 !== 0) throw new Error('MIN_DECIMAL');
  }
  if (max !== undefined) {
    if (typeof max !== 'number') throw new Error('MAX_TYPE');
    if (max < 0) throw new Error('MAX_NEGATIVE');
    if (max % 1 !== 0) throw new Error('MAX_DECIMAL');
  }
  if (min !== undefined && max !== undefined && min > max) throw new Error('MIN_MAX');
};
