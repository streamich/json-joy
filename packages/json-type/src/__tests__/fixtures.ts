/**
 * Fixture schemas for testing random value generation.
 * These schemas represent different JSON Type configurations that can be used
 * across multiple test modules.
 */

import {RandomJson} from '@jsonjoy.com/json-random';
import {genRandomExample} from '@jsonjoy.com/json-random/lib/examples';
import {s} from '../schema';
import {ModuleType} from '../type/classes/ModuleType';
import type {Type} from '../type';

const mod = new ModuleType();
export const t = mod.t;

export const randomJson = () => {
  return Math.random() < 0.5 ? genRandomExample() : RandomJson.generate();
};

/**
 * Basic primitive type schemas
 */
export const primitiveSchemas = {
  string: s.String(),
  stringWithMinMax: s.String({min: 5, max: 10}),
  number: s.Number(),
  numberWithFormat: s.Number({format: 'u32'}),
  numberWithRange: s.Number({gte: 0, lte: 100}),
  boolean: s.Boolean(),
  const: s.Const('fixed-value' as const),
  any: s.Any(),
} as const;

/**
 * Complex composite type schemas
 */
export const compositeSchemas = {
  simpleArray: s.Array(s.String()),
  arrayWithBounds: s.Array(s.Number(), {min: 2, max: 5}),
  simpleObject: s.Object([s.Key('id', s.String()), s.Key('name', s.String()), s.Key('active', s.Boolean())]),
  objectWithOptionalFields: s.Object([
    s.Key('id', s.String()),
    s.KeyOpt('name', s.String()),
    s.KeyOpt('count', s.Number()),
  ]),
  nestedObject: s.Object([
    s.Key(
      'user',
      s.Object([
        s.Key('id', s.Number()),
        s.Key('profile', s.Object([s.Key('name', s.String()), s.Key('email', s.String())])),
      ]),
    ),
    s.Key('tags', s.Array(s.String())),
  ]),
  tuple: s.Tuple([s.String(), s.Number(), s.Boolean()]),
  map: s.Map(s.String()),
  mapWithComplexValue: s.Map(s.Object([s.Key('value', s.Number()), s.Key('label', s.String())])),
  union: s.Or(s.String(), s.Number(), s.Boolean()),
  complexUnion: s.Or(
    s.String(),
    s.Object([s.Key('type', s.Const('object' as const)), s.Key('data', s.Any())]),
    s.Array(s.Number()),
  ),
  binary: s.bin,
  doubleMap: s.Map(s.Map(s.str)),
  nestedMaps: s.Map(s.Map(s.Map(s.nil))),
  nestedArrays: s.Array(s.Array(s.Array(s.str))),
} as const;

/**
 * All fixture schemas combined for comprehensive testing
 */
export const allSchemas = {
  ...primitiveSchemas,
  ...compositeSchemas,
} as const;

/**
 * Schema categories for organized testing
 */
export const schemaCategories = {
  primitives: primitiveSchemas,
  composites: compositeSchemas,
  all: allSchemas,
} as const;

const primitivesModule = new ModuleType();
export const primitiveTypes = Object.entries(primitiveSchemas).reduce(
  (acc, [key, schema]) => {
    acc[key] = primitivesModule.t.import(schema);
    return acc;
  },
  {} as Record<string, Type>,
);

const compositesModule = new ModuleType();
export const compositeTypes = Object.entries(compositeSchemas).reduce(
  (acc, [key, schema]) => {
    acc[key] = compositesModule.t.import(schema);
    return acc;
  },
  {} as Record<string, Type>,
);

/**
 * User profile schema with nested objects and optional fields
 */
export const User = t
  .object({
    id: t.str,
    name: t.object({
      first: t.str,
      last: t.str,
    }),
    email: t.String({format: 'ascii'}),
    age: t.Number({gte: 0, lte: 150}),
    verified: t.bool,
  })
  .opt('avatar', t.String({format: 'ascii'}))
  .alias('User').type;

/**
 * Product catalog schema with arrays and formatted numbers
 */
export const Product = t.Object(
  t.Key('id', t.String({format: 'ascii'})),
  t.Key('name', t.String({min: 1, max: 100})),
  t.Key('price', t.Number({format: 'f64', gte: 0})),
  t.Key('inStock', t.bool),
  t.Key('categories', t.Array(t.str, {min: 1})),
  t.Key('tags', t.Array(t.str)),
  t.KeyOpt('description', t.String({max: 1000})),
  t.KeyOpt('discount', t.Number({gte: 0, lte: 1})),
);

/**
 * Blog post schema with timestamps and rich content
 */
export const BlogPost = t.Object(
  t.Key('id', t.str),
  t.Key('title', t.String({min: 1, max: 200})),
  t.Key('content', t.str),
  t.Key('author', t.Ref<typeof User>('User')),
  t.Key('publishedAt', t.Number({format: 'u64'})),
  t.Key('status', t.enum('draft', 'published', 'archived')),
  t.KeyOpt('updatedAt', t.Number({format: 'u64'})),
  t.KeyOpt('tags', t.Array(t.str)),
);

