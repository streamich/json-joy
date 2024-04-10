import {BinaryJsonEncoder} from '@jsonjoy.com/json-pack/lib/types';

export type CompiledBinaryEncoder = (value: unknown, encoder: BinaryJsonEncoder) => void;
