/**
 * Mirrors `SESSION.GLOBAL` from `json-joy/lib/json-crdt-patch/enums`. Defined
 * here as a plain runtime constant because `SESSION` is a TypeScript
 * `const enum` — it has no runtime export, so bundlers that transpile without
 * full type information (e.g. ts-loader `transpileOnly: true`) cannot inline
 * `SESSION.GLOBAL`.
 */
export const SESSION_GLOBAL = 2;
