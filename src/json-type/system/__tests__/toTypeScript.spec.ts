import {TypeSystem} from '..';
import {TypeRouter} from '../TypeRouter';

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

test('can export whole router', () => {
  const system = new TypeSystem();
  const {t} = system;
  const router = new TypeRouter({system, routes: {}}).extend(() => ({
    callMe: t.Function(t.str, t.num),
    'block.subscribe': t.Function$(t.Object(t.prop('id', t.str)), t.obj),
  }));
  expect(router.toTypeScript()).toMatchInlineSnapshot(`
    "export namespace Router {
      export type Routes = {
        callMe: (request: string) => Promise<number>;
        "block.subscribe": (request$: Observable<{
          id: string;
        }>) => Observable<{}>;
      };
    }
    "
  `);
});

test('can export whole router and aliases', () => {
  const system = new TypeSystem();
  const {t} = system;
  system.alias('Document', t.Object(t.prop('id', t.str), t.prop('title', t.str)).options({title: 'The document'}));
  const router = new TypeRouter({system, routes: {}}).extend(() => ({
    callMe: t.Function(t.str, t.num),
    'block.subscribe': t.Function$(t.Object(t.prop('id', t.str)), t.Ref('Document')),
  }));
  expect(router.toTypeScript()).toMatchInlineSnapshot(`
    "export namespace Router {
      export type Routes = {
        callMe: (request: string) => Promise<number>;
        "block.subscribe": (request$: Observable<{
          id: string;
        }>) => Observable<Document>;
      };

      export interface Document {
        id: string;
        title: string;
      }
    }
    "
  `);
});
