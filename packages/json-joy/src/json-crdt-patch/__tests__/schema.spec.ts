import {Model} from '../../json-crdt/model';
import {type NodeBuilder, s} from '../schema';

const escapeTerminalCtrlChars = (str: string): string =>
  str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

describe('nodes', () => {
  describe('obj', () => {
    test('can create basic "obj" schema', () => {
      const schema = s.obj({
        num: s.con(123),
      });
      const model = Model.create(schema, 123456789);
      expect(model.view()).toEqual({
        num: 123,
      });
      expect(model.api.select('', true)?.node.name()).toBe('obj');
      expect(model.api.select('/num', false)?.node.name()).toBe('con');
      expect(model.api.select('/num', true)?.node.name()).toBe('con');
    });
  });

  test('can print schema', () => {
    const schema = s.obj(
      {
        name: s.str('abc'),
        age: s.con(123),
        data: s.bin(new Uint8Array([0xff, 0x00, 0x44, 0x55])),
        important: s.val(s.con(null)),
        undefined: s.con(undefined),
        coords: s.vec(s.con(1.1232), s.con(2.1232)),
        tags: s.arr([s.str('tag1'), s.str('tag2')]),
        extension: s.ext(
          5,
          s.obj({
            foo: s.con('bar'),
          }),
        ),
      },
      {
        verified: s.con(true),
        signature: s.con(new Uint8Array([1, 2, 3])),
        label: s.con('x78398ks-asdf'),
      },
    );
    const str = schema + '';
    expect('\n' + escapeTerminalCtrlChars(str)).toBe(`
obj
├─ "name"
│   └─ str { "abc" }
├─ "age"
│   └─ con { 123 }
├─ "data"
│   └─ bin { 255, 0, 68, 85 }
├─ "important"
│   └─ val
│      └─ con { !n }
├─ "undefined"
│   └─ con { !u }
├─ "coords"
│   └─ vec
│      ├─ 0: con { 1.1232 }
│      └─ 1: con { 2.1232 }
├─ "tags"
│   └─ arr
│      ├─ [0]: str { "tag1" }
│      └─ [1]: str { "tag2" }
├─ "extension"
│   └─ ext(5)
│      └─ obj
│         └─ "foo"
│             └─ con { "bar" }
├─ "verified"?
│   └─ con { !t }
├─ "signature"?
│   └─ con Uint8Array { 1, 2, 3 }
└─ "label"?
    └─ con { "x78398ks-asdf" }`);
    // console.log(str);
    // const model = Model.create(schema);
    // console.log(model.root.child() + '');
  });

  describe('json', () => {
    const assertSchemasEqual = <A extends NodeBuilder, B extends A>(schema1: A, schema2: B): void => {
      const model1 = Model.create(schema1, 123456789);
      const model2 = Model.create(schema2, 123456789);
      // console.log(model1 + '');
      // console.log(model2 + '');
      expect(model1.toBinary()).toEqual(model2.toBinary());
    };

    test('can create schema out of POJO flat object', () => {
      const schema1 = s.json({
        num: 123,
        numConst: 123 as const,
        str: 'b',
        strConst: 'CONST' as const,
        bool: true,
        nil: null,
        undef: undefined,
      });
      const schema2 = s.obj({
        num: s.con(123),
        numConst: s.con<123>(123 as const),
        str: s.str('b' as string),
        strConst: s.str('CONST' as const),
        bool: s.con(true),
        nil: s.con(null),
        undef: s.con(undefined),
      });
      assertSchemasEqual(schema1, schema2);
      assertSchemasEqual(schema2, schema1);
    });

    test('can create schema out of an array', () => {
      const schema1 = s.json([1, 2, 3, 'a', 'b', true, null, undefined]);
      const schema2 = s.arr([
        s.val(s.con(1)),
        s.val(s.con(2)),
        s.val(s.con(3)),
        s.str('a' as string),
        s.str('b' as string),
        s.val(s.con(true)),
        s.val(s.con(null)),
        s.val(s.con(undefined)),
      ]);
      assertSchemasEqual(schema1, schema2);
      assertSchemasEqual(schema2, schema1);
    });

    test('can create schema out of booleans', () => {
      const schema1 = s.json(true as boolean);
      const schema2 = s.val(s.con(true));
      assertSchemasEqual(schema1, schema2);
      assertSchemasEqual(schema2, schema1);
    });

    test('can nest custom schema', () => {
      const schema1 = s.json({
        num: s.val(s.con(333)),
      });
      const schema2 = s.obj({
        num: s.val(s.con(333)),
      });
      assertSchemasEqual(schema1, schema2);
      assertSchemasEqual(schema2, schema1);
    });

    test('can nest custom schema in "arr"', () => {
      const schema1 = s.json([1, s.con(2)]);
      const schema2 = s.arr([s.val(s.con(1)), s.con(2)]);
      assertSchemasEqual(schema1, schema2);
      assertSchemasEqual(schema2, schema1);
    });

    test('can nest "vec" nodes', () => {
      const schema1 = s.json({
        vec: s.vec(s.con(1), s.con(2), s.con(3)),
      });
      const schema2 = s.obj({
        vec: s.vec(s.con(1), s.con(2), s.con(3)),
      });
      assertSchemasEqual(schema1, schema2);
      assertSchemasEqual(schema2, schema1);
    });
  });
});
