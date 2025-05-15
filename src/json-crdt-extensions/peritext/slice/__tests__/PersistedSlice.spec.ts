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
  expect(slice.type).toBe(0);
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
    expect(slice.type).toBe(1);
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
