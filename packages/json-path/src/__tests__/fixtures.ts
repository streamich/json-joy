// Examples from RFC 9535 Table 2
export const bookstore = {
  store: {
    book: [
      {category: 'reference', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95},
      {category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99},
      {category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', isbn: '0-553-21311-3', price: 8.99},
      {
        category: 'fiction',
        author: 'J. R. R. Tolkien',
        title: 'The Lord of the Rings',
        isbn: '0-395-19395-8',
        price: 22.99,
      },
    ],
    bicycle: {color: 'red', price: 399},
  },
};

export const data0 = {
  store: {
    book: [
      {title: 'Harry Potter', author: 'J.K. Rowling', price: 8.95},
      {title: 'The Hobbit', author: 'J.R.R. Tolkien', price: 12.99},
    ],
    bicycle: {
      color: 'red',
      price: 399,
    },
  },
};

export const arrayData = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

export const complexData = {
  a: [3, 5, 1, 2, 4, 6, {b: 'j'}, {b: 'k'}, {b: {}}, {b: 'kilo'}],
  o: {p: 1, q: 2, r: 3, s: 5, t: {u: 6}},
  e: 'f',
};

export const testData = {
  store: {
    book: [
      {
        category: 'reference',
        author: 'Nigel Rees',
        title: 'Sayings of the Century',
        price: 8.95,
      },
      {
        category: 'fiction',
        author: 'Evelyn Waugh',
        title: 'Sword of Honour',
        price: 12.99,
      },
      {
        category: 'fiction',
        author: 'Herman Melville',
        title: 'Moby Dick',
        isbn: '0-553-21311-3',
        price: 8.99,
      },
      {
        category: 'fiction',
        author: 'J. R. R. Tolkien',
        title: 'The Lord of the Rings',
        isbn: '0-395-19395-8',
        price: 22.99,
      },
    ],
    bicycle: {
      color: 'red',
      price: 19.95,
    },
  },
  authors: ['John', 'Jane', 'Bob'],
  info: {
    name: 'Test Store',
    location: 'City',
    contacts: {
      email: 'test@store.com',
      phone: '123-456-7890',
    },
  },
};

export const jsonpathDotComExample = {
  firstName: 'John',
  lastName: 'doe',
  age: 26,
  address: {
    streetAddress: 'naist street',
    city: 'Nara',
    postalCode: '630-0192',
  },
  phoneNumbers: [
    {
      type: 'iPhone',
      number: '0123-4567-8888',
    },
    {
      type: 'home',
      number: '0123-4567-8910',
    },
  ],
};

export const tsAst = {
  type: 'Program',
  body: [
    {
      type: 'ImportDeclaration',
      source: {
        type: 'Literal',
        value: 'sonic-forest/lib/avl/AvlMap',
        raw: "'sonic-forest/lib/avl/AvlMap'",
        range: [35, 64],
      },
      specifiers: [
        {
          type: 'ImportSpecifier',
          local: {
            type: 'Identifier',
            name: 'AvlMap',
            range: [8, 14],
          },
          imported: {
            type: 'Identifier',
            name: 'AvlMap',
            range: [8, 14],
          },
          importKind: 'value',
          range: [8, 14],
        },
        {
          type: 'ImportSpecifier',
          local: {
            type: 'Identifier',
            name: 'AvlNode',
            range: [21, 28],
          },
          imported: {
            type: 'Identifier',
            name: 'AvlNode',
            range: [21, 28],
          },
          importKind: 'type',
          range: [16, 28],
        },
      ],
      importKind: 'value',
      assertions: [],
      range: [0, 65],
    },
    {
      type: 'ImportDeclaration',
      source: {
        type: 'Literal',
        value: './Lines',
        raw: "'./Lines'",
        range: [86, 95],
      },
      specifiers: [
        {
          type: 'ImportSpecifier',
          local: {
            type: 'Identifier',
            name: 'Lines',
            range: [74, 79],
          },
          imported: {
            type: 'Identifier',
            name: 'Lines',
            range: [74, 79],
          },
          importKind: 'value',
          range: [74, 79],
        },
      ],
      importKind: 'value',
      assertions: [],
      range: [66, 96],
    },
    {
      type: 'ImportDeclaration',
      source: {
        type: 'Literal',
        value: './Line',
        raw: "'./Line'",
        range: [120, 128],
      },
      specifiers: [
        {
          type: 'ImportSpecifier',
          local: {
            type: 'Identifier',
            name: 'TextLine',
            range: [105, 113],
          },
          imported: {
            type: 'Identifier',
            name: 'TextLine',
            range: [105, 113],
          },
          importKind: 'value',
          range: [105, 113],
        },
      ],
      importKind: 'value',
      assertions: [],
      range: [97, 129],
    },
    {
      type: 'ExportNamedDeclaration',
      declaration: {
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 'Text',
          range: [144, 148],
        },
        body: {
          type: 'ClassBody',
          body: [
            {
              type: 'PropertyDefinition',
              key: {
                type: 'Identifier',
                name: 'map',
                range: [239, 242],
              },
              value: {
                type: 'NewExpression',
                callee: {
                  type: 'Identifier',
                  name: 'AvlMap',
                  range: [249, 255],
                },
                arguments: [],
                range: [245, 273],
                typeParameters: {
                  type: 'TSTypeParameterInstantiation',
                  range: [255, 271],
                  params: [
                    {
                      type: 'TSNumberKeyword',
                      range: [256, 262],
                    },
                    {
                      type: 'TSNumberKeyword',
                      range: [264, 270],
                    },
                  ],
                },
              },
              computed: false,
              static: false,
              readonly: true,
              declare: false,
              override: false,
              range: [223, 274],
              accessibility: 'public',
            },
            {
              type: 'MethodDefinition',
              key: {
                type: 'Identifier',
                name: 'constructor',
                range: [278, 289],
              },
              value: {
                type: 'FunctionExpression',
                id: null,
                params: [
                  {
                    type: 'TSParameterProperty',
                    accessibility: 'public',
                    readonly: true,
                    parameter: {
                      type: 'Identifier',
                      name: 'str',
                      range: [306, 317],
                      typeAnnotation: {
                        type: 'TSTypeAnnotation',
                        range: [309, 317],
                        typeAnnotation: {
                          type: 'TSStringKeyword',
                          range: [311, 317],
                        },
                      },
                    },
                    range: [290, 317],
                  },
                ],
                generator: false,
                expression: false,
                async: false,
                body: {
                  type: 'BlockStatement',
                  body: [
                    {
                      type: 'VariableDeclaration',
                      declarations: [
                        {
                          type: 'VariableDeclarator',
                          id: {
                            type: 'Identifier',
                            name: 'pos',
                            range: [329, 332],
                          },
                          init: {
                            type: 'UnaryExpression',
                            operator: '-',
                            prefix: true,
                            argument: {
                              type: 'Literal',
                              value: 1,
                              raw: '1',
                              range: [336, 337],
                            },
                            range: [335, 337],
                          },
                          range: [329, 337],
                        },
                      ],
                      kind: 'let',
                      range: [325, 338],
                    },
                    {
                      type: 'VariableDeclaration',
                      declarations: [
                        {
                          type: 'VariableDeclarator',
                          id: {
                            type: 'Identifier',
                            name: 'nextLine',
                            range: [347, 355],
                          },
                          init: {
                            type: 'Literal',
                            value: 1,
                            raw: '1',
                            range: [358, 359],
                          },
                          range: [347, 359],
                        },
                      ],
                      kind: 'let',
                      range: [343, 360],
                    },
                    {
                      type: 'VariableDeclaration',
                      declarations: [
                        {
                          type: 'VariableDeclarator',
                          id: {
                            type: 'Identifier',
                            name: 'map',
                            range: [371, 374],
                          },
                          init: {
                            type: 'MemberExpression',
                            object: {
                              type: 'ThisExpression',
                              range: [377, 381],
                            },
                            property: {
                              type: 'Identifier',
                              name: 'map',
                              range: [382, 385],
                            },
                            computed: false,
                            optional: false,
                            range: [377, 385],
                          },
                          range: [371, 385],
                        },
                      ],
                      kind: 'const',
                      range: [365, 386],
                    },
                    {
                      type: 'ExpressionStatement',
                      expression: {
                        type: 'CallExpression',
                        callee: {
                          type: 'MemberExpression',
                          object: {
                            type: 'Identifier',
                            name: 'map',
                            range: [391, 394],
                          },
                          property: {
                            type: 'Identifier',
                            name: 'set',
                            range: [395, 398],
                          },
                          computed: false,
                          optional: false,
                          range: [391, 398],
                        },
                        arguments: [
                          {
                            type: 'Literal',
                            value: 0,
                            raw: '0',
                            range: [399, 400],
                          },
                          {
                            type: 'Literal',
                            value: 0,
                            raw: '0',
                            range: [402, 403],
                          },
                        ],
                        optional: false,
                        range: [391, 404],
                      },
                      range: [391, 405],
                    },
                    {
                      type: 'WhileStatement',
                      test: {
                        type: 'Literal',
                        value: true,
                        raw: 'true',
                        range: [417, 421],
                      },
                      body: {
                        type: 'BlockStatement',
                        body: [
                          {
                            type: 'ExpressionStatement',
                            expression: {
                              type: 'AssignmentExpression',
                              operator: '=',
                              left: {
                                type: 'Identifier',
                                name: 'pos',
                                range: [431, 434],
                              },
                              right: {
                                type: 'CallExpression',
                                callee: {
                                  type: 'MemberExpression',
                                  object: {
                                    type: 'Identifier',
                                    name: 'str',
                                    range: [437, 440],
                                  },
                                  property: {
                                    type: 'Identifier',
                                    name: 'indexOf',
                                    range: [441, 448],
                                  },
                                  computed: false,
                                  optional: false,
                                  range: [437, 448],
                                },
                                arguments: [
                                  {
                                    type: 'Literal',
                                    value: '\n',
                                    raw: "'\\n'",
                                    range: [449, 453],
                                  },
                                  {
                                    type: 'BinaryExpression',
                                    operator: '+',
                                    left: {
                                      type: 'Identifier',
                                      name: 'pos',
                                      range: [455, 458],
                                    },
                                    right: {
                                      type: 'Literal',
                                      value: 1,
                                      raw: '1',
                                      range: [461, 462],
                                    },
                                    range: [455, 462],
                                  },
                                ],
                                optional: false,
                                range: [437, 463],
                              },
                              range: [431, 463],
                            },
                            range: [431, 464],
                          },
                          {
                            type: 'IfStatement',
                            test: {
                              type: 'BinaryExpression',
                              operator: '<',
                              left: {
                                type: 'Identifier',
                                name: 'pos',
                                range: [475, 478],
                              },
                              right: {
                                type: 'Literal',
                                value: 0,
                                raw: '0',
                                range: [481, 482],
                              },
                              range: [475, 482],
                            },
                            consequent: {
                              type: 'BreakStatement',
                              label: null,
                              range: [484, 490],
                            },
                            alternate: null,
                            range: [471, 490],
                          },
                          {
                            type: 'ExpressionStatement',
                            expression: {
                              type: 'CallExpression',
                              callee: {
                                type: 'MemberExpression',
                                object: {
                                  type: 'Identifier',
                                  name: 'map',
                                  range: [497, 500],
                                },
                                property: {
                                  type: 'Identifier',
                                  name: 'set',
                                  range: [501, 504],
                                },
                                computed: false,
                                optional: false,
                                range: [497, 504],
                              },
                              arguments: [
                                {
                                  type: 'Identifier',
                                  name: 'nextLine',
                                  range: [505, 513],
                                },
                                {
                                  type: 'BinaryExpression',
                                  operator: '+',
                                  left: {
                                    type: 'Identifier',
                                    name: 'pos',
                                    range: [515, 518],
                                  },
                                  right: {
                                    type: 'Literal',
                                    value: 1,
                                    raw: '1',
                                    range: [521, 522],
                                  },
                                  range: [515, 522],
                                },
                              ],
                              optional: false,
                              range: [497, 523],
                            },
                            range: [497, 524],
                          },
                          {
                            type: 'ExpressionStatement',
                            expression: {
                              type: 'UpdateExpression',
                              operator: '++',
                              prefix: false,
                              argument: {
                                type: 'Identifier',
                                name: 'nextLine',
                                range: [531, 539],
                              },
                              range: [531, 541],
                            },
                            range: [531, 542],
                          },
                        ],
                        range: [423, 548],
                      },
                      range: [410, 548],
                    },
                  ],
                  range: [319, 552],
                },
                range: [289, 552],
              },
              computed: false,
              static: false,
              kind: 'constructor',
              override: false,
              range: [278, 552],
            },
            {
              type: 'MethodDefinition',
              key: {
                type: 'Identifier',
                name: 'count',
                range: [613, 618],
              },
              value: {
                type: 'FunctionExpression',
                id: null,
                generator: false,
                expression: false,
                async: false,
                body: {
                  type: 'BlockStatement',
                  body: [
                    {
                      type: 'ReturnStatement',
                      argument: {
                        type: 'CallExpression',
                        callee: {
                          type: 'MemberExpression',
                          object: {
                            type: 'MemberExpression',
                            object: {
                              type: 'ThisExpression',
                              range: [642, 646],
                            },
                            property: {
                              type: 'Identifier',
                              name: 'map',
                              range: [647, 650],
                            },
                            computed: false,
                            optional: false,
                            range: [642, 650],
                          },
                          property: {
                            type: 'Identifier',
                            name: 'size',
                            range: [651, 655],
                          },
                          computed: false,
                          optional: false,
                          range: [642, 655],
                        },
                        arguments: [],
                        optional: false,
                        range: [642, 657],
                      },
                      range: [635, 658],
                    },
                  ],
                  range: [629, 662],
                },
                range: [618, 662],
                params: [],
                returnType: {
                  type: 'TSTypeAnnotation',
                  range: [620, 628],
                  typeAnnotation: {
                    type: 'TSNumberKeyword',
                    range: [622, 628],
                  },
                },
              },
              computed: false,
              static: false,
              kind: 'method',
              override: false,
              range: [606, 662],
              accessibility: 'public',
            },
            {
              type: 'MethodDefinition',
              key: {
                type: 'Identifier',
                name: 'getLines',
                range: [882, 890],
              },
              value: {
                type: 'FunctionExpression',
                id: null,
                generator: false,
                expression: false,
                async: false,
                body: {
                  type: 'BlockStatement',
                  body: [
                    {
                      type: 'ReturnStatement',
                      argument: {
                        type: 'NewExpression',
                        callee: {
                          type: 'Identifier',
                          name: 'Lines',
                          range: [948, 953],
                        },
                        arguments: [
                          {
                            type: 'CallExpression',
                            callee: {
                              type: 'MemberExpression',
                              object: {
                                type: 'Identifier',
                                name: 'Array',
                                range: [954, 959],
                              },
                              property: {
                                type: 'Identifier',
                                name: 'from',
                                range: [960, 964],
                              },
                              computed: false,
                              optional: false,
                              range: [954, 964],
                            },
                            arguments: [
                              {
                                type: 'CallExpression',
                                callee: {
                                  type: 'MemberExpression',
                                  object: {
                                    type: 'ThisExpression',
                                    range: [965, 969],
                                  },
                                  property: {
                                    type: 'Identifier',
                                    name: 'lines',
                                    range: [970, 975],
                                  },
                                  computed: false,
                                  optional: false,
                                  range: [965, 975],
                                },
                                arguments: [
                                  {
                                    type: 'Identifier',
                                    name: 'line',
                                    range: [976, 980],
                                  },
                                  {
                                    type: 'Identifier',
                                    name: 'count',
                                    range: [982, 987],
                                  },
                                ],
                                optional: false,
                                range: [965, 988],
                              },
                            ],
                            optional: false,
                            range: [954, 989],
                          },
                        ],
                        range: [944, 990],
                      },
                      range: [937, 991],
                    },
                  ],
                  range: [931, 995],
                },
                range: [890, 995],
                params: [
                  {
                    type: 'Identifier',
                    name: 'line',
                    range: [891, 903],
                    typeAnnotation: {
                      type: 'TSTypeAnnotation',
                      range: [895, 903],
                      typeAnnotation: {
                        type: 'TSNumberKeyword',
                        range: [897, 903],
                      },
                    },
                  },
                  {
                    type: 'AssignmentPattern',
                    left: {
                      type: 'Identifier',
                      name: 'count',
                      range: [905, 918],
                      typeAnnotation: {
                        type: 'TSTypeAnnotation',
                        range: [910, 918],
                        typeAnnotation: {
                          type: 'TSNumberKeyword',
                          range: [912, 918],
                        },
                      },
                    },
                    right: {
                      type: 'Literal',
                      value: 1,
                      raw: '1',
                      range: [921, 922],
                    },
                    range: [905, 922],
                  },
                ],
                returnType: {
                  type: 'TSTypeAnnotation',
                  range: [923, 930],
                  typeAnnotation: {
                    type: 'TSTypeReference',
                    typeName: {
                      type: 'Identifier',
                      name: 'Lines',
                      range: [925, 930],
                    },
                    range: [925, 930],
                  },
                },
              },
              computed: false,
              static: false,
              kind: 'method',
              override: false,
              range: [875, 995],
              accessibility: 'public',
            },
            {
              type: 'MethodDefinition',
              key: {
                type: 'Identifier',
                name: 'lines',
                range: [1007, 1012],
              },
              value: {
                type: 'FunctionExpression',
                id: null,
                generator: true,
                expression: false,
                async: false,
                body: {
                  type: 'BlockStatement',
                  body: [
                    {
                      type: 'IfStatement',
                      test: {
                        type: 'BinaryExpression',
                        operator: '<',
                        left: {
                          type: 'Identifier',
                          name: 'line',
                          range: [1076, 1080],
                        },
                        right: {
                          type: 'Literal',
                          value: 1,
                          raw: '1',
                          range: [1083, 1084],
                        },
                        range: [1076, 1084],
                      },
                      consequent: {
                        type: 'ExpressionStatement',
                        expression: {
                          type: 'AssignmentExpression',
                          operator: '=',
                          left: {
                            type: 'Identifier',
                            name: 'line',
                            range: [1086, 1090],
                          },
                          right: {
                            type: 'Literal',
                            value: 1,
                            raw: '1',
                            range: [1093, 1094],
                          },
                          range: [1086, 1094],
                        },
                        range: [1086, 1095],
                      },
                      alternate: null,
                      range: [1072, 1095],
                    },
                    {
                      type: 'VariableDeclaration',
                      declarations: [
                        {
                          type: 'VariableDeclarator',
                          id: {
                            type: 'Identifier',
                            name: 'map',
                            range: [1106, 1109],
                          },
                          init: {
                            type: 'MemberExpression',
                            object: {
                              type: 'ThisExpression',
                              range: [1112, 1116],
                            },
                            property: {
                              type: 'Identifier',
                              name: 'map',
                              range: [1117, 1120],
                            },
                            computed: false,
                            optional: false,
                            range: [1112, 1120],
                          },
                          range: [1106, 1120],
                        },
                      ],
                      kind: 'const',
                      range: [1100, 1121],
                    },
                    {
                      type: 'VariableDeclaration',
                      declarations: [
                        {
                          type: 'VariableDeclarator',
                          id: {
                            type: 'Identifier',
                            name: 'start',
                            range: [1130, 1135],
                          },
                          init: {
                            type: 'CallExpression',
                            callee: {
                              type: 'MemberExpression',
                              object: {
                                type: 'Identifier',
                                name: 'map',
                                range: [1138, 1141],
                              },
                              property: {
                                type: 'Identifier',
                                name: 'find',
                                range: [1142, 1146],
                              },
                              computed: false,
                              optional: false,
                              range: [1138, 1146],
                            },
                            arguments: [
                              {
                                type: 'BinaryExpression',
                                operator: '-',
                                left: {
                                  type: 'Identifier',
                                  name: 'line',
                                  range: [1147, 1151],
                                },
                                right: {
                                  type: 'Literal',
                                  value: 1,
                                  raw: '1',
                                  range: [1154, 1155],
                                },
                                range: [1147, 1155],
                              },
                            ],
                            optional: false,
                            range: [1138, 1156],
                          },
                          range: [1130, 1156],
                        },
                      ],
                      kind: 'let',
                      range: [1126, 1157],
                    },
                    {
                      type: 'IfStatement',
                      test: {
                        type: 'UnaryExpression',
                        operator: '!',
                        prefix: true,
                        argument: {
                          type: 'Identifier',
                          name: 'start',
                          range: [1167, 1172],
                        },
                        range: [1166, 1172],
                      },
                      consequent: {
                        type: 'ReturnStatement',
                        argument: null,
                        range: [1174, 1181],
                      },
                      alternate: null,
                      range: [1162, 1181],
                    },
                    {
                      type: 'WhileStatement',
                      test: {
                        type: 'BinaryExpression',
                        operator: '>',
                        left: {
                          type: 'Identifier',
                          name: 'count',
                          range: [1193, 1198],
                        },
                        right: {
                          type: 'Literal',
                          value: 0,
                          raw: '0',
                          range: [1201, 1202],
                        },
                        range: [1193, 1202],
                      },
                      body: {
                        type: 'BlockStatement',
                        body: [
                          {
                            type: 'VariableDeclaration',
                            declarations: [
                              {
                                type: 'VariableDeclarator',
                                id: {
                                  type: 'Identifier',
                                  name: 'end',
                                  range: [1218, 1221],
                                },
                                init: {
                                  type: 'TSAsExpression',
                                  expression: {
                                    type: 'CallExpression',
                                    callee: {
                                      type: 'MemberExpression',
                                      object: {
                                        type: 'Identifier',
                                        name: 'map',
                                        range: [1224, 1227],
                                      },
                                      property: {
                                        type: 'Identifier',
                                        name: 'next',
                                        range: [1228, 1232],
                                      },
                                      computed: false,
                                      optional: false,
                                      range: [1224, 1232],
                                    },
                                    arguments: [
                                      {
                                        type: 'TSAsExpression',
                                        expression: {
                                          type: 'Identifier',
                                          name: 'start',
                                          range: [1233, 1238],
                                        },
                                        typeAnnotation: {
                                          type: 'TSTypeReference',
                                          typeName: {
                                            type: 'Identifier',
                                            name: 'AvlNode',
                                            range: [1242, 1249],
                                          },
                                          typeParameters: {
                                            type: 'TSTypeParameterInstantiation',
                                            range: [1249, 1265],
                                            params: [
                                              {
                                                type: 'TSNumberKeyword',
                                                range: [1250, 1256],
                                              },
                                              {
                                                type: 'TSNumberKeyword',
                                                range: [1258, 1264],
                                              },
                                            ],
                                          },
                                          range: [1242, 1265],
                                        },
                                        range: [1233, 1265],
                                      },
                                    ],
                                    optional: false,
                                    range: [1224, 1266],
                                  },
                                  typeAnnotation: {
                                    type: 'TSUnionType',
                                    types: [
                                      {
                                        type: 'TSTypeReference',
                                        typeName: {
                                          type: 'Identifier',
                                          name: 'AvlNode',
                                          range: [1270, 1277],
                                        },
                                        typeParameters: {
                                          type: 'TSTypeParameterInstantiation',
                                          range: [1277, 1293],
                                          params: [
                                            {
                                              type: 'TSNumberKeyword',
                                              range: [1278, 1284],
                                            },
                                            {
                                              type: 'TSNumberKeyword',
                                              range: [1286, 1292],
                                            },
                                          ],
                                        },
                                        range: [1270, 1293],
                                      },
                                      {
                                        type: 'TSUndefinedKeyword',
                                        range: [1296, 1305],
                                      },
                                    ],
                                    range: [1270, 1305],
                                  },
                                  range: [1224, 1305],
                                },
                                range: [1218, 1305],
                              },
                            ],
                            kind: 'const',
                            range: [1212, 1306],
                          },
                          {
                            type: 'IfStatement',
                            test: {
                              type: 'UnaryExpression',
                              operator: '!',
                              prefix: true,
                              argument: {
                                type: 'Identifier',
                                name: 'end',
                                range: [1318, 1321],
                              },
                              range: [1317, 1321],
                            },
                            consequent: {
                              type: 'BlockStatement',
                              body: [
                                {
                                  type: 'ExpressionStatement',
                                  expression: {
                                    type: 'YieldExpression',
                                    delegate: false,
                                    argument: {
                                      type: 'NewExpression',
                                      callee: {
                                        type: 'Identifier',
                                        name: 'TextLine',
                                        range: [1343, 1351],
                                      },
                                      arguments: [
                                        {
                                          type: 'ThisExpression',
                                          range: [1352, 1356],
                                        },
                                        {
                                          type: 'BinaryExpression',
                                          operator: '+',
                                          left: {
                                            type: 'MemberExpression',
                                            object: {
                                              type: 'Identifier',
                                              name: 'start',
                                              range: [1358, 1363],
                                            },
                                            property: {
                                              type: 'Identifier',
                                              name: 'k',
                                              range: [1364, 1365],
                                            },
                                            computed: false,
                                            optional: false,
                                            range: [1358, 1365],
                                          },
                                          right: {
                                            type: 'Literal',
                                            value: 1,
                                            raw: '1',
                                            range: [1368, 1369],
                                          },
                                          range: [1358, 1369],
                                        },
                                        {
                                          type: 'MemberExpression',
                                          object: {
                                            type: 'Identifier',
                                            name: 'start',
                                            range: [1371, 1376],
                                          },
                                          property: {
                                            type: 'Identifier',
                                            name: 'v',
                                            range: [1377, 1378],
                                          },
                                          computed: false,
                                          optional: false,
                                          range: [1371, 1378],
                                        },
                                        {
                                          type: 'MemberExpression',
                                          object: {
                                            type: 'MemberExpression',
                                            object: {
                                              type: 'ThisExpression',
                                              range: [1380, 1384],
                                            },
                                            property: {
                                              type: 'Identifier',
                                              name: 'str',
                                              range: [1385, 1388],
                                            },
                                            computed: false,
                                            optional: false,
                                            range: [1380, 1388],
                                          },
                                          property: {
                                            type: 'Identifier',
                                            name: 'length',
                                            range: [1389, 1395],
                                          },
                                          computed: false,
                                          optional: false,
                                          range: [1380, 1395],
                                        },
                                      ],
                                      range: [1339, 1396],
                                    },
                                    range: [1333, 1396],
                                  },
                                  range: [1333, 1397],
                                },
                                {
                                  type: 'ReturnStatement',
                                  argument: null,
                                  range: [1406, 1413],
                                },
                              ],
                              range: [1323, 1421],
                            },
                            alternate: null,
                            range: [1313, 1421],
                          },
                          {
                            type: 'ExpressionStatement',
                            expression: {
                              type: 'YieldExpression',
                              delegate: false,
                              argument: {
                                type: 'NewExpression',
                                callee: {
                                  type: 'Identifier',
                                  name: 'TextLine',
                                  range: [1438, 1446],
                                },
                                arguments: [
                                  {
                                    type: 'ThisExpression',
                                    range: [1447, 1451],
                                  },
                                  {
                                    type: 'BinaryExpression',
                                    operator: '+',
                                    left: {
                                      type: 'MemberExpression',
                                      object: {
                                        type: 'Identifier',
                                        name: 'start',
                                        range: [1453, 1458],
                                      },
                                      property: {
                                        type: 'Identifier',
                                        name: 'k',
                                        range: [1459, 1460],
                                      },
                                      computed: false,
                                      optional: false,
                                      range: [1453, 1460],
                                    },
                                    right: {
                                      type: 'Literal',
                                      value: 1,
                                      raw: '1',
                                      range: [1463, 1464],
                                    },
                                    range: [1453, 1464],
                                  },
                                  {
                                    type: 'MemberExpression',
                                    object: {
                                      type: 'Identifier',
                                      name: 'start',
                                      range: [1466, 1471],
                                    },
                                    property: {
                                      type: 'Identifier',
                                      name: 'v',
                                      range: [1472, 1473],
                                    },
                                    computed: false,
                                    optional: false,
                                    range: [1466, 1473],
                                  },
                                  {
                                    type: 'MemberExpression',
                                    object: {
                                      type: 'Identifier',
                                      name: 'end',
                                      range: [1475, 1478],
                                    },
                                    property: {
                                      type: 'Identifier',
                                      name: 'v',
                                      range: [1479, 1480],
                                    },
                                    computed: false,
                                    optional: false,
                                    range: [1475, 1480],
                                  },
                                ],
                                range: [1434, 1481],
                              },
                              range: [1428, 1481],
                            },
                            range: [1428, 1482],
                          },
                          {
                            type: 'ExpressionStatement',
                            expression: {
                              type: 'AssignmentExpression',
                              operator: '=',
                              left: {
                                type: 'Identifier',
                                name: 'start',
                                range: [1489, 1494],
                              },
                              right: {
                                type: 'Identifier',
                                name: 'end',
                                range: [1497, 1500],
                              },
                              range: [1489, 1500],
                            },
                            range: [1489, 1501],
                          },
                          {
                            type: 'ExpressionStatement',
                            expression: {
                              type: 'UpdateExpression',
                              operator: '--',
                              prefix: false,
                              argument: {
                                type: 'Identifier',
                                name: 'count',
                                range: [1508, 1513],
                              },
                              range: [1508, 1515],
                            },
                            range: [1508, 1516],
                          },
                        ],
                        range: [1204, 1522],
                      },
                      range: [1186, 1522],
                    },
                  ],
                  range: [1066, 1526],
                },
                range: [1012, 1526],
                params: [
                  {
                    type: 'Identifier',
                    name: 'line',
                    range: [1013, 1025],
                    typeAnnotation: {
                      type: 'TSTypeAnnotation',
                      range: [1017, 1025],
                      typeAnnotation: {
                        type: 'TSNumberKeyword',
                        range: [1019, 1025],
                      },
                    },
                  },
                  {
                    type: 'AssignmentPattern',
                    left: {
                      type: 'Identifier',
                      name: 'count',
                      range: [1027, 1040],
                      typeAnnotation: {
                        type: 'TSTypeAnnotation',
                        range: [1032, 1040],
                        typeAnnotation: {
                          type: 'TSNumberKeyword',
                          range: [1034, 1040],
                        },
                      },
                    },
                    right: {
                      type: 'Literal',
                      value: 1,
                      raw: '1',
                      range: [1043, 1044],
                    },
                    range: [1027, 1044],
                  },
                ],
                returnType: {
                  type: 'TSTypeAnnotation',
                  range: [1045, 1065],
                  typeAnnotation: {
                    type: 'TSTypeReference',
                    typeName: {
                      type: 'Identifier',
                      name: 'Iterable',
                      range: [1047, 1055],
                    },
                    typeParameters: {
                      type: 'TSTypeParameterInstantiation',
                      range: [1055, 1065],
                      params: [
                        {
                          type: 'TSTypeReference',
                          typeName: {
                            type: 'Identifier',
                            name: 'TextLine',
                            range: [1056, 1064],
                          },
                          range: [1056, 1064],
                        },
                      ],
                    },
                    range: [1047, 1065],
                  },
                },
              },
              computed: false,
              static: false,
              kind: 'method',
              override: false,
              range: [999, 1526],
              accessibility: 'public',
            },
            {
              type: 'MethodDefinition',
              key: {
                type: 'Identifier',
                name: 'filter',
                range: [1538, 1544],
              },
              value: {
                type: 'FunctionExpression',
                id: null,
                generator: true,
                expression: false,
                async: false,
                body: {
                  type: 'BlockStatement',
                  body: [
                    {
                      type: 'ForOfStatement',
                      left: {
                        type: 'VariableDeclaration',
                        declarations: [
                          {
                            type: 'VariableDeclarator',
                            id: {
                              type: 'Identifier',
                              name: 'l',
                              range: [1648, 1649],
                            },
                            init: null,
                            range: [1648, 1649],
                          },
                        ],
                        kind: 'const',
                        range: [1642, 1649],
                      },
                      right: {
                        type: 'CallExpression',
                        callee: {
                          type: 'MemberExpression',
                          object: {
                            type: 'ThisExpression',
                            range: [1653, 1657],
                          },
                          property: {
                            type: 'Identifier',
                            name: 'lines',
                            range: [1658, 1663],
                          },
                          computed: false,
                          optional: false,
                          range: [1653, 1663],
                        },
                        arguments: [
                          {
                            type: 'Identifier',
                            name: 'line',
                            range: [1664, 1668],
                          },
                          {
                            type: 'Identifier',
                            name: 'count',
                            range: [1670, 1675],
                          },
                        ],
                        optional: false,
                        range: [1653, 1676],
                      },
                      body: {
                        type: 'IfStatement',
                        test: {
                          type: 'CallExpression',
                          callee: {
                            type: 'Identifier',
                            name: 'predicate',
                            range: [1682, 1691],
                          },
                          arguments: [
                            {
                              type: 'CallExpression',
                              callee: {
                                type: 'MemberExpression',
                                object: {
                                  type: 'Identifier',
                                  name: 'l',
                                  range: [1692, 1693],
                                },
                                property: {
                                  type: 'Identifier',
                                  name: 'text',
                                  range: [1694, 1698],
                                },
                                computed: false,
                                optional: false,
                                range: [1692, 1698],
                              },
                              arguments: [],
                              optional: false,
                              range: [1692, 1700],
                            },
                          ],
                          optional: false,
                          range: [1682, 1701],
                        },
                        consequent: {
                          type: 'ExpressionStatement',
                          expression: {
                            type: 'YieldExpression',
                            delegate: false,
                            argument: {
                              type: 'Identifier',
                              name: 'l',
                              range: [1709, 1710],
                            },
                            range: [1703, 1710],
                          },
                          range: [1703, 1711],
                        },
                        alternate: null,
                        range: [1678, 1711],
                      },
                      await: false,
                      range: [1637, 1711],
                    },
                  ],
                  range: [1631, 1715],
                },
                range: [1544, 1715],
                params: [
                  {
                    type: 'Identifier',
                    name: 'line',
                    range: [1545, 1557],
                    typeAnnotation: {
                      type: 'TSTypeAnnotation',
                      range: [1549, 1557],
                      typeAnnotation: {
                        type: 'TSNumberKeyword',
                        range: [1551, 1557],
                      },
                    },
                  },
                  {
                    type: 'Identifier',
                    name: 'count',
                    range: [1559, 1572],
                    typeAnnotation: {
                      type: 'TSTypeAnnotation',
                      range: [1564, 1572],
                      typeAnnotation: {
                        type: 'TSNumberKeyword',
                        range: [1566, 1572],
                      },
                    },
                  },
                  {
                    type: 'Identifier',
                    name: 'predicate',
                    range: [1574, 1609],
                    typeAnnotation: {
                      type: 'TSTypeAnnotation',
                      range: [1583, 1609],
                      typeAnnotation: {
                        type: 'TSFunctionType',
                        params: [
                          {
                            type: 'Identifier',
                            name: 'str',
                            range: [1586, 1597],
                            typeAnnotation: {
                              type: 'TSTypeAnnotation',
                              range: [1589, 1597],
                              typeAnnotation: {
                                type: 'TSStringKeyword',
                                range: [1591, 1597],
                              },
                            },
                          },
                        ],
                        range: [1585, 1609],
                        returnType: {
                          type: 'TSTypeAnnotation',
                          range: [1599, 1609],
                          typeAnnotation: {
                            type: 'TSBooleanKeyword',
                            range: [1602, 1609],
                          },
                        },
                      },
                    },
                  },
                ],
                returnType: {
                  type: 'TSTypeAnnotation',
                  range: [1610, 1630],
                  typeAnnotation: {
                    type: 'TSTypeReference',
                    typeName: {
                      type: 'Identifier',
                      name: 'Iterable',
                      range: [1612, 1620],
                    },
                    typeParameters: {
                      type: 'TSTypeParameterInstantiation',
                      range: [1620, 1630],
                      params: [
                        {
                          type: 'TSTypeReference',
                          typeName: {
                            type: 'Identifier',
                            name: 'TextLine',
                            range: [1621, 1629],
                          },
                          range: [1621, 1629],
                        },
                      ],
                    },
                    range: [1612, 1630],
                  },
                },
              },
              computed: false,
              static: false,
              kind: 'method',
              override: false,
              range: [1530, 1715],
              accessibility: 'public',
            },
          ],
          range: [149, 1717],
        },
        superClass: null,
        range: [138, 1717],
      },
      specifiers: [],
      source: null,
      exportKind: 'value',
      range: [131, 1717],
      assertions: [],
    },
  ],
  sourceType: 'module',
  range: [0, 1718],
};
