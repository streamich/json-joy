import {ArrApi, ConApi, ObjApi, VecApi} from '../../../../json-crdt/model';
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

  // describe('.tag()', () => {
  //   test('basic type', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(3, 8);
  //     const slice = kit.peritext.savedSlices.insOne(range, 'test', {});
  //     expect(slice.tag()).toBe('test');
  //     expect(slice.tag(1)).toBe('test');
  //     expect(slice.tag(2)).toBe('test');
  //   });

  //   test('nested', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, ['ul', 'li', 'p']);
  //     expect(slice.tag()).toEqual('p');
  //     expect(slice.tag(0)).toEqual('ul');
  //     expect(slice.tag(1)).toEqual('li');
  //     expect(slice.tag(2)).toEqual('p');
  //     expect(slice.tag(3)).toEqual('p');
  //     expect(slice.tag(4)).toEqual('p');
  //   });

  //   test('nested with discriminants', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1], ['li', 0], 'p']);
  //     expect(slice.tag()).toEqual('p');
  //     expect(slice.tag(0)).toEqual('ul');
  //     expect(slice.tag(1)).toEqual('li');
  //     expect(slice.tag(2)).toEqual('p');
  //     expect(slice.tag(3)).toEqual('p');
  //     expect(slice.tag(4)).toEqual('p');
  //   });

  //   test('nested with data', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1, {type: 'todo'}], ['li', 0], ['p', 0, {indent: 2}]]);
  //     expect(slice.tag()).toEqual('p');
  //     expect(slice.tag(0)).toEqual('ul');
  //     expect(slice.tag(1)).toEqual('li');
  //     expect(slice.tag(2)).toEqual('p');
  //     expect(slice.tag(3)).toEqual('p');
  //     expect(slice.tag(4)).toEqual('p');
  //   });
  // });

  // describe('.tagDisc()', () => {
  //   test('basic type', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(3, 8);
  //     const slice = kit.peritext.savedSlices.insOne(range, 'test', {});
  //     expect(slice.tagDisc()).toBe(0);
  //     expect(slice.tagDisc(1)).toBe(0);
  //     expect(slice.tagDisc(2)).toBe(0);
  //   });

  //   test('nested', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, ['ul', 'li', 'p']);
  //     expect(slice.tagDisc()).toEqual(0);
  //     expect(slice.tagDisc(0)).toEqual(0);
  //     expect(slice.tagDisc(1)).toEqual(0);
  //     expect(slice.tagDisc(2)).toEqual(0);
  //     expect(slice.tagDisc(3)).toEqual(0);
  //     expect(slice.tagDisc(4)).toEqual(0);
  //   });

  //   test('nested with discriminants', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1], ['li', 0], 'p']);
  //     expect(slice.tagDisc()).toEqual(0);
  //     expect(slice.tagDisc(0)).toEqual(1);
  //     expect(slice.tagDisc(1)).toEqual(0);
  //     expect(slice.tagDisc(2)).toEqual(0);
  //     expect(slice.tagDisc(3)).toEqual(0);
  //     expect(slice.tagDisc(4)).toEqual(0);
  //   });

  //   test('nested with data', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1, {type: 'todo'}], ['li', 0], ['p', 2, {indent: 2}]]);
  //     expect(slice.tagDisc()).toEqual(2);
  //     expect(slice.tagDisc(0)).toEqual(1);
  //     expect(slice.tagDisc(1)).toEqual(0);
  //     expect(slice.tagDisc(2)).toEqual(2);
  //     expect(slice.tagDisc(3)).toEqual(2);
  //     expect(slice.tagDisc(4)).toEqual(2);
  //   });
  // });

  // describe('.tagData()', () => {
  //   test('basic type', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(3, 8);
  //     const slice = kit.peritext.savedSlices.insOne(range, 'test', {});
  //     expect(slice.tagData()).toBe(void 0);
  //     expect(slice.tagData(1)).toBe(void 0);
  //     expect(slice.tagData(2)).toBe(void 0);
  //   });

  //   test('nested', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, ['ul', 'li', 'p']);
  //     expect(slice.tagData()).toEqual(void 0);
  //     expect(slice.tagData(0)).toEqual(void 0);
  //     expect(slice.tagData(1)).toEqual(void 0);
  //     expect(slice.tagData(2)).toEqual(void 0);
  //     expect(slice.tagData(3)).toEqual(void 0);
  //     expect(slice.tagData(4)).toEqual(void 0);
  //   });

  //   test('nested with discriminants', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1], ['li', 0], 'p']);
  //     expect(slice.tagData()).toEqual(void 0);
  //     expect(slice.tagData(0)).toEqual(void 0);
  //     expect(slice.tagData(1)).toEqual(void 0);
  //     expect(slice.tagData(2)).toEqual(void 0);
  //     expect(slice.tagData(3)).toEqual(void 0);
  //     expect(slice.tagData(4)).toEqual(void 0);
  //   });

  //   test('nested with data', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1, {type: 'todo'}], ['li', 0], ['p', 2, {indent: 2}]]);
  //     expect(slice.tagData()).toEqual({indent: 2});
  //     expect(slice.tagData(0)).toEqual({type: 'todo'});
  //     expect(slice.tagData(1)).toEqual(void 0);
  //     expect(slice.tagData(2)).toEqual({indent: 2});
  //     expect(slice.tagData(3)).toEqual({indent: 2});
  //     expect(slice.tagData(4)).toEqual({indent: 2});
  //   });
  // });

  // describe('.typeStepApi()', () => {
  //   test('basic type', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(3, 8);
  //     const slice = kit.peritext.savedSlices.insOne(range, 'test', {});
  //     expect(slice.typeStepApi() instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi(0) instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi(1) instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi(2) instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi()?.view()).toBe('test');
  //     expect(slice.typeStepApi(0)?.view()).toBe('test');
  //     expect(slice.typeStepApi(1)?.view()).toBe('test');
  //     expect(slice.typeStepApi(2)?.view()).toBe('test');
  //   });

  //   test('nested', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, ['ul', 'li', 'p']);
  //     expect(slice.typeStepApi() instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi(0) instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi(1) instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi(2) instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi(3) instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi(4) instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi()!.view()).toBe('p');
  //     expect(slice.typeStepApi(0)!.view()).toBe('ul');
  //     expect(slice.typeStepApi(1)!.view()).toBe('li');
  //     expect(slice.typeStepApi(2)!.view()).toBe('p');
  //     expect(slice.typeStepApi(3)!.view()).toBe('p');
  //     expect(slice.typeStepApi(4)!.view()).toBe('p');
  //   });

  //   test('nested with discriminants', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1], ['li', 0], 'p']);
  //     expect(slice.typeStepApi() instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi(0) instanceof VecApi).toBe(true);
  //     expect(slice.typeStepApi(1) instanceof VecApi).toBe(true);
  //     expect(slice.typeStepApi(2) instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi(3) instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi(4) instanceof ConApi).toBe(true);
  //     expect(slice.typeStepApi()!.view()).toEqual('p');
  //     expect(slice.typeStepApi(0)!.view()).toEqual(['ul', 1]);
  //     expect(slice.typeStepApi(1)!.view()).toEqual(['li', 0]);
  //     expect(slice.typeStepApi(2)!.view()).toEqual('p');
  //     expect(slice.typeStepApi(3)!.view()).toEqual('p');
  //     expect(slice.typeStepApi(4)!.view()).toEqual('p');
  //   });

  //   test('nested with data', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1, {type: 'todo'}], ['li', 0], ['p', 2, {indent: 2}]]);
  //     expect(slice.typeStepApi() instanceof VecApi).toBe(true);
  //     expect(slice.typeStepApi(0) instanceof VecApi).toBe(true);
  //     expect(slice.typeStepApi(1) instanceof VecApi).toBe(true);
  //     expect(slice.typeStepApi(2) instanceof VecApi).toBe(true);
  //     expect(slice.typeStepApi(3) instanceof VecApi).toBe(true);
  //     expect(slice.typeStepApi(4) instanceof VecApi).toBe(true);
  //     expect(slice.typeStepApi()!.view()).toEqual(['p', 2, {indent: 2}]);
  //     expect(slice.typeStepApi(0)!.view()).toEqual(['ul', 1, {type: 'todo'}]);
  //     expect(slice.typeStepApi(1)!.view()).toEqual(['li', 0]);
  //     expect(slice.typeStepApi(2)!.view()).toEqual(['p', 2, {indent: 2}]);
  //     expect(slice.typeStepApi(3)!.view()).toEqual(['p', 2, {indent: 2}]);
  //     expect(slice.typeStepApi(4)!.view()).toEqual(['p', 2, {indent: 2}]);
  //   });
  // });

  // describe('.tagDataNode()', () => {
  //   test('basic type', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(3, 8);
  //     const slice = kit.peritext.savedSlices.insOne(range, 'test', {});
  //     expect(slice.tagDataNode()).toBe(void 0);
  //     expect(slice.tagDataNode(1)).toBe(void 0);
  //     expect(slice.tagDataNode(2)).toBe(void 0);
  //   });

  //   test('nested', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, ['ul', 'li', 'p']);
  //     expect(slice.tagDataNode()).toBe(void 0);
  //     expect(slice.tagDataNode(0)).toBe(void 0);
  //     expect(slice.tagDataNode(1)).toBe(void 0);
  //     expect(slice.tagDataNode(2)).toBe(void 0);
  //     expect(slice.tagDataNode(3)).toBe(void 0);
  //     expect(slice.tagDataNode(4)).toBe(void 0);
  //   });

  //   test('nested with discriminants', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1], ['li', 0], 'p']);
  //     expect(slice.tagDataNode()).toBe(void 0);
  //     expect(slice.tagDataNode(0)).toBe(void 0);
  //     expect(slice.tagDataNode(1)).toBe(void 0);
  //     expect(slice.tagDataNode(2)).toBe(void 0);
  //     expect(slice.tagDataNode(3)).toBe(void 0);
  //     expect(slice.tagDataNode(4)).toBe(void 0);
  //   });

  //   test.only('nested with data', () => {
  //     const kit = setup();
  //     const range = kit.peritext.rangeAt(9);
  //     const slice = kit.peritext.savedSlices.insMarker(range, [['ul', 1, {type: 'todo'}], ['li', 0], ['p', 2, {indent: 2}]]);
  //     console.log(slice.tagDataNode());
  //     expect(slice.tagDataNode() instanceof ObjNode).toBe(true);
  //     // expect(slice.tagDataNode(0) instanceof ObjNode).toBe(true);
  //     // expect(slice.tagDataNode(1)).toBe(void 0);
  //     // expect(slice.tagDataNode(2) instanceof ObjNode).toBe(true);
  //     // expect(slice.tagDataNode(3) instanceof ObjNode).toBe(true);
  //     // expect(slice.tagDataNode()!.view()).toEqual({indent: 2});
  //     // expect(slice.tagDataNode(0)!.view()).toEqual({type: 'todo'});
  //     // expect(slice.tagDataNode(2)!.view()).toEqual({indent: 2});
  //     // expect(slice.tagDataNode(3)!.view()).toEqual({indent: 2});
  //   });
  // });

  describe('.tag()', () => {
    describe('.asVec()', () => {
      test('can convert basic type to a "vec" step', () => {
        const kit = setup();
        const range = kit.peritext.rangeAt(9);
        const slice = kit.peritext.savedSlices.insMarker(range, 'p');
        const node = slice.tag(0).asVec();
        expect(node instanceof VecApi).toBe(true);
        expect(node.view()).toEqual(['p']);
      });

      test('can convert basic type to a "vec" step - 2', () => {
        const kit = setup();
        const range = kit.peritext.rangeAt(9);
        const slice = kit.peritext.savedSlices.insMarker(range, ['p']);
        const node = slice.tag(0).asVec();
        expect(node instanceof VecApi).toBe(true);
        expect(node.view()).toEqual(['p']);
      });

      test('can convert basic type to a "vec" step - 3', () => {
        const kit = setup();
        const range = kit.peritext.rangeAt(9);
        const slice = kit.peritext.savedSlices.insMarker(range, [['p', 0]]);
        const node = slice.tag(0).asVec();
        expect(node instanceof VecApi).toBe(true);
        expect(node.view()).toEqual(['p', 0]);
      });
    });

    describe('.data()', () => {
      test('creates empty {} object, when not provided', () => {
        const kit = setup();
        const range = kit.peritext.rangeAt(9);
        const slice = kit.peritext.savedSlices.insMarker(range, 'p');
        const node = slice.tag(0).data();
        expect(node instanceof ObjApi).toBe(true);
        expect(node.view()).toEqual({});
      });

      test('converts node to "obj", if not already "obj', () => {
        const kit = setup();
        const range = kit.peritext.rangeAt(9);
        const slice = kit.peritext.savedSlices.insMarker(range, [['p', 0, [] as any]]);
        const node = slice.tag(0).data();
        expect(node instanceof ObjApi).toBe(true);
        expect(node.view()).toEqual({});
      });

      test('returns existing data node', () => {
        const kit = setup();
        const range = kit.peritext.rangeAt(9);
        const slice = kit.peritext.savedSlices.insMarker(range, [['blockquote', 0, {foo: 'bar'}], ['p', 0, {indent: 2}]]);
        const obj0 = slice.tag(0).data();
        const obj1 = slice.tag(1).data();
        const obj2 = slice.tag(2).data();
        expect(obj0.view()).toEqual({foo: 'bar'});
        expect(obj1.view()).toEqual({indent: 2});
        expect(obj2.view()).toEqual({indent: 2});
      });
    });
  });
});
