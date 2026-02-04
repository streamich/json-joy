import {Model} from '../Model';
import {s} from '../../../json-crdt-patch';
import {ConNode, ValNode, ObjNode, VecNode, ArrNode, StrNode, BinNode} from '../../nodes';
import {assertParents} from './util';

describe('JsonNode.parent', () => {
  describe('root node', () => {
    test('root node has no parent', () => {
      const model = Model.create(s.obj({foo: s.str('bar')}));
      model.api.flush();
      expect(model.root.parent).toBe(undefined);
    });

    test('root node parent remains undefined after changes', () => {
      const model = Model.create(s.str('hello'));
      model.api.flush();
      model.api.str([]).ins(5, ' world');
      expect(model.root.parent).toBe(undefined);
    });
  });

  describe('all nodes have parent', () => {
    test('"str" node has parent', () => {
      const model = Model.create(s.str('hello'));
      model.api.flush();
      const strNode = model.root.node();
      expect(strNode).toBeInstanceOf(StrNode);
      expect(strNode.parent).toBe(model.root);
    });

    test('"con" node has parent', () => {
      const model = Model.create(s.con(42));
      model.api.flush();
      const conNode = model.root.node();
      expect(conNode).toBeInstanceOf(ConNode);
      expect(conNode.parent).toBe(model.root);
    });

    test('"obj" node has parent', () => {
      const model = Model.create(s.obj({key: s.str('value')}));
      model.api.flush();
      const objNode = model.root.node();
      expect(objNode).toBeInstanceOf(ObjNode);
      expect(objNode.parent).toBe(model.root);
    });

    test('"val" node has parent', () => {
      const model = Model.create(s.obj({nested: s.val(s.str('inner'))}));
      model.api.flush();
      const objNode = model.root.node() as ObjNode;
      const valNode = objNode.get('nested');
      expect(valNode).toBeInstanceOf(ValNode);
      expect(valNode!.parent).toBe(objNode);
    });

    test('"vec" node has parent', () => {
      const model = Model.create(s.obj({tuple: s.vec(s.str('a'), s.str('b'))}));
      model.api.flush();
      const objNode = model.root.node() as ObjNode;
      const vecNode = objNode.get('tuple');
      expect(vecNode).toBeInstanceOf(VecNode);
      expect(vecNode!.parent).toBe(objNode);
    });

    test('"arr" node has parent', () => {
      const model = Model.create(s.obj({list: s.arr([s.str('item')])}));
      model.api.flush();
      const objNode = model.root.node() as ObjNode;
      const arrNode = objNode.get('list');
      expect(arrNode).toBeInstanceOf(ArrNode);
      expect(arrNode!.parent).toBe(objNode);
    });

    test('"bin" node has parent', () => {
      const model = Model.create(s.obj({data: s.bin(new Uint8Array([1, 2, 3]))}));
      model.api.flush();
      const objNode = model.root.node() as ObjNode;
      const binNode = objNode.get('data');
      expect(binNode).toBeInstanceOf(BinNode);
      expect(binNode!.parent).toBe(objNode);
    });
  });

  describe('nested structures', () => {
    test('deeply nested nodes have correct parents', () => {
      const model = Model.create(
        s.obj({
          level1: s.obj({
            level2: s.obj({
              level3: s.str('deep'),
            }),
          }),
        }),
      );
      model.api.flush();

      assertParents(model);

      const level1 = (model.root.node() as ObjNode).get('level1') as ObjNode;
      const level2 = level1.get('level2') as ObjNode;
      const level3 = level2.get('level3') as StrNode;

      expect(level1.parent).toBe(model.root.node());
      expect(level2.parent).toBe(level1);
      expect(level3.parent).toBe(level2);
    });

    test('can traverse parents all the way to root', () => {
      const model = Model.create(
        s.obj({
          a: s.obj({
            b: s.obj({
              c: s.obj({
                d: s.str('leaf'),
              }),
            }),
          }),
        }),
      );
      model.s.a.b.$.set({x: 'y'} as any);
      assertParents(model);
    });
  });

  describe('parent changes on LWW value change', () => {
    test('val node child parent changes when value is replaced', () => {
      const model = Model.create(s.obj({register: s.val(s.str('first'))}));
      model.api.flush();
      assertParents(model);
      const objNode = model.root.node() as ObjNode;
      const valNode = objNode.get('register') as ValNode;
      const firstStr = valNode.node() as StrNode;
      expect(firstStr.parent).toBe(valNode);
      // Replace the value
      model.api.val(['register']).set(s.str('second'));
      assertParents(model);
      const secondStr = valNode.node() as StrNode;
      expect(secondStr).not.toBe(firstStr);
      expect(secondStr.parent).toBe(valNode);
      // Old node's parent should be cleared (but node is garbage collected)
    });

    test('obj node child parent changes when key is overwritten', () => {
      const model = Model.create(s.obj({key: s.str('old')}));
      model.api.flush();
      assertParents(model);
      const objNode = model.root.node() as ObjNode;
      const oldStr = objNode.get('key') as StrNode;
      expect(oldStr.parent).toBe(objNode);
      // Overwrite the key
      model.api.obj([]).set({key: s.str('new')});
      assertParents(model);
      const newStr = objNode.get('key') as StrNode;
      expect(newStr).not.toBe(oldStr);
      expect(newStr.parent).toBe(objNode);
    });

    test('vec node child parent changes when element is replaced', () => {
      const model = Model.create(s.vec(s.str('first'), s.str('second')));
      model.api.flush();
      const vecNode = model.root.node() as VecNode;
      const firstElement = vecNode.get(0) as StrNode;
      expect(firstElement.parent).toBe(vecNode);
      // Replace element at index 0
      model.api.vec([]).set([[0, s.str('replaced')]]);
      const replacedElement = vecNode.get(0) as StrNode;
      expect(replacedElement).not.toBe(firstElement);
      expect(replacedElement.parent).toBe(vecNode);
    });
  });

  describe('parent changes on arr RGA node element changes', () => {
    test('arr node elements have parent set on insert', () => {
      const model = Model.create(s.arr([s.str('one')]));
      model.api.flush();
      assertParents(model);
      const arrNode = model.root.node() as ArrNode;
      const firstElement = arrNode.getNode(0);
      expect(firstElement).toBeInstanceOf(StrNode);
      expect(firstElement!.parent).toBe(arrNode);
      model.api.arr([]).ins(1, [s.str('two')]);
      assertParents(model);
      const secondElement = arrNode.getNode(1);
      expect(secondElement).toBeInstanceOf(StrNode);
      expect(secondElement!.parent).toBe(arrNode);
    });

    test('arr node element parent changes on update', () => {
      const model = Model.create(s.arr([s.str('original')]));
      model.api.flush();
      const arrNode = model.root.node() as ArrNode;
      const originalElement = arrNode.getNode(0) as StrNode;
      expect(originalElement.parent).toBe(arrNode);
      assertParents(model);
      model.api.arr([]).upd(0, 'updated');
      assertParents(model);
      const updatedElement = arrNode.getNode(0);
      expect(updatedElement).not.toBe(originalElement);
      expect(updatedElement!.parent).toBe(arrNode);
    });

    test('multiple arr inserts all have correct parent', () => {
      const model = Model.create(s.arr([]));
      model.api.flush();
      const arrNode = model.root.node() as ArrNode;
      assertParents(model);
      model.api.arr([]).ins(0, [s.str('a'), s.str('b'), s.str('c')]);
      assertParents(model);
      for (let i = 0; i < 3; i++) {
        const element = arrNode.getNode(i);
        expect(element!.parent).toBe(arrNode);
      }
    });
  });

  describe('rebuildParentLinks', () => {
    test('rebuildParentLinks correctly sets all parents', () => {
      const model = Model.create(
        s.obj({
          str: s.str('hello'),
          arr: s.arr([s.con(1), s.con(2)]),
          nested: s.obj({
            inner: s.str('world'),
          }),
        }),
      );
      model.api.flush();

      // Clear all parent links manually
      model.index.forEach(({v: node}) => {
        node.parent = undefined;
      });
      model.root.parent = undefined;

      // Verify parents are cleared
      const objNode = model.root.node() as ObjNode;
      expect(objNode.parent).toBe(undefined);

      // Rebuild
      expect(() => assertParents(model)).toThrow();
      model.linkParents();
      assertParents(model);
    });
  });

  describe('.fork() and .clone()', () => {
    test('forked model has parent links', () => {
      const model = Model.create(s.obj({key: s.str('value')}));
      model.api.flush();
      assertParents(model);
      const forked = model.fork();
      assertParents(forked);
    });
  });

  describe('.reset()', () => {
    test('reset model has correct parent links', () => {
      const model1 = Model.create();
      model1.api.set({foo: 'bar'});
      assertParents(model1);
      const model2 = Model.create();
      model2.api.set({
        nested: {
          deep: [1, 2],
        },
      });
      assertParents(model1);
      assertParents(model2);
      model2.reset(model1);
      assertParents(model1);
      assertParents(model2);
      expect(model2.view()).toEqual({foo: 'bar'});
    });

    test('reset to more complex structure has correct parent links', () => {
      const simple = Model.create();
      simple.api.set('simple');
      assertParents(simple);
      const complex = Model.create();
      complex.api.set({
        a: {
          b: {
            c: 'deep',
          },
        },
        arr: ['one', 'two'],
        val: 42,
      });
      assertParents(simple);
      assertParents(complex);
      simple.reset(complex);
      assertParents(simple);
      assertParents(simple);
      expect(simple.view()).toEqual(complex.view());
    });

    test('reset from fork', () => {
      const model1 = Model.create();
      model1.api.set({foo: 'bar'});
      assertParents(model1);
      const model2 = model1.fork();
      assertParents(model2);
      model2.api.obj([]).set({baz: {qux: 'quux'}});
      assertParents(model1);
      assertParents(model2);
      model1.reset(model2);
      assertParents(model1);
      assertParents(model2);
      expect(model1.view()).toEqual({
        foo: 'bar',
        baz: {qux: 'quux'},
      });
      expect(model2.view()).toEqual({
        foo: 'bar',
        baz: {qux: 'quux'},
      });
    });
  });
});
