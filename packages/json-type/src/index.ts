/**
 * `json-type`
 *
 * Implements types and builder for JSON Type.
 *
 * Use {@link t} builder instance to build your JSON types.
 *
 * ```ts
 * import {t} from '@jsonjoy.com/json-type';
 *
 * const userType = t.Object(
 *   t.prop('id', t.num),
 *   t.prop('name', t.str),
 * );
 * ```
 *
 * Define basic types, for example, a string:
 *
 * ```ts
 * t.String(); // { kind: 'str' }
 * ```
 *
 * Define complex types:
 *
 * ```ts
 * const type = t.Object(
 *   t.prop('collection', t.Object(
 *     t.prop('id', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.prop('ts', t.num, {format: 'u64'}),
 *     t.prop('cid', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.prop('prid', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.prop('slug', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.prop('name', t.str, {isOptional: true}),
 *     t.prop('src', t.str, {isOptional: true}),
 *     t.prop('doc', t.str, {isOptional: true}),
 *     t.prop('authz', t.str, {isOptional: true}),
 *     t.prop('active', t.bool),
 *   )),
 *   t.prop('block', t.Object(
 *     t.prop('id', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.prop('ts', t.num, {format: 'u64'}),
 *     t.prop('cid', t.String({format: 'ascii', noJsonEscape: true})),
 *     t.prop('slug', t.String({format: 'ascii', noJsonEscape: true})),
 *   )),
 * );
 * ```
 *
 * @module
 */

export * from './constants';
export * from './schema';
export * from './type';
export * from './value';
