import {SchemaBuilder} from './SchemaBuilder';
import type {TypeOf} from './schema';

export * from './common';
export * from './schema';

/**
 * JSON Type default AST builder.
 */
export const s = new SchemaBuilder();

export namespace s {
  export type infer<T> = TypeOf<T>;
}
