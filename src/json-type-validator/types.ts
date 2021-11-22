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

/** A custom user provided validator. */
export interface CustomValidator {
  /** Name of the validator. */
  name: string;

  /** Acceptable input value types for this validator. */
  types: CustomValidatorType[];

  /**
   * Receives the value that needs to be validated, returns a truthy value representing an error
   * or throws an error when validation fails. When validation succeeds, returns a falsy value.
   */
   fn: (value: any) => unknown;
};

/** Node types that custom validators are allowed to accept. */
export type CustomValidatorType = 'string' | 'number' | 'array' | 'object' | 'bin' | 'any';
