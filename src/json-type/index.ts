/**
 * `json-type`
 *
 * Implements types and builder for JSON Type.
 *
 * Use {@link t} builder instance to build your JSON types.
 *
 * ```ts
 * import {t} from 'json-joy/lib/json-type';
 *
 * const userType = t.Object([
 *   ['id', t.num],
 *   ['name', t.str],
 * ]);
 * ```
 *
 * Define basic types, for example, a string:
 *
 * ```ts
 * t.String(); // { __t: 'str' }
 * ```
 *
 * Define complex types:
 *
 * ```ts
 * const type = t.Object([
 *   t.Field('collection', t.Object([
 *     t.Field('id', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.Field('ts', t.num, {format: 'u64'}),
 *     t.Field('cid', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.Field('prid', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.Field('slug', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.Field('name', t.str, {isOptional: true}),
 *     t.Field('src', t.str, {isOptional: true}),
 *     t.Field('doc', t.str, {isOptional: true}),
 *     t.Field('authz', t.str, {isOptional: true}),
 *     t.Field('active', t.bool),
 *   ])),
 *   t.Field('block', t.Object([
 *     t.Field('id', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.Field('ts', t.num, {format: 'u64'}),
 *     t.Field('cid', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.Field('slug', t.String({format: 'ascii', noJsonEscape: true})),
 *   ])),
 * ]);
 * ```
 *
 * @module
 */

import {JsonTypeBuilder} from './JsonTypeBuilder';

export * from './types';

/**
 * JSON Type AST builder.
 */
export const t = new JsonTypeBuilder();
