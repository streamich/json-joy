import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Range} from '../../rga/Range';
import {Anchor} from '../../rga/constants';
import {PersistedSlice} from '../PersistedSlice';
import {SliceBehavior} from '../constants';
import {setup} from './setup';

test('initially slice list is empty', () => {
  const {peritext} = setup();
  expect(peritext.slices.size()).toBe(0);
  peritext.refresh();
  expect(peritext.slices.size()).toBe(0);
});

describe('.ins()', () => {
  test('can insert a slice', () => {
    const {peritext, slices} = setup();
    const range = peritext.rangeAt(12, 7);
    const slice = slices.ins(range, SliceBehavior.Stack, 'b', {bold: true});
    expect(peritext.slices.size()).toBe(1);
    expect(slice.start).toStrictEqual(range.start);
    expect(slice.end).toStrictEqual(range.end);
    expect(slice.behavior).toBe(SliceBehavior.Stack);
    expect(slice.type).toBe('b');
    expect(slice.data()).toStrictEqual({bold: true});
  });

  test('can insert two slices', () => {
    const {peritext} = setup();
    const {editor} = peritext;
    editor.cursor.setAt(6, 5);
    const slice1 = editor.insStackSlice('strong', {bold: true});
    editor.cursor.setAt(12, 4);
    const slice2 = editor.insStackSlice('i', {italic: true});
    peritext.refresh();
    expect(peritext.slices.size()).toBe(2);
    expect(slice1.data()).toStrictEqual({bold: true});
    expect(slice2.data()).toStrictEqual({italic: true});
  });

  test('updates hash on slice insert', () => {
    const {peritext} = setup();
    const {editor} = peritext;
    const changed1 = peritext.slices.hash !== peritext.slices.refresh();
    const hash1 = peritext.slices.hash;
    const changed2 = peritext.slices.hash !== peritext.slices.refresh();
    const hash2 = peritext.slices.hash;
    expect(changed1).toBe(true);
    expect(changed2).toBe(false);
    expect(hash1).toBe(hash2);
    editor.cursor.setAt(12, 7);
    editor.insStackSlice('b', {bold: true});
    const changed3 = peritext.slices.hash !== peritext.slices.refresh();
    const hash3 = peritext.slices.hash;
    const changed4 = peritext.slices.hash !== peritext.slices.refresh();
    const hash4 = peritext.slices.hash;
    expect(changed3).toBe(true);
    expect(changed4).toBe(false);
    expect(hash1).not.toStrictEqual(hash3);
    expect(hash3).toBe(hash4);
    editor.cursor.setAt(12, 4);
    editor.insStackSlice('em', {italic: true});
    const changed5 = peritext.slices.hash !== peritext.slices.refresh();
    const hash5 = peritext.slices.hash;
    const changed6 = peritext.slices.hash !== peritext.slices.refresh();
    const hash6 = peritext.slices.hash;
    expect(changed5).toBe(true);
    expect(changed6).toBe(false);
    expect(hash3).not.toBe(hash5);
    expect(hash5).toBe(hash6);
  });

  test('can store all different slice range and metadata combinations', () => {
    const {peritext} = setup();
    const r1 = peritext.range(peritext.pointAt(4, Anchor.Before), peritext.pointAt(6, Anchor.After));
    const r2 = peritext.range(peritext.pointAt(2, Anchor.After), peritext.pointAt(8, Anchor.After));
    const r3 = peritext.range(peritext.pointAt(2, Anchor.After), peritext.pointAt(8, Anchor.Before));
    const r4 = peritext.range(peritext.pointAt(0, Anchor.Before), peritext.pointAt(8, Anchor.Before));
    const ranges = [r1, r2, r3, r4];
    const types = ['b', ['li', 'ul'], 0, 123, [1, 2, 3]];
    const datas = [{bold: true}, {list: 'ul'}, 0, 123, [1, 2, 3], null, undefined];
    const behaviors = [SliceBehavior.Stack, SliceBehavior.Erase, SliceBehavior.Overwrite, SliceBehavior.Marker];
    for (const range of ranges) {
      for (const type of types) {
        for (const data of datas) {
          for (const behavior of behaviors) {
            const {peritext, model} = setup();
            const slice = peritext.slices.ins(range, behavior, type, data);
            expect(slice.start.cmp(range.start)).toBe(0);
            expect(slice.end.cmp(range.end)).toBe(0);
            expect(slice.behavior).toBe(behavior);
            expect(slice.type).toStrictEqual(type);
            expect(slice.data()).toStrictEqual(data);
            const buf = model.toBinary();
            const model2 = Model.fromBinary(buf);
            const peritext2 = new Peritext(model2, model2.api.str(['text']).node, model2.api.arr(['slices']).node);
            peritext2.refresh();
            const slice2 = peritext2.slices.get(slice.id)!;
            expect(slice2.start.cmp(range.start)).toBe(0);
            expect(slice2.end.cmp(range.end)).toBe(0);
            expect(slice2.behavior).toBe(behavior);
            expect(slice2.type).toStrictEqual(type);
            expect(slice2.data()).toStrictEqual(data);
          }
        }
      }
    }
  });
});

