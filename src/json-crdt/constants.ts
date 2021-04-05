import type {json_string} from 'ts-brand-json';
import {FALSE_ID, NULL_ID, TRUE_ID, UNDEFINED_ID} from '../json-crdt-patch/constants';
import {ConstantBuiltin} from './types/const/ConstantBuiltin';

export const NULL = new ConstantBuiltin(NULL_ID, null, '1' as json_string<unknown[]>);
export const TRUE = new ConstantBuiltin(TRUE_ID, true, '2' as json_string<unknown[]>);
export const FALSE = new ConstantBuiltin(FALSE_ID, false, '3' as json_string<unknown[]>);
export const UNDEFINED = new ConstantBuiltin(UNDEFINED_ID, undefined, '4' as json_string<unknown[]>);
