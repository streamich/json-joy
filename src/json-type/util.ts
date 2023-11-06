import {NumberSchema} from './schema';

export const UINTS: NumberSchema['format'][] = ['u', 'u8', 'u16', 'u32', 'u64'];
export const INTS: NumberSchema['format'][] = ['i', 'i8', 'i16', 'i32', 'i64', ...UINTS];
export const FLOATS: NumberSchema['format'][] = ['f', 'f32', 'f64'];

export const uints = new Set(UINTS);
export const ints = new Set(INTS);
export const floats = new Set(FLOATS);

export const primitives = new Set<string>(['nil', 'undef', 'bool', 'num', 'str', 'bin']);
