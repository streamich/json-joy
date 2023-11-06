import {TypeSystem} from '..';

test('generates TypeScript source for simple string type', () => {
  const system = new TypeSystem();
  const {t} = system;
  const alias = system.alias('ID', t.str);
  expect(alias.toTypeScript()).toMatchInlineSnapshot(`
    "type ID = string;
    "
  `);
});

test('emit a simple type interface', () => {
  const system = new TypeSystem();
  const {t} = system;
  const alias = system.alias(
    'BlogPost',
    t.Object(t.prop('id', t.str), t.prop('title', t.str), t.propOpt('body', t.str), t.propOpt('time', t.num)),
  );
  // console.log(alias.toTypeScript());
  expect(alias.toTypeScript()).toMatchInlineSnapshot(`
    "interface BlogPost {
      id: string;
      title: string;
      body?: string;
      time?: number;
    }
    "
  `);
});

test('emit an interface with all type kinds', () => {
  const system = new TypeSystem();
  const {t} = system;
  const alias = system.alias(
    'BlogPost',
    t.Object(
      t.prop('id', t.str),
      t.prop('title', t.bool),
      t.propOpt('body', t.str),
      t.propOpt('time', t.num),
      t.prop('arr', t.Array(t.str)),
      t.prop('arrOfObjects', t.Array(t.Object(t.prop('reg', t.str)))),
      t.prop('obj', t.Object(t.prop('reg', t.str), t.prop('arr', t.Array(t.str)))),
      t.prop('tuple', t.Tuple(t.str, t.num, t.bool)),
      t.prop('bin', t.bin),
      t.prop('const', t.Const<'hello'>('hello')),
    ),
  );
  // console.log(alias.toTypeScript());
  expect(alias.toTypeScript()).toMatchInlineSnapshot(`
    "interface BlogPost {
      id: string;
      title: boolean;
      body?: string;
      time?: number;
      arr: string[];
      arrOfObjects: Array<{
        reg: string;
      }>;
      obj: {
        reg: string;
        arr: string[];
      };
      tuple: [string, number, boolean];
      bin: Uint8Array;
      "const": "hello";
    }
    "
  `);
});

test('type interface inside a tuple', () => {
  const system = new TypeSystem();
  const {t} = system;
  const alias = system.alias(
    'Alias',
    t.Object(t.prop('tup', t.Tuple(t.str, t.Object(t.prop('id', t.str), t.prop('title', t.bool)), t.num))),
  );
  expect(alias.toTypeScript()).toMatchInlineSnapshot(`
    "interface Alias {
      tup: [
        string,
        {
          id: string;
          title: boolean;
        },
        number
      ];
    }
    "
  `);
});
