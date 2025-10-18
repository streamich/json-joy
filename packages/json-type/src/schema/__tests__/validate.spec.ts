import type {Schema, SchemaBase, SchemaExample} from '../schema';
import {validateSchema, validateTType} from '../validate';

describe('validate display', () => {
  test('validates valid display', () => {
    expect(() => validateSchema({kind: 'any'})).not.toThrow();
    expect(() => validateSchema({kind: 'any', title: 'Test'})).not.toThrow();
    expect(() => validateSchema({kind: 'any', description: 'Test description'})).not.toThrow();
    expect(() => validateSchema({kind: 'any', intro: 'Test intro'})).not.toThrow();
    expect(() =>
      validateSchema({
        kind: 'any',
        title: 'Test',
        description: 'Test description',
        intro: 'Test intro',
      }),
    ).not.toThrow();
  });

  test('throws for invalid title', () => {
    expect(() => validateSchema({kind: 'any', title: 123} as any)).toThrow('INVALID_TITLE');
    expect(() => validateSchema({kind: 'any', title: null} as any)).toThrow('INVALID_TITLE');
    expect(() => validateSchema({kind: 'any', title: {}} as any)).toThrow('INVALID_TITLE');
  });

  test('throws for invalid description', () => {
    expect(() => validateSchema({kind: 'any', description: 123} as any)).toThrow('INVALID_DESCRIPTION');
    expect(() => validateSchema({kind: 'any', description: null} as any)).toThrow('INVALID_DESCRIPTION');
    expect(() => validateSchema({kind: 'any', description: []} as any)).toThrow('INVALID_DESCRIPTION');
  });

  test('throws for invalid intro', () => {
    expect(() => validateSchema({kind: 'any', intro: 123} as any)).toThrow('INVALID_INTRO');
    expect(() => validateSchema({kind: 'any', intro: null} as any)).toThrow('INVALID_INTRO');
    expect(() => validateSchema({kind: 'any', intro: false} as any)).toThrow('INVALID_INTRO');
  });
});

describe('validate examples', () => {
  test('validates valid example', () => {
    const example: SchemaExample = {value: 'test'};
    expect(() => validateSchema({kind: 'any', examples: [example]})).not.toThrow();
  });

  test('validates example with display properties', () => {
    const example: SchemaExample = {
      value: 'test',
      title: 'Example',
      description: 'Test example',
    };
    expect(() => validateSchema({kind: 'any', examples: [example]})).not.toThrow();
  });

  test('throws for invalid display properties', () => {
    expect(() => validateSchema({kind: 'any', examples: [{title: 123}]} as any)).toThrow('INVALID_TITLE');
  });
});

describe('validateTType()', () => {
  test('validates valid TType', () => {
    const ttype: SchemaBase = {kind: 'str'};
    expect(() => validateTType(ttype, 'str')).not.toThrow();
  });

  test('validates TType with examples', () => {
    const ttype: SchemaBase = {
      kind: 'str',
      examples: [
        {value: 'test1', title: 'Example 1'},
        {value: 'test2', description: 'Example 2'},
      ],
    };
    expect(() => validateTType(ttype, 'str')).not.toThrow();
  });

  test('throws for invalid kind', () => {
    const ttype: SchemaBase = {kind: 'str'};
    expect(() => validateTType(ttype, 'num')).toThrow('INVALID_TYPE');
  });

  test('throws for invalid examples', () => {
    expect(() => validateTType({kind: 'str', examples: 'not-array'} as any, 'str')).toThrow('INVALID_EXAMPLES');
    expect(() => validateTType({kind: 'str', examples: [{value: 'test', title: 123}]} as any, 'str')).toThrow(
      'INVALID_TITLE',
    );
  });

  test('validates display properties', () => {
    expect(() => validateTType({kind: 'str', title: 123} as any, 'str')).toThrow('INVALID_TITLE');
  });
});

