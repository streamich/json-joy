import type {OtType} from '../types';
import type {BinaryOp} from './types';
import {validate} from './validate';
import {normalize} from './util';
import {apply} from './apply';
import {compose} from './compose';
import {transform} from './transform';

export * from './types';
export {validate} from './validate';
export {apply} from './apply';
export {compose} from './compose';
export {transform} from './transform';
export {normalize} from './util';

export const type: OtType<Uint8Array, BinaryOp> = {
  validate,
  normalize,
  apply,
  compose,
  transform,
};
