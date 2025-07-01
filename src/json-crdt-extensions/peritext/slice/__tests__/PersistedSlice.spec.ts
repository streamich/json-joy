import {ArrNode, ConNode, ObjNode, VecNode} from '../../../../json-crdt/nodes';
import {SliceStacking} from '../constants';
import {setup} from './setup';

const setupSlice = () => {
  const deps = setup();
  const range = deps.peritext.rangeAt(2, 3);
  const slice = deps.peritext.savedSlices.insMarker(range, 0);
  return {...deps, range, slice};
};

test('can read slice data', () => {
  const {range, slice} = setupSlice();
  expect(slice.isSplit()).toBe(true);
  expect(slice.stacking).toBe(SliceStacking.Marker);
  expect(slice.type()).toBe(0);
  expect(slice.data()).toBe(undefined);
  expect(slice.start).not.toBe(range.start);
  expect(slice.start.cmp(range.start)).toBe(0);
  expect(slice.end).not.toBe(range.end);
  expect(slice.end.cmp(range.end)).toBe(0);
});

describe('.update()', () => {
  const testUpdate = (name: string, update: (deps: ReturnType<typeof setupSlice>) => void) => {
    test('can update: ' + name, () => {
      const deps = setupSlice();
      const {slice} = deps;
      const hash1 = slice.refresh();
      const hash2 = slice.refresh();
      expect(hash1).toBe(hash2);
      update(deps);
      const hash3 = slice.refresh();
      expect(hash3).not.toBe(hash2);
    });
  };

  testUpdate('stacking', ({slice}) => {
    slice.update({stacking: SliceStacking.Erase});
    expect(slice.stacking).toBe(SliceStacking.Erase);
  });

  testUpdate('type', ({slice}) => {
    slice.update({type: 1});
    expect(slice.type()).toBe(1);
  });

  testUpdate('data', ({slice}) => {
    slice.update({data: 123});
    expect(slice.data()).toBe(123);
  });

  testUpdate('range', ({peritext, slice}) => {
    const range2 = peritext.rangeAt(0, 1);
    slice.update({range: range2});
    expect(slice.cmp(range2)).toBe(0);
  });
});

describe('.del() and .isDel()', () => {
  test('can delete a slice', () => {
    const {peritext, slice} = setupSlice();
    expect(peritext.model.view().slices.length).toBe(1);
    expect(slice.isDel()).toBe(false);
    const slice2 = peritext.savedSlices.get(slice.id)!;
    expect(peritext.model.view().slices.length).toBe(1);
    expect(slice2.isDel()).toBe(false);
    expect(slice2).toBe(slice);
    peritext.savedSlices.del(slice.id);
    expect(peritext.model.view().slices.length).toBe(0);
    expect(slice.isDel()).toBe(true);
    expect(slice2.isDel()).toBe(true);
    const slice3 = peritext.savedSlices.get(slice.id);
    expect(slice3).toBe(undefined);
  });
});

