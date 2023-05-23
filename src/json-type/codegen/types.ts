import {BinaryJsonEncoder} from '../../json-pack/types';

export type CompiledBinaryEncoder = (value: unknown, encoder: BinaryJsonEncoder) => void;
