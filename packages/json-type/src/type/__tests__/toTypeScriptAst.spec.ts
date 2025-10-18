import {ModuleType} from '../../type/classes/ModuleType';
import {toTypeScriptAst} from '../../typescript/converter';

describe('any', () => {
  test('can encode "any" type', () => {
    const system = new ModuleType();
    const type = system.t.any;
    expect(toTypeScriptAst(type)).toEqual({
      node: 'AnyKeyword',
    });
  });
});

describe('const', () => {
  test('can handle number const', () => {
    const system = new ModuleType();
    const type = system.t.Const<123>(123);
    expect(toTypeScriptAst(type)).toEqual({
      node: 'NumericLiteral',
      text: '123',
    });
  });

  test('can handle null', () => {
    const system = new ModuleType();
    const type = system.t.Const<null>(null);
    expect(toTypeScriptAst(type)).toEqual({
      node: 'NullKeyword',
    });
  });

  test('can handle "true"', () => {
    const system = new ModuleType();
    const type = system.t.Const<true>(true);
    expect(toTypeScriptAst(type)).toEqual({
      node: 'TrueKeyword',
    });
  });

  test('can handle "false"', () => {
    const system = new ModuleType();
    const type = system.t.Const<false>(false);
    expect(toTypeScriptAst(type)).toEqual({
      node: 'FalseKeyword',
    });
  });

  test('can handle string', () => {
    const system = new ModuleType();
    const type = system.t.Const<'asdf'>('asdf');
    expect(toTypeScriptAst(type)).toEqual({
      node: 'StringLiteral',
      text: 'asdf',
    });
  });

  test('complex objects', () => {
    const system = new ModuleType();
    const type = system.t.Const({foo: 'bar'} as const);
    expect(toTypeScriptAst(type)).toEqual({
      node: 'ObjectKeyword',
    });
  });
});

describe('bool', () => {
  test('can emit boolean AST', () => {
    const system = new ModuleType();
    const type = system.t.bool;
    expect(toTypeScriptAst(type)).toEqual({
      node: 'BooleanKeyword',
    });
  });
});

describe('num', () => {
  test('can emit number AST', () => {
    const system = new ModuleType();
    const type = system.t.num;
    expect(toTypeScriptAst(type)).toEqual({
      node: 'NumberKeyword',
    });
  });
});

describe('str', () => {
  test('can emit string AST', () => {
    const system = new ModuleType();
    const type = system.t.str;
    expect(toTypeScriptAst(type)).toEqual({
      node: 'StringKeyword',
    });
  });
});

describe('bin', () => {
  test('can emit binary AST', () => {
    const system = new ModuleType();
    const type = system.t.bin;
    expect(toTypeScriptAst(type)).toMatchInlineSnapshot(`
      {
        "id": {
          "name": "Uint8Array",
          "node": "Identifier",
        },
        "node": "GenericTypeAnnotation",
      }
    `);
  });
});

describe('arr', () => {
  test('can emit array of "any" AST', () => {
    const system = new ModuleType();
    const type = system.t.arr;
    expect(toTypeScriptAst(type)).toMatchInlineSnapshot(`
      {
        "elementType": {
          "node": "AnyKeyword",
        },
        "node": "ArrType",
      }
    `);
  });

  test('can emit array of "string" AST', () => {
    const system = new ModuleType();
    const type = system.t.Array(system.t.str);
    expect(toTypeScriptAst(type)).toMatchInlineSnapshot(`
      {
        "elementType": {
          "node": "StringKeyword",
        },
        "node": "ArrType",
      }
    `);
  });
});

