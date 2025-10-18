import type {BinaryJsonEncoder} from '@jsonjoy.com/json-pack/lib/types';

export type CompiledBinaryEncoder = (value: unknown, encoder: BinaryJsonEncoder) => void;

export type SchemaPath = Array<string | number | {r: string}>;
