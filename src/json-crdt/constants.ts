import {FALSE_ID, NULL_ID, TRUE_ID, UNDEFINED_ID} from '../json-crdt-patch/constants';
import {ConstantBuiltin} from './types/const/ConstantBuiltin';

export const NULL = new ConstantBuiltin(NULL_ID, null);
export const TRUE = new ConstantBuiltin(TRUE_ID, true);
export const FALSE = new ConstantBuiltin(FALSE_ID, false);
export const UNDEFINED = new ConstantBuiltin(UNDEFINED_ID, undefined);
