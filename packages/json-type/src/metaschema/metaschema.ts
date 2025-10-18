import type {ConSchema, ModuleSchema, ObjSchema, OrSchema, RefSchema} from '../schema';

export const module: ModuleSchema = {
  kind: 'module',
  keys: [
    {
      kind: 'key',
      key: 'Display',
      value: {
        kind: 'obj',
        title: 'Display options for JSON Type',
        description: 'These options are used to display the type in documentation or code generation.',
        keys: [
          {kind: 'key', key: 'title', optional: true, value: {kind: 'str'}},
          {kind: 'key', key: 'intro', optional: true, value: {kind: 'str'}},
          {kind: 'key', key: 'description', optional: true, value: {kind: 'str'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'SchemaExample',
      value: {
        kind: 'obj',
        extends: ['Display'],
        keys: [{kind: 'key', key: 'value', value: {kind: 'any'}}],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'SchemaBase',
      value: {
        kind: 'obj',
        extends: ['Display'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'str'}},
          {kind: 'key', key: 'meta', optional: true, value: {kind: 'map', value: {kind: 'any'}}},
          {kind: 'key', key: 'default', optional: true, value: {kind: 'any'}},
          {
            kind: 'key',
            key: 'examples',
            optional: true,
            value: {kind: 'arr', type: {kind: 'ref', ref: 'SchemaExample'}},
          },
          {
            kind: 'key',
            key: 'deprecated',
            optional: true,
            value: {
              kind: 'obj',
              keys: [{kind: 'key', key: 'info', optional: true, value: {kind: 'str'}}],
            },
          },
          {kind: 'key', key: 'metadata', optional: true, value: {kind: 'map', value: {kind: 'any'}}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'AnySchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [{kind: 'key', key: 'kind', value: {kind: 'con', value: 'any'} as ConSchema<'any'>}],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'ConSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'con'} as ConSchema<'con'>},
          {kind: 'key', key: 'value', value: {kind: 'any'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'BoolSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [{kind: 'key', key: 'kind', value: {kind: 'con', value: 'bool'} as ConSchema<'bool'>}],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'NumSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'num'} as ConSchema<'num'>},
          {
            kind: 'key',
            key: 'format',
            optional: true,
            value: {
              kind: 'or',
              discriminator: ['num', -1],
              types: [
                {kind: 'con', value: 'i'} as ConSchema<'i'>,
                {kind: 'con', value: 'u'} as ConSchema<'u'>,
                {kind: 'con', value: 'f'} as ConSchema<'f'>,
                {kind: 'con', value: 'i8'} as ConSchema<'i8'>,
                {kind: 'con', value: 'i16'} as ConSchema<'i16'>,
                {kind: 'con', value: 'i32'} as ConSchema<'i32'>,
                {kind: 'con', value: 'i64'} as ConSchema<'i64'>,
                {kind: 'con', value: 'u8'} as ConSchema<'u8'>,
                {kind: 'con', value: 'u16'} as ConSchema<'u16'>,
                {kind: 'con', value: 'u32'} as ConSchema<'u32'>,
                {kind: 'con', value: 'u64'} as ConSchema<'u64'>,
                {kind: 'con', value: 'f32'} as ConSchema<'f32'>,
                {kind: 'con', value: 'f64'} as ConSchema<'f64'>,
              ],
            },
          },
          {kind: 'key', key: 'gt', optional: true, value: {kind: 'num'}},
          {kind: 'key', key: 'gte', optional: true, value: {kind: 'num'}},
          {kind: 'key', key: 'lt', optional: true, value: {kind: 'num'}},
          {kind: 'key', key: 'lte', optional: true, value: {kind: 'num'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'StrSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'str'} as ConSchema<'str'>},
          {
            kind: 'key',
            key: 'format',
            optional: true,
            value: {
              kind: 'or',
              discriminator: ['num', -1],
              types: [
                {kind: 'con', value: 'ascii'} as ConSchema<'ascii'>,
                {kind: 'con', value: 'utf8'} as ConSchema<'utf8'>,
              ],
            },
          },
          {kind: 'key', key: 'ascii', optional: true, value: {kind: 'bool'}},
          {kind: 'key', key: 'noJsonEscape', optional: true, value: {kind: 'bool'}},
          {kind: 'key', key: 'min', optional: true, value: {kind: 'num'}},
          {kind: 'key', key: 'max', optional: true, value: {kind: 'num'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'BinSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'bin'} as ConSchema<'bin'>},
          {kind: 'key', key: 'type', value: {kind: 'ref', ref: 'Schema'}},
          {
            kind: 'key',
            key: 'format',
            optional: true,
            value: {
              kind: 'or',
              discriminator: ['num', -1],
              types: [
                {kind: 'con', value: 'json'} as ConSchema<'json'>,
                {kind: 'con', value: 'cbor'} as ConSchema<'cbor'>,
                {kind: 'con', value: 'msgpack'} as ConSchema<'msgpack'>,
                {kind: 'con', value: 'resp3'} as ConSchema<'resp3'>,
                {kind: 'con', value: 'ion'} as ConSchema<'ion'>,
                {kind: 'con', value: 'bson'} as ConSchema<'bson'>,
                {kind: 'con', value: 'ubjson'} as ConSchema<'ubjson'>,
                {kind: 'con', value: 'bencode'} as ConSchema<'bencode'>,
              ],
            },
          },
          {kind: 'key', key: 'min', optional: true, value: {kind: 'num'}},
          {kind: 'key', key: 'max', optional: true, value: {kind: 'num'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'ArrSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'arr'} as ConSchema<'arr'>},
          {kind: 'key', key: 'type', optional: true, value: {kind: 'ref', ref: 'Schema'}},
          {kind: 'key', key: 'head', optional: true, value: {kind: 'arr', type: {kind: 'ref', ref: 'Schema'}}},
          {kind: 'key', key: 'tail', optional: true, value: {kind: 'arr', type: {kind: 'ref', ref: 'Schema'}}},
          {kind: 'key', key: 'min', optional: true, value: {kind: 'num'}},
          {kind: 'key', key: 'max', optional: true, value: {kind: 'num'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'KeySchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase', 'Display'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'key'} as ConSchema<'key'>},
          {kind: 'key', key: 'key', value: {kind: 'str'}},
          {kind: 'key', key: 'value', value: {kind: 'ref', ref: 'Schema'}},
          {kind: 'key', key: 'optional', optional: true, value: {kind: 'bool'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'ObjSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'obj'} as ConSchema<'obj'>},
          {kind: 'key', key: 'keys', value: {kind: 'arr', type: {kind: 'ref', ref: 'KeySchema'}}},
          {kind: 'key', key: 'extends', optional: true, value: {kind: 'arr', type: {kind: 'str'}}},
          {kind: 'key', key: 'decodeUnknownKeys', optional: true, value: {kind: 'bool'}},
          {kind: 'key', key: 'encodeUnknownKeys', optional: true, value: {kind: 'bool'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'MapSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'map'} as ConSchema<'map'>},
          {kind: 'key', key: 'key', optional: true, value: {kind: 'ref', ref: 'Schema'}},
          {kind: 'key', key: 'value', value: {kind: 'ref', ref: 'Schema'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'RefSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'ref'} as ConSchema<'ref'>},
          {kind: 'key', key: 'ref', value: {kind: 'str'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'OrSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'or'} as ConSchema<'or'>},
          {kind: 'key', key: 'types', value: {kind: 'arr', type: {kind: 'ref', ref: 'Schema'}}},
          {kind: 'key', key: 'discriminator', value: {kind: 'any'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'FnSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'fn'} as ConSchema<'fn'>},
          {kind: 'key', key: 'req', value: {kind: 'ref', ref: 'Schema'}},
          {kind: 'key', key: 'res', value: {kind: 'ref', ref: 'Schema'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'FnRxSchema',
      value: {
        kind: 'obj',
        extends: ['SchemaBase'],
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'fn$'} as ConSchema<'fn$'>},
          {kind: 'key', key: 'req', value: {kind: 'ref', ref: 'Schema'}},
          {kind: 'key', key: 'res', value: {kind: 'ref', ref: 'Schema'}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'AliasSchema',
      value: {
        kind: 'obj',
        extends: ['KeySchema'],
        keys: [{kind: 'key', key: 'pub', optional: true, value: {kind: 'bool'}}],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'ModuleSchema',
      value: {
        kind: 'obj',
        keys: [
          {kind: 'key', key: 'kind', value: {kind: 'con', value: 'module'} as ConSchema<'module'>},
          {kind: 'key', key: 'keys', value: {kind: 'arr', type: {kind: 'ref', ref: 'AliasSchema'}}},
        ],
      } as ObjSchema,
    },
    {
      kind: 'key',
      key: 'JsonSchema',
      value: {
        kind: 'or',
        discriminator: ['num', -1],
        types: [
          {kind: 'ref', ref: 'BoolSchema'} as RefSchema,
          {kind: 'ref', ref: 'NumSchema'} as RefSchema,
          {kind: 'ref', ref: 'StrSchema'} as RefSchema,
          {kind: 'ref', ref: 'BinSchema'} as RefSchema,
          {kind: 'ref', ref: 'ArrSchema'} as RefSchema,
          {kind: 'ref', ref: 'ConSchema'} as RefSchema,
          {kind: 'ref', ref: 'ObjSchema'} as RefSchema,
          {kind: 'ref', ref: 'KeySchema'} as RefSchema,
          {kind: 'ref', ref: 'MapSchema'} as RefSchema,
        ],
      } as OrSchema,
    },
    {
      kind: 'key',
      key: 'Schema',
      value: {
        kind: 'or',
        discriminator: ['num', -1],
        types: [
          {kind: 'ref', ref: 'JsonSchema'} as RefSchema,
          {kind: 'ref', ref: 'RefSchema'} as RefSchema,
          {kind: 'ref', ref: 'OrSchema'} as RefSchema,
          {kind: 'ref', ref: 'AnySchema'} as RefSchema,
          {kind: 'ref', ref: 'FnSchema'} as RefSchema,
          {kind: 'ref', ref: 'FnRxSchema'} as RefSchema,
        ],
      } as OrSchema,
    },
  ],
};
