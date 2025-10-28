import {ObjApi, VecApi} from '../../../../json-crdt/model';
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
  expect(slice.isMarker()).toBe(true);
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
      const slice = kit.peritext.savedSlices.insMarker(range, [
        ['ul', 1, {type: 'todo'}],
        ['li', 0],
        ['p', 0, {indent: 2}],
      ]);
      expect(slice.type()).toEqual([
        ['ul', 1, {type: 'todo'}],
        ['li', 0],
        ['p', 0, {indent: 2}],
      ]);
    });
  });

  describe('.nestedType()', () => {
    describe('.tag()', () => {
      test('can read name, discriminant, and data', () => {
        const kit = setup();
        const range = kit.peritext.rangeAt(9);
        const slice = kit.peritext.savedSlices.insMarker(range, [
          ['note'] as any,
          ['blockquote', 1, {foo: 'bar'}],
          ['p', 2, {indent: 2}],
        ]);
        const tag0 = slice.nestedType().tag(0);
        const tag1 = slice.nestedType().tag(1);
        const tag2 = slice.nestedType().tag(2);
        const tag3 = slice.nestedType().tag(3);
        expect(tag0.name()).toBe('note');
        expect(tag0.discriminant()).toBe(0);
        expect(tag0.data().view()).toEqual({});
        expect(tag0.name()).toBe('note');
        expect(tag0.discriminant()).toBe(0);
        expect(tag1.name()).toBe('blockquote');
        expect(tag1.discriminant()).toBe(1);
        expect(tag1.data().view()).toEqual({foo: 'bar'});
        expect(tag2.name()).toBe('p');
        expect(tag2.discriminant()).toBe(2);
        expect(tag2.data().view()).toEqual({indent: 2});
        expect(tag3.name()).toBe('p');
        expect(tag3.discriminant()).toBe(2);
        expect(tag3.data().view()).toEqual({indent: 2});
      });

      describe('.asVec()', () => {
        test('can convert basic type to a "vec" step', () => {
          const kit = setup();
          const range = kit.peritext.rangeAt(9);
          const slice = kit.peritext.savedSlices.insMarker(range, 'p');
          const node = slice.nestedType().tag(0).asVec();
          expect(node instanceof VecApi).toBe(true);
          expect(node.view()).toEqual(['p']);
        });

        test('can convert basic type to a "vec" step - 2', () => {
          const kit = setup();
          const range = kit.peritext.rangeAt(9);
          const slice = kit.peritext.savedSlices.insMarker(range, ['p']);
          const node = slice.nestedType().tag(0).asVec();
          expect(node instanceof VecApi).toBe(true);
          expect(node.view()).toEqual(['p']);
        });

        test('can convert basic type to a "vec" step - 3', () => {
          const kit = setup();
          const range = kit.peritext.rangeAt(9);
          const slice = kit.peritext.savedSlices.insMarker(range, [['p', 0]]);
          const node = slice.nestedType().tag(0).asVec();
          expect(node instanceof VecApi).toBe(true);
          expect(node.view()).toEqual(['p', 0]);
        });
      });

      describe('.data()', () => {
        test('creates empty {} object, when not provided', () => {
          const kit = setup();
          const range = kit.peritext.rangeAt(9);
          const slice = kit.peritext.savedSlices.insMarker(range, 'p');
          const node = slice.nestedType().tag(0).data();
          expect(node instanceof ObjApi).toBe(true);
          expect(node.view()).toEqual({});
        });

        test('converts node to "obj", if not already "obj', () => {
          const kit = setup();
          const range = kit.peritext.rangeAt(9);
          const slice = kit.peritext.savedSlices.insMarker(range, [['p', 0, [] as any]]);
          const node = slice.nestedType().tag(0).data();
          expect(node instanceof ObjApi).toBe(true);
          expect(node.view()).toEqual({});
        });

        test('returns existing data node', () => {
          const kit = setup();
          const range = kit.peritext.rangeAt(9);
          const slice = kit.peritext.savedSlices.insMarker(range, [
            ['blockquote', 0, {foo: 'bar'}],
            ['p', 1, {indent: 2}],
          ]);
          const obj0 = slice.nestedType().tag(0).data();
          const obj1 = slice.nestedType().tag(1).data();
          const obj2 = slice.nestedType().tag(2).data();
          expect(obj0.view()).toEqual({foo: 'bar'});
          expect(obj1.view()).toEqual({indent: 2});
          expect(obj2.view()).toEqual({indent: 2});
        });
      });
    });
  });
});
