import {type Schema, t} from '@jsonjoy.com/json-type';
import {Random} from '@jsonjoy.com/json-type/lib/random/Random';

/** Generate a random JSON value conforming to the schema. Lazily imported. */
export const toSample = (schema: unknown): string => JSON.stringify(Random.gen(t.import(schema as Schema)), null, 2);