describe('type retrieval an manipulation', () => {
  describe('.type()', () => {
    test('basic type', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(3, 8);
      const slice = kit.peritext.savedSlices.insOne(range, 'test', {});
      expect(slice.type()).toBe('test');
    });

    test('nested', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, ['ul', 'li', 'p']);
      expect(slice.type()).toEqual(['ul', 'li', 'p']);
    });

    test('nested with discriminants', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1], ['li', 0], 'p']);
      expect(slice.type()).toEqual([['ul', 1], ['li', 0], 'p']);
    });

    test('nested with data', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1, {type: 'todo'}], ['li', 0], ['p', 0, {indent: 2}]]);
      expect(slice.type()).toEqual([['ul', 1, {type: 'todo'}], ['li', 0], ['p', 0, {indent: 2}]]);
    });
  });

  describe('.typeNodeAsArr()', () => {
    test('can convert basic type to an "arr" node', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, 'p');
      const node = slice.typeNodeAsArr();
      expect(node instanceof ArrNode).toBe(true);
      expect(node.view()).toEqual(['p']);
    });

    test('returns existing type node if already of "arr" type', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, ['p']);
      const node1 = slice.typeNode();
      const node2 = slice.typeNodeAsArr();
      expect(node2).toBe(node1);
    });
  });

  describe('.tag()', () => {
    test('basic type', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(3, 8);
      const slice = kit.peritext.savedSlices.insOne(range, 'test', {});
      expect(slice.tag()).toBe('test');
      expect(slice.tag(1)).toBe('test');
      expect(slice.tag(2)).toBe('test');
    });

    test('nested', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, ['ul', 'li', 'p']);
      expect(slice.tag()).toEqual('p');
      expect(slice.tag(0)).toEqual('ul');
      expect(slice.tag(1)).toEqual('li');
      expect(slice.tag(2)).toEqual('p');
      expect(slice.tag(3)).toEqual('p');
      expect(slice.tag(4)).toEqual('p');
    });

    test('nested with discriminants', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1], ['li', 0], 'p']);
      expect(slice.tag()).toEqual('p');
      expect(slice.tag(0)).toEqual('ul');
      expect(slice.tag(1)).toEqual('li');
      expect(slice.tag(2)).toEqual('p');
      expect(slice.tag(3)).toEqual('p');
      expect(slice.tag(4)).toEqual('p');
    });

    test('nested with data', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1, {type: 'todo'}], ['li', 0], ['p', 0, {indent: 2}]]);
      expect(slice.tag()).toEqual('p');
      expect(slice.tag(0)).toEqual('ul');
      expect(slice.tag(1)).toEqual('li');
      expect(slice.tag(2)).toEqual('p');
      expect(slice.tag(3)).toEqual('p');
      expect(slice.tag(4)).toEqual('p');
    });
  });

  describe('.tagDisc()', () => {
    test('basic type', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(3, 8);
      const slice = kit.peritext.savedSlices.insOne(range, 'test', {});
      expect(slice.tagDisc()).toBe(0);
      expect(slice.tagDisc(1)).toBe(0);
      expect(slice.tagDisc(2)).toBe(0);
    });

    test('nested', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, ['ul', 'li', 'p']);
      expect(slice.tagDisc()).toEqual(0);
      expect(slice.tagDisc(0)).toEqual(0);
      expect(slice.tagDisc(1)).toEqual(0);
      expect(slice.tagDisc(2)).toEqual(0);
      expect(slice.tagDisc(3)).toEqual(0);
      expect(slice.tagDisc(4)).toEqual(0);
    });

    test('nested with discriminants', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1], ['li', 0], 'p']);
      expect(slice.tagDisc()).toEqual(0);
      expect(slice.tagDisc(0)).toEqual(1);
      expect(slice.tagDisc(1)).toEqual(0);
      expect(slice.tagDisc(2)).toEqual(0);
      expect(slice.tagDisc(3)).toEqual(0);
      expect(slice.tagDisc(4)).toEqual(0);
    });

    test('nested with data', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1, {type: 'todo'}], ['li', 0], ['p', 2, {indent: 2}]]);
      expect(slice.tagDisc()).toEqual(2);
      expect(slice.tagDisc(0)).toEqual(1);
      expect(slice.tagDisc(1)).toEqual(0);
      expect(slice.tagDisc(2)).toEqual(2);
      expect(slice.tagDisc(3)).toEqual(2);
      expect(slice.tagDisc(4)).toEqual(2);
    });
  });

  describe('.tagData()', () => {
    test('basic type', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(3, 8);
      const slice = kit.peritext.savedSlices.insOne(range, 'test', {});
      expect(slice.tagData()).toBe(void 0);
      expect(slice.tagData(1)).toBe(void 0);
      expect(slice.tagData(2)).toBe(void 0);
    });

    test('nested', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, ['ul', 'li', 'p']);
      expect(slice.tagData()).toEqual(void 0);
      expect(slice.tagData(0)).toEqual(void 0);
      expect(slice.tagData(1)).toEqual(void 0);
      expect(slice.tagData(2)).toEqual(void 0);
      expect(slice.tagData(3)).toEqual(void 0);
      expect(slice.tagData(4)).toEqual(void 0);
    });

    test('nested with discriminants', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1], ['li', 0], 'p']);
      expect(slice.tagData()).toEqual(void 0);
      expect(slice.tagData(0)).toEqual(void 0);
      expect(slice.tagData(1)).toEqual(void 0);
      expect(slice.tagData(2)).toEqual(void 0);
      expect(slice.tagData(3)).toEqual(void 0);
      expect(slice.tagData(4)).toEqual(void 0);
    });

    test('nested with data', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1, {type: 'todo'}], ['li', 0], ['p', 2, {indent: 2}]]);
      expect(slice.tagData()).toEqual({indent: 2});
      expect(slice.tagData(0)).toEqual({type: 'todo'});
      expect(slice.tagData(1)).toEqual(void 0);
      expect(slice.tagData(2)).toEqual({indent: 2});
      expect(slice.tagData(3)).toEqual({indent: 2});
      expect(slice.tagData(4)).toEqual({indent: 2});
    });
  });

  describe('.typeStepNode()', () => {
    test('basic type', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(3, 8);
      const slice = kit.peritext.savedSlices.insOne(range, 'test', {});
      expect(slice.typeStepNode() instanceof ConNode).toBe(true);
      expect(slice.typeStepNode(0) instanceof ConNode).toBe(true);
      expect(slice.typeStepNode(1) instanceof ConNode).toBe(true);
      expect(slice.typeStepNode(2) instanceof ConNode).toBe(true);
      expect(slice.typeStepNode()?.view()).toBe('test');
      expect(slice.typeStepNode(0)?.view()).toBe('test');
      expect(slice.typeStepNode(1)?.view()).toBe('test');
      expect(slice.typeStepNode(2)?.view()).toBe('test');
    });

    test('nested', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, ['ul', 'li', 'p']);
      expect(slice.typeStepNode() instanceof ConNode).toBe(true);
      expect(slice.typeStepNode(0) instanceof ConNode).toBe(true);
      expect(slice.typeStepNode(1) instanceof ConNode).toBe(true);
      expect(slice.typeStepNode(2) instanceof ConNode).toBe(true);
      expect(slice.typeStepNode(3) instanceof ConNode).toBe(true);
      expect(slice.typeStepNode(4) instanceof ConNode).toBe(true);
      expect(slice.typeStepNode()!.view()).toBe('p');
      expect(slice.typeStepNode(0)!.view()).toBe('ul');
      expect(slice.typeStepNode(1)!.view()).toBe('li');
      expect(slice.typeStepNode(2)!.view()).toBe('p');
      expect(slice.typeStepNode(3)!.view()).toBe('p');
      expect(slice.typeStepNode(4)!.view()).toBe('p');
    });

    test('nested with discriminants', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1], ['li', 0], 'p']);
      expect(slice.typeStepNode() instanceof ConNode).toBe(true);
      expect(slice.typeStepNode(0) instanceof VecNode).toBe(true);
      expect(slice.typeStepNode(1) instanceof VecNode).toBe(true);
      expect(slice.typeStepNode(2) instanceof ConNode).toBe(true);
      expect(slice.typeStepNode(3) instanceof ConNode).toBe(true);
      expect(slice.typeStepNode(4) instanceof ConNode).toBe(true);
      expect(slice.typeStepNode()!.view()).toEqual('p');
      expect(slice.typeStepNode(0)!.view()).toEqual(['ul', 1]);
      expect(slice.typeStepNode(1)!.view()).toEqual(['li', 0]);
      expect(slice.typeStepNode(2)!.view()).toEqual('p');
      expect(slice.typeStepNode(3)!.view()).toEqual('p');
      expect(slice.typeStepNode(4)!.view()).toEqual('p');
    });

    test('nested with data', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1, {type: 'todo'}], ['li', 0], ['p', 2, {indent: 2}]]);
      expect(slice.typeStepNode() instanceof VecNode).toBe(true);
      expect(slice.typeStepNode(0) instanceof VecNode).toBe(true);
      expect(slice.typeStepNode(1) instanceof VecNode).toBe(true);
      expect(slice.typeStepNode(2) instanceof VecNode).toBe(true);
      expect(slice.typeStepNode(3) instanceof VecNode).toBe(true);
      expect(slice.typeStepNode(4) instanceof VecNode).toBe(true);
      expect(slice.typeStepNode()!.view()).toEqual(['p', 2, {indent: 2}]);
      expect(slice.typeStepNode(0)!.view()).toEqual(['ul', 1, {type: 'todo'}]);
      expect(slice.typeStepNode(1)!.view()).toEqual(['li', 0]);
      expect(slice.typeStepNode(2)!.view()).toEqual(['p', 2, {indent: 2}]);
      expect(slice.typeStepNode(3)!.view()).toEqual(['p', 2, {indent: 2}]);
      expect(slice.typeStepNode(4)!.view()).toEqual(['p', 2, {indent: 2}]);
    });
  });

  describe('.tagDataNode()', () => {
    test('basic type', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(3, 8);
      const slice = kit.peritext.savedSlices.insOne(range, 'test', {});
      expect(slice.tagDataNode()).toBe(void 0);
      expect(slice.tagDataNode(1)).toBe(void 0);
      expect(slice.tagDataNode(2)).toBe(void 0);
    });

    test('nested', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, ['ul', 'li', 'p']);
      expect(slice.tagDataNode()).toBe(void 0);
      expect(slice.tagDataNode(0)).toBe(void 0);
      expect(slice.tagDataNode(1)).toBe(void 0);
      expect(slice.tagDataNode(2)).toBe(void 0);
      expect(slice.tagDataNode(3)).toBe(void 0);
      expect(slice.tagDataNode(4)).toBe(void 0);
    });

    test('nested with discriminants', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1], ['li', 0], 'p']);
      expect(slice.tagDataNode()).toBe(void 0);
      expect(slice.tagDataNode(0)).toBe(void 0);
      expect(slice.tagDataNode(1)).toBe(void 0);
      expect(slice.tagDataNode(2)).toBe(void 0);
      expect(slice.tagDataNode(3)).toBe(void 0);
      expect(slice.tagDataNode(4)).toBe(void 0);
    });

    test('nested with data', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1, {type: 'todo'}], ['li', 0], ['p', 2, {indent: 2}]]);
      expect(slice.tagDataNode() instanceof ObjNode).toBe(true);
      expect(slice.tagDataNode(0) instanceof ObjNode).toBe(true);
      expect(slice.tagDataNode(1)).toBe(void 0);
      expect(slice.tagDataNode(2) instanceof ObjNode).toBe(true);
      expect(slice.tagDataNode(3) instanceof ObjNode).toBe(true);
      expect(slice.tagDataNode()!.view()).toEqual({indent: 2});
      expect(slice.tagDataNode(0)!.view()).toEqual({type: 'todo'});
      expect(slice.tagDataNode(2)!.view()).toEqual({indent: 2});
      expect(slice.tagDataNode(3)!.view()).toEqual({indent: 2});
    });
  });
});