describe('.get()', () => {
  test('can retrieve slice by id', () => {
    const {peritext} = setup();
    const range = peritext.rangeAt(6, 5);
    const slice = peritext.slices.insOverwrite(range, 'italic');
    const slice2 = peritext.slices.get(slice.id);
    expect(slice2).toBe(slice);
  });
});

describe('.del()', () => {
  test('can delete a slice', () => {
    const {peritext} = setup();
    const {editor} = peritext;
    editor.cursor.setAt(6, 5);
    const slice1 = editor.insStackSlice('b', {bold: true});
    peritext.refresh();
    const hash1 = peritext.slices.hash;
    expect(peritext.slices.size()).toBe(1);
    peritext.slices.del(slice1.id);
    peritext.refresh();
    const hash2 = peritext.slices.hash;
    expect(peritext.slices.size()).toBe(0);
    expect(hash1).not.toBe(hash2);
  });
});

describe('.delSlices()', () => {
  test('can delete a slice', () => {
    const {peritext} = setup();
    const {editor} = peritext;
    editor.cursor.setAt(6, 5);
    const slice1 = editor.insStackSlice('b', {bold: true});
    peritext.refresh();
    const hash1 = peritext.slices.hash;
    expect(peritext.slices.size()).toBe(1);
    peritext.slices.delSlices([slice1]);
    peritext.refresh();
    const hash2 = peritext.slices.hash;
    expect(peritext.slices.size()).toBe(0);
    expect(hash1).not.toBe(hash2);
  });
});

describe('.refresh()', () => {
  const testSliceUpdate = (name: string, update: (controls: {range: Range; slice: PersistedSlice}) => void) => {
    test('changes hash on: ' + name, () => {
      const {peritext, encodeAndDecode} = setup();
      const range = peritext.rangeAt(6, 5);
      const slice = peritext.slices.insOverwrite(range, 'b', {howBold: 'very'});
      const hash1 = peritext.slices.refresh();
      const hash2 = peritext.slices.refresh();
      expect(hash1).toBe(hash2);
      expect(slice.type).toBe('b');
      update({range, slice});
      const hash3 = peritext.slices.refresh();
      const hash4 = peritext.slices.refresh();
      expect(hash3).not.toBe(hash2);
      expect(hash4).toBe(hash3);
      const {peritext2} = encodeAndDecode();
      peritext2.refresh();
      const slice2 = peritext2.slices.get(slice.id)!;
      expect(slice2.cmp(slice)).toBe(0);
    });
  };

  testSliceUpdate('slice behavior change', ({slice}) => {
    slice.update({behavior: SliceBehavior.Stack});
    expect(slice.behavior).toBe(SliceBehavior.Stack);
  });

  testSliceUpdate('slice type change', ({slice}) => {
    slice.update({type: 123});
    expect(slice.type).toBe(123);
  });

  testSliceUpdate('slice data overwrite', ({slice}) => {
    slice.update({data: 'the data'});
    expect(slice.data()).toEqual('the data');
  });

  testSliceUpdate('slice start anchor change', ({range, slice}) => {
    range.start.anchor = Anchor.After;
    slice.update({range});
  });

  testSliceUpdate('slice end anchor change', ({range, slice}) => {
    range.end.anchor = Anchor.Before;
    slice.update({range});
  });

  testSliceUpdate('slice start position', ({range, slice}) => {
    range.start.id = range.start.nextId()!;
    slice.update({range});
  });

  testSliceUpdate('slice end position', ({range, slice}) => {
    range.end.id = range.start.prevId()!;
    slice.update({range});
  });

  test('recomputes hash on inline data change', () => {
    const {peritext} = setup();
    const {editor} = peritext;
    editor.cursor.setAt(6, 5);
    const slice1 = editor.insStackSlice('b', {bold: true});
    peritext.refresh();
    const hash1 = peritext.slices.hash;
    peritext.model.api.obj(['slices', 0, 4]).set({bold: false});
    peritext.refresh();
    const hash2 = peritext.slices.hash;
    peritext.refresh();
    const hash3 = peritext.slices.hash;
    expect(hash1).not.toBe(hash2);
    expect(hash2).toBe(hash3);
  });
});
