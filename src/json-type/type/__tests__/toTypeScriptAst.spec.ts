import {TypeSystem} from '../../system';

describe('any', () => {
  test('can encode "any" type', () => {
    const system = new TypeSystem();
    const type = system.t.any;
    expect(type.toTypeScriptAst()).toEqual({
      node: 'AnyKeyword',
    });
  });
});

describe('const', () => {
  test('can handle number const', () => {
    const system = new TypeSystem();
    const type = system.t.Const<123>(123);
    expect(type.toTypeScriptAst()).toEqual({
      node: 'NumericLiteral',
      text: '123',
    });
  });

  test('can handle null', () => {
    const system = new TypeSystem();
    const type = system.t.Const<null>(null);
    expect(type.toTypeScriptAst()).toEqual({
      node: 'NullKeyword',
    });
  });

  test('can handle "true"', () => {
    const system = new TypeSystem();
    const type = system.t.Const<true>(true);
    expect(type.toTypeScriptAst()).toEqual({
      node: 'TrueKeyword',
    });
  });

  test('can handle "false"', () => {
    const system = new TypeSystem();
    const type = system.t.Const<false>(false);
    expect(type.toTypeScriptAst()).toEqual({
      node: 'FalseKeyword',
    });
  });

  test('can handle string', () => {
    const system = new TypeSystem();
    const type = system.t.Const<'asdf'>('asdf');
    expect(type.toTypeScriptAst()).toEqual({
      node: 'StringLiteral',
      text: 'asdf',
    });
  });

  test('complex objects', () => {
    const system = new TypeSystem();
    const type = system.t.Const({foo: 'bar'} as const);
    expect(type.toTypeScriptAst()).toEqual({
      node: 'ObjectKeyword',
    });
  });
});

describe('bool', () => {
  test('can emit boolean AST', () => {
    const system = new TypeSystem();
    const type = system.t.bool;
    expect(type.toTypeScriptAst()).toEqual({
      node: 'BooleanKeyword',
    });
  });
});

describe('num', () => {
  test('can emit number AST', () => {
    const system = new TypeSystem();
    const type = system.t.num;
    expect(type.toTypeScriptAst()).toEqual({
      node: 'NumberKeyword',
    });
  });
});

describe('str', () => {
  test('can emit string AST', () => {
    const system = new TypeSystem();
    const type = system.t.str;
    expect(type.toTypeScriptAst()).toEqual({
      node: 'StringKeyword',
    });
  });
});

describe('bin', () => {
  test('can emit binary AST', () => {
    const system = new TypeSystem();
    const type = system.t.bin;
    expect(type.toTypeScriptAst()).toMatchInlineSnapshot(`
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
    const system = new TypeSystem();
    const type = system.t.arr;
    expect(type.toTypeScriptAst()).toMatchInlineSnapshot(`
      {
        "elementType": {
          "node": "AnyKeyword",
        },
        "node": "ArrayType",
      }
    `);
  });

  test('can emit array of "string" AST', () => {
    const system = new TypeSystem();
    const type = system.t.Array(system.t.str);
    expect(type.toTypeScriptAst()).toMatchInlineSnapshot(`
      {
        "elementType": {
          "node": "StringKeyword",
        },
        "node": "ArrayType",
      }
    `);
  });
});

describe('tup', () => {
  test('can emit tuple AST', () => {
    const system = new TypeSystem();
    const {t} = system;
    const type = system.t.Tuple(t.str, t.num, t.bool);
    expect(type.toTypeScriptAst()).toMatchInlineSnapshot(`
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
    const system = new TypeSystem();
    const {t} = system;
    const type = system.t
      .Object(
        t.prop('id', t.str).options({
          title: 'title-x',
          description: 'description-x',
        }),
        t.propOpt('id', t.num),
      )
      .options({
        title: 'title',
        description: 'description',
      });
    expect(type.toTypeScriptAst()).toMatchInlineSnapshot(`
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
    const system = new TypeSystem();
    const {t} = system;
    const type = system.t.Map(t.num).options({
      title: 'title',
      description: 'description',
    });
    expect(type.toTypeScriptAst()).toMatchInlineSnapshot(`
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
    const system = new TypeSystem();
    const {t} = system;
    const type = system.t.Ref('Foo');
    expect(type.toTypeScriptAst()).toMatchInlineSnapshot(`
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
    const system = new TypeSystem();
    const {t} = system;
    const type = system.t.Or(t.str, t.num);
    expect(type.toTypeScriptAst()).toMatchInlineSnapshot(`
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
    const system = new TypeSystem();
    const {t} = system;
    const type = system.t.Function(t.str, t.num);
    expect(type.toTypeScriptAst()).toMatchInlineSnapshot(`
      {
        "node": "FunctionType",
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
    const system = new TypeSystem();
    const {t} = system;
    const type = system.t.Function$(t.str, t.num);
    expect(type.toTypeScriptAst()).toMatchInlineSnapshot(`
      {
        "node": "FunctionType",
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
