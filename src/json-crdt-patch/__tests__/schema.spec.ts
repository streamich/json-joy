import {Model} from '../../json-crdt/model';
import {type NodeBuilder, s} from '../schema';

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

    test('can create recursive schema with self-reference', () => {
      const User: any = s.obj({
        id: s.str('user123'),
        name: s.str('John'),
      }, {
        friend: () => User,
      });
      
      const model = Model.create(User, 123456789);
      const view = model.view();
      
      expect(view).toEqual({
        id: 'user123',
        name: 'John',
      });
      
      // The friend field should exist in the schema but be undefined in the view
      // since it's optional and not set by default
      expect(model.api.select('', true)?.node.name()).toBe('obj');
      expect(model.api.select('/id', false)?.node.name()).toBe('str');
      expect(model.api.select('/name', false)?.node.name()).toBe('str');
      
      // Can access the friend field through the API even though it's not in the view
      const friendPath = model.api.select('/friend', false);
      expect(friendPath?.node.name()).toBe('obj');
    });

    test('can create binary tree schema with multiple recursive references', () => {
      const Node: any = s.obj({
        key: s.str('root'),
        value: s.str('rootValue'),
      }, {
        left: () => Node,
        right: () => Node,
      });
      
      const model = Model.create(Node, 123456789);
      const view = model.view();
      
      expect(view).toEqual({
        key: 'root',
        value: 'rootValue',
      });
      
      // Verify the schema structure
      expect(model.api.select('', true)?.node.name()).toBe('obj');
      expect(model.api.select('/key', false)?.node.name()).toBe('str');
      expect(model.api.select('/value', false)?.node.name()).toBe('str');
      expect(model.api.select('/left', false)?.node.name()).toBe('obj');
      expect(model.api.select('/right', false)?.node.name()).toBe('obj');
    });

    test('recursive schema should work with nested access', () => {
      const User: any = s.obj({
        id: s.str('user1'),  
        name: s.str('Alice'),
      }, {
        friend: () => User,
      });
      
      const model = Model.create(User, 123456789);
      
      // We should be able to access nested paths even though they're not populated
      expect(model.api.select('/friend/id', false)?.node.name()).toBe('str');
      expect(model.api.select('/friend/name', false)?.node.name()).toBe('str'); 
      expect(model.api.select('/friend/friend', false)?.node.name()).toBe('obj');
      expect(model.api.select('/friend/friend/id', false)?.node.name()).toBe('str');
    });

    test('mixed recursive and non-recursive fields work together', () => {
      const Person: any = s.obj({
        id: s.str('p1'),
        name: s.str('Jane'),
        age: s.con(25),
      }, {
        spouse: () => Person,
        children: s.arr([])
      });
      
      const model = Model.create(Person, 123456789);
      const view = model.view();
      
      expect(view).toEqual({
        id: 'p1',
        name: 'Jane', 
        age: 25,
        children: []
      });
      
      // Verify schema structure
      expect(model.api.select('/spouse', false)?.node.name()).toBe('obj');
      expect(model.api.select('/spouse/id', false)?.node.name()).toBe('str');
      expect(model.api.select('/children', false)?.node.name()).toBe('arr');
    });
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