describe('tup', () => {
  test('can emit tuple AST', () => {
    const system = new ModuleType();
    const {t} = system;
    const type = system.t.tuple(t.str, t.num, t.bool);
    expect(toTypeScriptAst(type)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "node": "StringKeyword",
          },
          {
            "node": "NumberKeyword",
          },
          {
            "node": "BooleanKeyword",
          },
        ],
        "node": "TupleType",
      }
    `);
  });
});

describe('obj', () => {
  test('can emit tuple AST', () => {
    const system = new ModuleType();
    const {t} = system;
    const type = system.t
      .Object(
        t.Key('id', t.str).options({
          title: 'title-x',
          description: 'description-x',
        }),
        t.KeyOpt('id', t.num),
      )
      .options({
        title: 'title',
        description: 'description',
      });
    expect(toTypeScriptAst(type)).toMatchInlineSnapshot(`
{
  "comment": "# title

description",
  "members": [
    {
      "comment": "# title-x

description-x",
      "name": "id",
      "node": "PropertySignature",
      "type": {
        "node": "StringKeyword",
      },
    },
    {
      "name": "id",
      "node": "PropertySignature",
      "optional": true,
      "type": {
        "node": "NumberKeyword",
      },
    },
  ],
  "node": "TypeLiteral",
}
`);
  });
});

describe('map', () => {
  test('can emit tuple AST', () => {
    const system = new ModuleType();
    const {t} = system;
    const type = system.t.Map(t.num).options({
      title: 'title',
      description: 'description',
    });
    expect(toTypeScriptAst(type)).toMatchInlineSnapshot(`
      {
        "node": "TypeReference",
        "typeArguments": [
          {
            "node": "StringKeyword",
          },
          {
            "node": "NumberKeyword",
          },
        ],
        "typeName": "Record",
      }
    `);
  });
});

describe('ref', () => {
  test('can emit reference AST', () => {
    const system = new ModuleType();
    const type = system.t.Ref('Foo');
    expect(toTypeScriptAst(type)).toMatchInlineSnapshot(`
      {
        "id": {
          "name": "Foo",
          "node": "Identifier",
        },
        "node": "GenericTypeAnnotation",
      }
    `);
  });
});

describe('or', () => {
  test('can emit reference AST', () => {
    const system = new ModuleType();
    const {t} = system;
    const type = system.t.Or(t.str, t.num);
    expect(toTypeScriptAst(type)).toMatchInlineSnapshot(`
      {
        "node": "UnionType",
        "types": [
          {
            "node": "StringKeyword",
          },
          {
            "node": "NumberKeyword",
          },
        ],
      }
    `);
  });
});

describe('fn', () => {
  test('can emit reference AST', () => {
    const system = new ModuleType();
    const {t} = system;
    const type = system.t.Function(t.str, t.num);
    expect(toTypeScriptAst(type)).toMatchInlineSnapshot(`
{
  "node": "FnType",
  "parameters": [
    {
      "name": {
        "name": "request",
        "node": "Identifier",
      },
      "node": "Parameter",
      "type": {
        "node": "StringKeyword",
      },
    },
  ],
  "type": {
    "node": "TypeReference",
    "typeArguments": [
      {
        "node": "NumberKeyword",
      },
    ],
    "typeName": {
      "name": "Promise",
      "node": "Identifier",
    },
  },
}
`);
  });
});

describe('fn$', () => {
  test('can emit reference AST', () => {
    const system = new ModuleType();
    const {t} = system;
    const type = system.t.Function$(t.str, t.num);
    expect(toTypeScriptAst(type)).toMatchInlineSnapshot(`
{
  "node": "FnType",
  "parameters": [
    {
      "name": {
        "name": "request$",
        "node": "Identifier",
      },
      "node": "Parameter",
      "type": {
        "node": "TypeReference",
        "typeArguments": [
          {
            "node": "StringKeyword",
          },
        ],
        "typeName": {
          "name": "Observable",
          "node": "Identifier",
        },
      },
    },
  ],
  "type": {
    "node": "TypeReference",
    "typeArguments": [
      {
        "node": "NumberKeyword",
      },
    ],
    "typeName": {
      "name": "Observable",
      "node": "Identifier",
    },
  },
}
`);
  });
});
