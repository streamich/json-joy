import type {json_string} from 'ts-brand-json';
import type {JsonTypeValidatorError} from './codegen';

export type JsonTypeValidator = (value: unknown) => unknown;

/**
 * @todo
 *
 * Would be great if we could statically deduce json-type schema to
 * a TypeScript type. And then the validator could make use of TypeScript's
 * is operator.
 *
 * ```ts
 * export type BooleanValidator = (value: unknown) =>
 *  value is Static<typeof schema>;
 * ```
 */

export type BooleanValidator = (value: unknown) => boolean;

export type StringValidatorSuccess = '';
export type StringValidatorError = [code: string, message: string];
export type StringValidator = (value: unknown) => json_string<StringValidatorSuccess | StringValidatorError>;

export type ObjectValidatorSuccess = null;
export interface ObjectValidatorError {
  code: string;
  errno: JsonTypeValidatorError;
  message: string;
  path: Array<string | number>;
}
export type ObjectValidator = (value: unknown) => ObjectValidatorSuccess | ObjectValidatorError;
