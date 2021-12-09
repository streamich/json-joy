import {TNumber} from './types';

export const UINTS: TNumber['format'][] = ['u', 'u8', 'u16', 'u32', 'u64'];
export const INTS: TNumber['format'][] = ['i', 'i8', 'i16', 'i32', 'i64', ...UINTS];
