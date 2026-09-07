import {type Schema, t} from '@jsonjoy.com/json-type';
import {toTypeScriptAst} from '@jsonjoy.com/json-type/lib/typescript/converter';
import {toText} from '@jsonjoy.com/json-type/lib/typescript/toText';

/**
 * Render a JSON Type schema as a TypeScript type. Lazily imported (pulls in a
 * good chunk of `@jsonjoy.com/json-type`), so it is only loaded when the user
 * actually triggers the action.
 */
export const toTypeScript = (schema: unknown): string => toText(toTypeScriptAst(t.import(schema as Schema)) as never);
