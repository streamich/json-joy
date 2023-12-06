import {Type, t} from '..';
import {TypeSystem} from '../../system/TypeSystem';

export const validateTestSuite = (validate: (type: Type, value: unknown) => void) => {
  const system = new TypeSystem();
  system.addCustomValidator({
    name: 'bang',
    fn: (value: unknown) => {
      if (value !== '!') throw new Error('NOT_BANG');
    },
  });

  describe('any', () => {
    test('validates any value', () => {
      const type = t.any;
      validate(type, 123);
      validate(type, false);
      validate(type, null);
      validate(type, {});
      validate(type, [1, 2, 4]);
    });
  });

  describe('const', () => {
    test('exact value of primitives', () => {
      const num = t.Const(123 as const);
      const str = t.Const('asdf' as const);
      const truthy = t.Const(true as const);
      const nil = t.Const<null>(null);
      validate(num, 123);
      expect(() => validate(num, 1234)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
      validate(str, 'asdf');
      expect(() => validate(str, 'asdf_')).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
      validate(truthy, true);
      expect(() => validate(truthy, 1)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
      expect(() => validate(truthy, false)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
      validate(nil, null);
      expect(() => validate(nil, undefined)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
      expect(() => validate(nil, false)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
    });

    test('exact value of primitives', () => {
      const arr = t.Const([1, 2, 3] as const);
      const obj = t.Const({foo: 'bar'} as const);
      validate(arr, [1, 2, 3]);
      expect(() => validate(arr, [1, 2, 3, 4])).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
      validate(obj, {foo: 'bar'});
      expect(() => validate(obj, {foo: 'bar', baz: 'bar'})).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
    });
  });

  describe('undefined', () => {
    test('validates online "undefined" value', () => {
      const type = t.undef;
      validate(type, undefined);
      expect(() => validate(type, false)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
      expect(() => validate(type, null)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
      expect(() => validate(type, 123)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
    });
  });

  describe('null', () => {
    test('validates "null" value', () => {
      const type = t.nil;
      validate(type, null);
      expect(() => validate(type, false)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
      expect(() => validate(type, undefined)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
      expect(() => validate(type, 123)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
    });
  });

  describe('boolean', () => {
    test('validates "boolean" value', () => {
      const type = t.bool;
      validate(type, true);
      validate(type, false);
      expect(() => validate(type, null)).toThrowErrorMatchingInlineSnapshot(`"BOOL"`);
      expect(() => validate(type, undefined)).toThrowErrorMatchingInlineSnapshot(`"BOOL"`);
      expect(() => validate(type, 123)).toThrowErrorMatchingInlineSnapshot(`"BOOL"`);
    });
  });

  describe('number', () => {
    test('validates simple "number" value', () => {
      const type = t.num;
      validate(type, 123);
      validate(type, 456);
      validate(type, 0);
      validate(type, 3.14);
      expect(() => validate(type, null)).toThrowErrorMatchingInlineSnapshot(`"NUM"`);
      expect(() => validate(type, undefined)).toThrowErrorMatchingInlineSnapshot(`"NUM"`);
      expect(() => validate(type, 'asdf')).toThrowErrorMatchingInlineSnapshot(`"NUM"`);
    });

    describe('validates formats', () => {
      describe('i', () => {
        test('cannot be float', () => {
          const type = t.Number({format: 'i'});
          validate(type, 123);
          validate(type, 456);
          validate(type, 0);
          expect(() => validate(type, 3.14)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });

        test('cannot be Infinity', () => {
          const type = t.Number({format: 'i'});
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });
      });

      describe('u', () => {
        test('cannot be float', () => {
          const type = t.Number({format: 'u'});
          validate(type, 123);
          validate(type, 456);
          validate(type, 0);
          expect(() => validate(type, 3.14)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });

        test('cannot be Infinity', () => {
          const type = t.Number({format: 'u'});
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });

        test('cannot be negative', () => {
          const type = t.Number({format: 'u'});
          expect(() => validate(type, -1)).toThrowErrorMatchingInlineSnapshot(`"UINT"`);
        });
      });

      describe('f', () => {
        test('cannot be Infinity', () => {
          const type = t.Number({format: 'f'});
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"NUM"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"NUM"`);
        });
      });

      describe('i8', () => {
        test('should be within bounds', () => {
          const type = t.Number({format: 'i8'});
          validate(type, 123);
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, 128)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -129)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });

        test('cannot be float', () => {
          const type = t.Number({format: 'i8'});
          validate(type, 123);
          expect(() => validate(type, 1.1)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });
      });

      describe('i16', () => {
        test('should be within bounds', () => {
          const type = t.Number({format: 'i16'});
          validate(type, 123);
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, 33333)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -33333)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });

        test('cannot be float', () => {
          const type = t.Number({format: 'i16'});
          validate(type, 123);
          expect(() => validate(type, 1.1)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });
      });

      describe('i32', () => {
        test('should be within bounds', () => {
          const type = t.Number({format: 'i32'});
          validate(type, 0xffff);
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, 0xffffffaa)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -0xffffffab)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });

        test('cannot be float', () => {
          const type = t.Number({format: 'i32'});
          validate(type, 123);
          expect(() => validate(type, 1.1)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });
      });

      describe('i64', () => {
        test('should be within bounds', () => {
          const type = t.Number({format: 'i64'});
          validate(type, 0xffffdfdf);
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });

        test('cannot be float', () => {
          const type = t.Number({format: 'i64'});
          expect(() => validate(type, 1.1)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });
      });

      describe('u8', () => {
        test('should be within bounds', () => {
          const type = t.Number({format: 'u8'});
          validate(type, 255);
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, 256)).toThrowErrorMatchingInlineSnapshot(`"UINT"`);
          expect(() => validate(type, -1)).toThrowErrorMatchingInlineSnapshot(`"UINT"`);
        });

        test('cannot be float', () => {
          const type = t.Number({format: 'u8'});
          expect(() => validate(type, 1.1)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });
      });

      describe('u16', () => {
        test('should be within bounds', () => {
          const type = t.Number({format: 'u16'});
          validate(type, 0xffff);
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, 0xffff + 1)).toThrowErrorMatchingInlineSnapshot(`"UINT"`);
          expect(() => validate(type, -1)).toThrowErrorMatchingInlineSnapshot(`"UINT"`);
        });

        test('cannot be float', () => {
          const type = t.Number({format: 'u16'});
          expect(() => validate(type, 1.1)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });
      });

      describe('u32', () => {
        test('should be within bounds', () => {
          const type = t.Number({format: 'u32'});
          validate(type, 0xffffffff);
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, 0xffffffff + 1)).toThrowErrorMatchingInlineSnapshot(`"UINT"`);
          expect(() => validate(type, -1)).toThrowErrorMatchingInlineSnapshot(`"UINT"`);
        });

        test('cannot be float', () => {
          const type = t.Number({format: 'u32'});
          expect(() => validate(type, 1.1)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });
      });

      describe('u64', () => {
        test('should be within bounds', () => {
          const type = t.Number({format: 'u64'});
          validate(type, 0xffffffffff);
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
          expect(() => validate(type, -1)).toThrowErrorMatchingInlineSnapshot(`"UINT"`);
        });

        test('cannot be float', () => {
          const type = t.Number({format: 'u64'});
          expect(() => validate(type, 1.1)).toThrowErrorMatchingInlineSnapshot(`"INT"`);
        });
      });

      describe('f32', () => {
        test('should be within bounds', () => {
          const type = t.Number({format: 'f32'});
          validate(type, 1.123);
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"NUM"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"NUM"`);
        });
      });

      describe('f64', () => {
        test('should be within bounds', () => {
          const type = t.Number({format: 'f64'});
          validate(type, 1.123);
          expect(() => validate(type, Infinity)).toThrowErrorMatchingInlineSnapshot(`"NUM"`);
          expect(() => validate(type, -Infinity)).toThrowErrorMatchingInlineSnapshot(`"NUM"`);
        });
      });
    });

    describe('bounds', () => {
      test('gt', () => {
        const type = t.Number({gt: 10});
        validate(type, 11);
        expect(() => validate(type, 10)).toThrowErrorMatchingInlineSnapshot(`"GT"`);
      });

      test('lt', () => {
        const type = t.Number({lt: 10});
        validate(type, 9);
        expect(() => validate(type, 10)).toThrowErrorMatchingInlineSnapshot(`"LT"`);
      });

      test('gte', () => {
        const type = t.Number({gte: 10});
        validate(type, 10);
        expect(() => validate(type, 9)).toThrowErrorMatchingInlineSnapshot(`"GTE"`);
      });

      test('lte', () => {
        const type = t.Number({lte: 10});
        validate(type, 10);
        expect(() => validate(type, 11)).toThrowErrorMatchingInlineSnapshot(`"LTE"`);
      });

      test('gt and lt', () => {
        const type = t.Number({gt: 10, lt: 20});
        validate(type, 11);
        expect(() => validate(type, 10)).toThrowErrorMatchingInlineSnapshot(`"GT"`);
        expect(() => validate(type, 20)).toThrowErrorMatchingInlineSnapshot(`"LT"`);
      });
    });
  });

  describe('string', () => {
    test('should be a string', () => {
      const type = t.String();
      validate(type, 'foo');
      expect(() => validate(type, 1)).toThrowErrorMatchingInlineSnapshot(`"STR"`);
    });

    describe('size bounds', () => {
      test('respects min and max', () => {
        const type = t.String({min: 2, max: 4});
        validate(type, 'foo');
        expect(() => validate(type, 'f')).toThrowErrorMatchingInlineSnapshot(`"STR_LEN"`);
        expect(() => validate(type, 'foooo')).toThrowErrorMatchingInlineSnapshot(`"STR_LEN"`);
      });

      test('respects min', () => {
        const type = t.String({min: 2});
        validate(type, 'foo');
        expect(() => validate(type, 'f')).toThrowErrorMatchingInlineSnapshot(`"STR_LEN"`);
      });
    });

    describe('custom validators', () => {
      test('throws if custom validator fails', () => {
        const type = system.t.str.options({validator: ['bang']});
        validate(type, '!');
        expect(() => validate(type, 'foo')).toThrowErrorMatchingInlineSnapshot(`"VALIDATION"`);
      });
    });
  });

  describe('binary', () => {
    test('accepts Uint8Array and Buffer', () => {
      const type = t.bin;
      validate(type, new Uint8Array());
      validate(type, Buffer.from(''));
    });

    test('throws on Uint16Array', () => {
      const type = t.bin;
      expect(() => validate(type, new Uint16Array())).toThrowErrorMatchingInlineSnapshot(`"BIN"`);
    });
  });

  describe('array', () => {
    test('accepts array of "any"', () => {
      const type = t.arr;
      validate(type, []);
    });

    test('validates contained type', () => {
      const type = t.Array(t.str);
      validate(type, []);
      validate(type, ['']);
      validate(type, ['asdf']);
      expect(() => validate(type, [1])).toThrowErrorMatchingInlineSnapshot(`"STR"`);
    });

    describe('size bounds', () => {
      test('respects min and max', () => {
        const type = t.arr.options({min: 2, max: 4});
        validate(type, [1, 2]);
        expect(() => validate(type, [1])).toThrowErrorMatchingInlineSnapshot(`"ARR_LEN"`);
        expect(() => validate(type, [1, 2, 3, 4, 5])).toThrowErrorMatchingInlineSnapshot(`"ARR_LEN"`);
      });

      test('respects min', () => {
        const type = t.arr.options({min: 2});
        validate(type, [1, 2]);
        expect(() => validate(type, [1])).toThrowErrorMatchingInlineSnapshot(`"ARR_LEN"`);
      });
    });
  });

  describe('tuple', () => {
    test('accepts only correct tuples', () => {
      const type = t.Tuple(t.str, t.num);
      validate(type, ['asdf', 123]);
      expect(() => validate(type, ['asdf'])).toThrowErrorMatchingInlineSnapshot(`"TUP"`);
      expect(() => validate(type, ['asdf', '123'])).toThrowErrorMatchingInlineSnapshot(`"NUM"`);
    });
  });

  describe('object', () => {
    test('accepts object of "any"', () => {
      const type = t.obj;
      validate(type, {});
      validate(type, {foo: 'bar'});
    });

    test('checks for required fields', () => {
      const type = t.Object(t.prop('id', t.str), t.propOpt('foo', t.str));
      validate(type, {id: 'asdf'});
      validate(type, {id: 'asdf', foo: 'bar'});
      expect(() => validate(type, {foo: 'bar'})).toThrowErrorMatchingInlineSnapshot(`"STR"`);
    });
  });

  describe('map', () => {
    test('accepts empty object as input', () => {
      const type = t.map;
      validate(type, {});
    });

    test('does not accept empty array as input', () => {
      const type = t.map;
      expect(() => validate(type, [])).toThrow();
    });

    test('validates "any" map', () => {
      const type = t.map;
      validate(type, {
        a: 'str',
        b: 123,
        c: true,
      });
    });

    test('validates contained type', () => {
      const type = t.Map(t.str);
      validate(type, {});
      validate(type, {a: ''});
      validate(type, {b: 'asdf'});
      expect(() => validate(type, {c: 123})).toThrowErrorMatchingInlineSnapshot(`"STR"`);
      expect(() => validate(type, {c: false})).toThrowErrorMatchingInlineSnapshot(`"STR"`);
      expect(() => validate(type, [])).toThrowErrorMatchingInlineSnapshot(`"MAP"`);
    });
  });

  describe('ref', () => {
    test('validates after recursively resolving', () => {
      const t = system.t;
      system.alias('MyNum1', t.num);
      system.alias('MyNum2', t.Ref('MyNum1'));
      const ref = t.Ref('MyNum2');
      validate(ref, 1);
      expect(() => validate(ref, '1')).toThrowErrorMatchingInlineSnapshot(`"REF"`);
    });
  });

  describe('or', () => {
    test('validates "one-of"', () => {
      const or = t.Or(t.str, t.num).options({
        discriminator: [
          'if',
          ['==', 'string', ['type', ['get', '']]],
          0,
          ['if', ['==', 'number', ['type', ['get', '']]], 1, -1],
        ],
      });
      validate(or, 1);
      validate(or, 'a');
      expect(() => validate(or, null)).toThrowErrorMatchingInlineSnapshot(`"OR"`);
    });
  });

  describe('custom validators', () => {
    const system = new TypeSystem();
    const t = system.t;
    system.addCustomValidator({
      name: 'any-only-1',
      fn: (value) => value !== 1,
    });
    system.addCustomValidator({
      name: 'const-only-1',
      fn: (value) => {
        if (value !== 1) throw new Error('not 1');
      },
    });
    system.addCustomValidator({
      name: 'only-false',
      fn: (value) => {
        if (value !== false) throw new Error('not 1');
      },
    });
    system.addCustomValidator({
      name: 'only-2',
      fn: (value) => {
        if (value !== 2) throw new Error('not 1');
      },
    });
    system.addCustomValidator({
      name: 'only-abc',
      fn: (value) => {
        if (value !== 'abc') throw new Error('not 1');
      },
    });
    system.addCustomValidator({
      name: 'len-3',
      fn: (value) => {
        if ((value as any).length !== 3) throw new Error('not 1');
      },
    });
    system.addCustomValidator({
      name: 'noop',
      fn: (value) => {},
    });
    system.addCustomValidator({
      name: 'first-element-1',
      fn: (value) => {
        if ((value as any)[0] !== 1) throw new Error('not 1');
      },
    });
    system.addCustomValidator({
      name: 'foo.is.bar',
      fn: (value) => {
        if ((value as any).foo !== 'bar') throw new Error('not 1');
      },
    });

    test('any', () => {
      const type = t.any.options({validator: ['any-only-1']});
      type.validate(1);
      expect(() => type.validate(2)).toThrow();
    });

    test('const', () => {
      const type = t.Const<2>(2).options({validator: 'const-only-1'});
      expect(() => type.validate(1)).toThrowErrorMatchingInlineSnapshot(`"CONST"`);
      expect(() => type.validate(2)).toThrowErrorMatchingInlineSnapshot(`"VALIDATION"`);
    });

    test('bool', () => {
      const type = t.bool.options({validator: 'only-false'});
      type.validate(false);
      expect(() => type.validate(1)).toThrowErrorMatchingInlineSnapshot(`"BOOL"`);
      expect(() => type.validate(true)).toThrowErrorMatchingInlineSnapshot(`"VALIDATION"`);
    });

    test('num', () => {
      const type = t.num.options({validator: ['only-2']});
      type.validate(2);
      expect(() => type.validate(false)).toThrowErrorMatchingInlineSnapshot(`"NUM"`);
      expect(() => type.validate(1)).toThrowErrorMatchingInlineSnapshot(`"VALIDATION"`);
    });

    test('str', () => {
      const type = t.str.options({validator: ['only-abc']});
      type.validate('abc');
      expect(() => type.validate(123)).toThrowErrorMatchingInlineSnapshot(`"STR"`);
      expect(() => type.validate('xyz')).toThrowErrorMatchingInlineSnapshot(`"VALIDATION"`);
    });

    test('arr', () => {
      const type = t.arr.options({validator: ['len-3']});
      type.validate([1, 2, 3]);
      expect(() => type.validate(123)).toThrowErrorMatchingInlineSnapshot(`"ARR"`);
      expect(() => type.validate([1, 2, 3, 4])).toThrowErrorMatchingInlineSnapshot(`"VALIDATION"`);
    });

    test('tup', () => {
      const type = t.Tuple(t.num).options({validator: ['noop', 'first-element-1']});
      type.validate([1]);
      expect(() => type.validate(123)).toThrowErrorMatchingInlineSnapshot(`"TUP"`);
      expect(() => type.validate([2])).toThrowErrorMatchingInlineSnapshot(`"VALIDATION"`);
    });

    test('obj', () => {
      const type = t.Object(t.prop('foo', t.str)).options({validator: ['noop', 'foo.is.bar', 'noop']});
      type.validate({foo: 'bar'});
      expect(() => type.validate([])).toThrowErrorMatchingInlineSnapshot(`"OBJ"`);
      expect(() => type.validate({foo: 'baz'})).toThrowErrorMatchingInlineSnapshot(`"VALIDATION"`);
    });
  });
};