/**
 * API response schema with discriminated unions
 */
export const ApiResponse = t.Or(
  t.object({
    success: t.Const(true),
    data: t.any,
    timestamp: t.Number({format: 'u64'}),
  }),
  t.object({
    success: t.Const(false),
    error: t.object({
      code: t.String({format: 'ascii'}),
      message: t.str,
    }),
    timestamp: t.Number({format: 'u64'}),
  }),
);

/**
 * File metadata schema with binary data
 */
export const FileMetadata = t.Object(
  t.Key('name', t.str),
  t.Key('size', t.Number({format: 'u64', gte: 0})),
  t.Key('mimeType', t.str),
  t.Key('data', t.Binary(t.any)),
  t.Key('checksum', t.String({format: 'ascii', min: 64, max: 64})),
  t.Key('uploadedAt', t.Number({format: 'u64'})),
  t.KeyOpt('metadata', t.Map(t.str)),
);

/**
 * Configuration schema with maps and default values
 */
export const Configuration = t.Object(
  t.Key('environment', t.enum('development', 'staging', 'production')),
  t.Key(
    'database',
    t.object({
      host: t.str,
      port: t.Number({format: 'u16', gte: 1, lte: 65535}),
      name: t.str,
    }),
  ),
  t.Key('features', t.Map(t.bool)),
  t.Key('secrets', t.Map(t.str)),
  t.KeyOpt(
    'logging',
    t.object({
      level: t.enum('debug', 'info', 'warn', 'error'),
      output: t.str,
    }),
  ),
);

/**
 * Event data schema with tuples and coordinates
 */
export const Event = t
  .Object(
    t.Key('id', t.String({format: 'ascii'})),
    t.Key('type', t.enum('click', 'view', 'purchase', 'signup')),
    t.Key('timestamp', t.Number({format: 'u64'})),
    t.Key('userId', t.maybe(t.str)),
    t.Key('location', t.Tuple([t.Number({format: 'f64'}), t.Number({format: 'f64'})])),
    t.Key('metadata', t.Map(t.Or(t.str, t.num, t.bool))),
    t.KeyOpt('sessionId', t.str),
  )
  .alias('Event').type;

/**
 * Contact information schema with formatted strings
 */
export const ContactInfo = t.Object(
  t.Key(
    'name',
    t.object({
      first: t.String({min: 1}),
      last: t.String({min: 1}),
    }),
  ),
  t.Key('emails', t.Array(t.String({format: 'ascii'}), {min: 1})),
  t.Key('phones', t.Array(t.tuple(t.enum('home', 'work', 'mobile'), t.str))),
  t.KeyOpt(
    'address',
    t.object({
      street: t.str,
      city: t.str,
      country: t.String({format: 'ascii', min: 2, max: 2}),
      postalCode: t.str,
    }),
  ),
  t.KeyOpt('socialMedia', t.Map(t.String({format: 'ascii'}))),
);

/**
 * Database record schema with references
 */
export const DatabaseRecord = t.Object(
  t.Key('id', t.String({format: 'ascii'})),
  t.Key('createdAt', t.Number({format: 'u64'})),
  t.Key('updatedAt', t.Number({format: 'u64'})),
  t.Key('version', t.Number({format: 'u32', gte: 1})),
  t.Key('createdBy', t.Ref<typeof User>('User')),
  t.KeyOpt('updatedBy', t.Ref<typeof User>('User')),
  t.KeyOpt('deletedAt', t.Number({format: 'u64'})),
);

/**
 * Function type schema
 */
export const UserValidator = t.Function(
  t.object({
    userData: t.any,
    strict: t.bool,
  }),
  t.object({
    valid: t.bool,
    errors: t.Array(t.str),
  }),
  {title: 'User Validation Function'},
);

/**
 * Streaming API schema
 */
export const EventStream = t.Function$(
  t.object({
    filter: t.maybe(t.str),
    limit: t.maybe(t.Number({format: 'u32'})),
  }),
  t.Ref<typeof Event>('Event'),
  {title: 'Event Streaming Function'},
);

/**
 * Complex nested schema
 */
export const ComplexNested = t.Object(
  t.Key(
    'data',
    t.Map(
      t.Or(
        t.str,
        t.num,
        t.Array(
          t.Map(
            t.object({
              key: t.str,
              value: t.Or(t.str, t.num, t.bool, t.nil),
              nested: t.maybe(t.Map(t.any)),
            }),
          ),
        ),
      ),
    ),
  ),
  t.Key(
    'metadata',
    t.object({
      version: t.str,
      schema: t.String({format: 'ascii'}),
      checksum: t.String({format: 'ascii'}),
    }),
  ),
);

export const allSerializableTypes = {
  ...primitiveTypes,
  ...compositeTypes,
  User,
  Product,
  BlogPost,
  ApiResponse,
  FileMetadata,
  Configuration,
  Event,
  ContactInfo,
  DatabaseRecord,
  ComplexNested,
} as const;
