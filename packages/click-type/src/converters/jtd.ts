import {type Schema, t} from '@jsonjoy.com/json-type';
import {toJtdForm} from '@jsonjoy.com/json-type/lib/jtd/converter';

/** Render a JSON Type schema as a JSON Type Definition (JTD) form. Lazily imported. */
export const toJtd = (schema: unknown): string => JSON.stringify(toJtdForm(t.import(schema as Schema)), null, 2);
