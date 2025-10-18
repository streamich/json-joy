import {ModuleType} from '..';
import {aliasToTs} from '../../../../typescript/converter';
import {toText} from '../../../../typescript/toText';
import type {AliasType} from '../../AliasType';

const aliasToTsText = (alias: AliasType<any, any>): string => {
  return toText(aliasToTs(alias));
};

test('generates TypeScript source for simple string type', () => {
  const system = new ModuleType();
  const {t} = system;
  const alias = system.alias('ID', t.str);
  expect(aliasToTsText(alias)).toMatchInlineSnapshot(`
    "type ID = string;
    "
  `);
});

test('emit a simple type interface', () => {
  const system = new ModuleType();
  const {t} = system;
  const alias = system.alias(
    'BlogPost',
    t.Object(t.Key('id', t.str), t.Key('title', t.str), t.KeyOpt('body', t.str), t.KeyOpt('time', t.num)),
  );
  // console.log(alias.toTypeScript());
  expect(aliasToTsText(alias)).toMatchInlineSnapshot(`
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
  const system = new ModuleType();
  const {t} = system;
  const alias = system.alias(
    'BlogPost',
    t.Object(
      t.Key('id', t.str),
      t.Key('title', t.bool),
      t.KeyOpt('body', t.str),
      t.KeyOpt('time', t.num),
      t.Key('arr', t.Array(t.str)),
      t.Key('arrOfObjects', t.Array(t.Object(t.Key('reg', t.str)))),
      t.Key('obj', t.Object(t.Key('reg', t.str), t.Key('arr', t.Array(t.str)))),
      t.Key('tuple', t.Tuple([t.str, t.num, t.bool])),
      t.Key('tupleWithRest', t.Tuple([t.str, t.num], t.bool)),
      t.Key('tupleWithTail', t.Tuple([t.str, t.num], t.bool, [t.con('a')])),
      t.Key('bin', t.bin),
      t.Key('const', t.Const<'hello'>('hello')),
    ),
  );
  // console.log(alias.toTypeScript());
  expect(aliasToTsText(alias)).toMatchInlineSnapshot(`
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
      tupleWithRest: [string, number, ...boolean[]];
      tupleWithTail: [string, number, ...boolean[], "a"];
      bin: Uint8Array;
      "const": "hello";
    }
    "
  `);
});

// test('type interface inside a tuple', () => {
//   const system = new TypeSystem();
//   const {t} = system;
//   const alias = system.alias(
//     'Alias',
//     t.Object(t.prop('tup', t.Tuple(t.str, t.Object(t.prop('id', t.str), t.prop('title', t.bool)), t.num))),
//   );
//   expect(alias.toTypeScript()).toMatchInlineSnapshot(`
//     "interface Alias {
//       tup: [
//         string,
//         {
//           id: string;
//           title: boolean;
//         },
//         number
//       ];
//     }
//     "
//   `);
// });
