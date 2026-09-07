import {type Schema, t} from '@jsonjoy.com/json-type';
import {typeToJsonSchema} from '@jsonjoy.com/json-type/lib/json-schema';

/** Render a JSON Type schema as a (draft) JSON Schema. Lazily imported. */
export const toJsonSchema = (schema: unknown): string =>
  JSON.stringify(typeToJsonSchema(t.import(schema as Schema)), null, 2);