describe('validateSchema', () => {
  describe('any schema', () => {
    test('validates valid any schema', () => {
      const schema: Schema = {kind: 'any'};
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('validates any schema with metadata', () => {
      const schema: Schema = {
        kind: 'any',
        metadata: {custom: 'value'},
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });
  });

  describe('boolean schema', () => {
    test('validates valid boolean schema', () => {
      const schema: Schema = {kind: 'bool'};
      expect(() => validateSchema(schema)).not.toThrow();
    });
  });

  describe('number schema', () => {
    test('validates valid number schema', () => {
      const schema: Schema = {kind: 'num'};
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('validates number schema with constraints', () => {
      const schema: Schema = {
        kind: 'num',
        gt: 0,
        lt: 100,
        format: 'i32',
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('validates number schema with gte/lte', () => {
      const schema: Schema = {
        kind: 'num',
        gte: 0,
        lte: 100,
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('throws for invalid constraint types', () => {
      expect(() => validateSchema({kind: 'num', gt: '5'} as any)).toThrow('GT_TYPE');
      expect(() => validateSchema({kind: 'num', gte: null} as any)).toThrow('GTE_TYPE');
      expect(() => validateSchema({kind: 'num', lt: {}} as any)).toThrow('LT_TYPE');
      expect(() => validateSchema({kind: 'num', lte: []} as any)).toThrow('LTE_TYPE');
    });

    test('throws for conflicting constraints', () => {
      expect(() => validateSchema({kind: 'num', gt: 5, gte: 3} as any)).toThrow('GT_GTE');
      expect(() => validateSchema({kind: 'num', lt: 10, lte: 15} as any)).toThrow('LT_LTE');
    });

    test('throws for invalid range', () => {
      expect(() => validateSchema({kind: 'num', gt: 10, lt: 5} as any)).toThrow('GT_LT');
      expect(() => validateSchema({kind: 'num', gte: 10, lte: 5} as any)).toThrow('GT_LT');
    });

    test('validates all number formats', () => {
      const formats = ['i', 'u', 'f', 'i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64', 'f32', 'f64'] as const;
      for (const format of formats) {
        expect(() => validateSchema({kind: 'num', format})).not.toThrow();
      }
    });

    test('throws for invalid format', () => {
      expect(() => validateSchema({kind: 'num', format: 'invalid'} as any)).toThrow('FORMAT_INVALID');
      expect(() => validateSchema({kind: 'num', format: ''} as any)).toThrow('FORMAT_EMPTY');
      expect(() => validateSchema({kind: 'num', format: 123} as any)).toThrow('FORMAT_TYPE');
    });
  });

  describe('string schema', () => {
    test('validates valid string schema', () => {
      const schema: Schema = {kind: 'str'};
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('validates string schema with constraints', () => {
      const schema: Schema = {
        kind: 'str',
        min: 1,
        max: 100,
        format: 'ascii',
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('validates string formats', () => {
      expect(() => validateSchema({kind: 'str', format: 'ascii'})).not.toThrow();
      expect(() => validateSchema({kind: 'str', format: 'utf8'})).not.toThrow();
    });

    test('throws for invalid string format', () => {
      expect(() => validateSchema({kind: 'str', format: 'invalid'} as any)).toThrow('INVALID_STRING_FORMAT');
    });

    test('validates ascii property', () => {
      expect(() => validateSchema({kind: 'str', ascii: true})).not.toThrow();
      expect(() => validateSchema({kind: 'str', ascii: false})).not.toThrow();
    });

    test('throws for invalid ascii type', () => {
      expect(() => validateSchema({kind: 'str', ascii: 'true'} as any)).toThrow('ASCII');
    });

    test('validates noJsonEscape property', () => {
      expect(() => validateSchema({kind: 'str', noJsonEscape: true})).not.toThrow();
      expect(() => validateSchema({kind: 'str', noJsonEscape: false})).not.toThrow();
    });

    test('throws for invalid noJsonEscape type', () => {
      expect(() => validateSchema({kind: 'str', noJsonEscape: 'true'} as any)).toThrow('NO_JSON_ESCAPE_TYPE');
    });

    test('throws for format/ascii mismatch', () => {
      expect(() => validateSchema({kind: 'str', format: 'ascii', ascii: false} as any)).toThrow(
        'FORMAT_ASCII_MISMATCH',
      );
    });
  });

  describe('binary schema', () => {
    test('validates valid binary schema', () => {
      const schema: Schema = {
        kind: 'bin',
        type: {kind: 'str'},
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('validates binary schema with format', () => {
      const formats = ['json', 'cbor', 'msgpack', 'resp3', 'ion', 'bson', 'ubjson', 'bencode'] as const;
      for (const format of formats) {
        const schema: Schema = {
          kind: 'bin',
          type: {kind: 'str'},
          format,
        };
        expect(() => validateSchema(schema)).not.toThrow();
      }
    });

    test('throws for invalid format', () => {
      expect(() =>
        validateSchema({
          kind: 'bin',
          value: {kind: 'str'},
          format: 'invalid',
        } as any),
      ).toThrow('FORMAT');
    });
  });

  describe('"arr" schema', () => {
    test('validates valid array schema', () => {
      const schema: Schema = {
        kind: 'arr',
        type: {kind: 'str'},
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('validates valid array with head only', () => {
      const schema: Schema = {
        kind: 'arr',
        head: [{kind: 'str'}, {kind: 'num'}],
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('throws on invalid head type', () => {
      const schema: Schema = {
        kind: 'arr',
        head: [{kind: 'str'}, {kind2: 'num'} as any],
      };
      expect(() => validateSchema(schema)).toThrow();
    });

    test('validates valid array with tail only', () => {
      const schema: Schema = {
        kind: 'arr',
        head: [{kind: 'str'}, {kind: 'num'}],
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('throws on invalid tail type', () => {
      const schema: Schema = {
        kind: 'arr',
        tail: [{kind: 'str'}, {kind2: 'num'} as any],
      };
      expect(() => validateSchema(schema)).toThrow();
    });

    test('validates valid array with head, tail, and spread type', () => {
      const schema: Schema = {
        kind: 'arr',
        head: [{kind: 'str'}, {kind: 'num'}],
        type: {kind: 'bool'},
        tail: [{kind: 'str'}, {kind: 'num'}],
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('full schema, throws on invalid type', () => {
      const schema: Schema = {
        kind: 'arr',
        head: [{kind: 'str'}, {kind: 'num'}],
        type: {kind: 'bool2' as any},
        tail: [{kind: 'str'}, {kind: 'num'}],
      };
      expect(() => validateSchema(schema)).toThrow();
    });

    test('full schema, throws on invalid head', () => {
      const schema: Schema = {
        kind: 'arr',
        head: [{kind: 'str_' as any}, {kind: 'num'}],
        type: {kind: 'bool'},
        tail: [{kind: 'str'}, {kind: 'num'}],
      };
      expect(() => validateSchema(schema)).toThrow();
    });

    test('full schema, throws on invalid tail', () => {
      const schema: Schema = {
        kind: 'arr',
        head: [{kind: 'str'}, {kind: 'num'}],
        type: {kind: 'bool'},
        tail: [{kind: 'str_' as any}, {kind: 'num'}],
      };
      expect(() => validateSchema(schema)).toThrow();
    });

    test('validates array schema with constraints', () => {
      const schema: Schema = {
        kind: 'arr',
        type: {kind: 'num'},
        min: 1,
        max: 10,
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('throws if neither head, type, nor tail set', () => {
      const schema: Schema = {
        kind: 'arr',
        min: 1,
        max: 10,
      };
      expect(() => validateSchema(schema)).toThrow();
    });

    test('validates valid tuple schema', () => {
      const schema: Schema = {
        kind: 'arr',
        head: [{kind: 'str'}, {kind: 'num'}],
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('throws for invalid type property', () => {
      expect(() => validateSchema({kind: 'arr', type: 'not-array'} as any)).toThrow('INVALID_SCHEMA');
    });
  });

  describe('"con" schema', () => {
    test('validates valid const schema', () => {
      const schema: Schema = {kind: 'con', value: 'test'};
      expect(() => validateSchema(schema)).not.toThrow();
    });
  });

  describe('"obj" schema', () => {
    test('validates valid object schema', () => {
      const schema: Schema = {
        kind: 'obj',
        keys: [
          {
            kind: 'key',
            key: 'name',
            value: {kind: 'str'},
          },
        ],
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('validates object schema with unknownFields', () => {
      const schema: Schema = {
        kind: 'obj',
        keys: [],
        decodeUnknownKeys: true,
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('throws for invalid keys type', () => {
      expect(() => validateSchema({kind: 'obj', keys: 'not-array'} as any)).toThrow('KEYS_TYPE');
    });

    test('throws for invalid unknownFields type', () => {
      expect(() => validateSchema({kind: 'obj', keys: [], decodeUnknownKeys: 'true'} as any)).toThrow(
        'UNKNOWN_KEYS_TYPE',
      );
    });
  });

  describe('field schema', () => {
    test('validates valid field schema', () => {
      const schema: Schema = {
        kind: 'key',
        key: 'test',
        value: {kind: 'str'},
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('validates optional field schema', () => {
      const schema: Schema = {
        kind: 'key',
        key: 'test',
        value: {kind: 'str'},
        optional: true,
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('throws for invalid key type', () => {
      expect(() =>
        validateSchema({
          kind: 'key',
          key: 123,
          value: {kind: 'str'},
        } as any),
      ).toThrow('KEY_TYPE');
    });

    test('throws for invalid optional type', () => {
      expect(() =>
        validateSchema({
          kind: 'key',
          key: 'test',
          value: {kind: 'str'},
          optional: 'true',
        } as any),
      ).toThrow('OPTIONAL_TYPE');
    });
  });

  describe('map schema', () => {
    test('validates valid map schema', () => {
      const schema: Schema = {
        kind: 'map',
        value: {kind: 'str'},
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });
  });

  describe('ref schema', () => {
    test('validates valid ref schema', () => {
      const schema: Schema = {
        kind: 'ref',
        ref: 'TestType' as any,
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('throws for invalid ref type', () => {
      expect(() => validateSchema({kind: 'ref', ref: 123} as any)).toThrow('REF_TYPE');
    });

    test('throws for empty ref', () => {
      expect(() => validateSchema({kind: 'ref', ref: ''} as any)).toThrow('REF_EMPTY');
    });
  });

  describe('or schema', () => {
    test('validates valid or schema', () => {
      const schema: Schema = {
        kind: 'or',
        types: [{kind: 'str'}, {kind: 'num'}],
        discriminator: ['str', 0],
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });

    test('throws for invalid discriminator', () => {
      expect(() =>
        validateSchema({
          kind: 'or',
          types: [{kind: 'str'}],
          discriminator: null,
        } as any),
      ).toThrow('DISCRIMINATOR');
    });

    test('throws for invalid types', () => {
      expect(() =>
        validateSchema({
          kind: 'or',
          types: 'not-array',
          discriminator: ['str', 0],
        } as any),
      ).toThrow('TYPES_TYPE');
    });

    test('throws for empty types', () => {
      expect(() =>
        validateSchema({
          kind: 'or',
          types: [],
          discriminator: ['str', 0],
        } as any),
      ).toThrow('TYPES_LENGTH');
    });
  });

  describe('function schema', () => {
    test('validates valid function schema', () => {
      const schema: Schema = {
        kind: 'fn',
        req: {kind: 'str'},
        res: {kind: 'num'},
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });
  });

  describe('streaming function schema', () => {
    test('validates valid streaming function schema', () => {
      const schema: Schema = {
        kind: 'fn$',
        req: {kind: 'str'},
        res: {kind: 'num'},
      };
      expect(() => validateSchema(schema)).not.toThrow();
    });
  });

  describe('unknown schema kind', () => {
    test('throws for unknown schema kind', () => {
      expect(() => validateSchema({kind: 'unknown'} as any)).toThrow('Unknown schema kind: unknown');
    });
  });
});
