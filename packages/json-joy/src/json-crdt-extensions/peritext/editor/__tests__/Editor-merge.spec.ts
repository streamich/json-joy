import {type Kit, setupAlphabetKit, setupKit} from '../../__tests__/setup';
import {CommonSliceType} from '../../slice';
import {SliceTypeCon} from '../../slice/constants';
import * as fixtures from './fixtures';
import type {Peritext} from '../../Peritext';
import type {ViewRange} from '../types';

const testSuite = (setup: () => Kit) => {
  describe('.merge()', () => {
    const assertMergeEqual = (view: ViewRange) => {
      const {editor, peritext} = setup();
      editor.merge(view)!;
      peritext.refresh();
      const view2 = editor.export(peritext.rangeAll()!);
      expect(view2).toEqual(view);
    };

    test('preserves formatting order', () => {
      assertMergeEqual([
        'text!',
        0,
        [
          [10, 1, 5, 'em'],
          [10, 1, 5, 'strong'],
        ],
      ]);
      assertMergeEqual([
        'text!',
        0,
        [
          [10, 1, 5, 'strong'],
          [10, 1, 5, 'em'],
        ],
      ]);
    });

    describe('block splits', () => {
      test('can update text-only after block split', () => {
        const {editor, peritext} = setup();
        editor.cursor.setAt(10);
        editor.saved.insMarker(CommonSliceType.blockquote);
        peritext.refresh();
        const view = editor.export(peritext.rangeAll()!);
        const text = view[0];
        const newText = (view[0] = text.slice(0, 15) + '__inserted_text__' + text.slice(15));
        const patch = editor.merge(view)!;
        expect(patch[1]).toBe(undefined);
        expect(patch[0]!.ops.length).toBe(1);
        expect(patch[0]!.ops[0].name()).toBe('ins_str');
        expect(editor.export(peritext.rangeAll()!)[0]).toBe(newText);
        view[0] = text; // restore original text
        const patch2 = editor.merge(view)!;
        expect(patch2[1]).toBe(undefined);
        expect(patch2[0]!.ops.length).toBe(1);
        expect(patch2[0]!.ops[0].name()).toBe('del');
        expect(editor.export(peritext.rangeAll()!)).toEqual(view);
      });

      test('can update text-only before block split', () => {
        const {editor, peritext} = setup();
        editor.cursor.setAt(10);
        editor.saved.insMarker(CommonSliceType.blockquote);
        peritext.refresh();
        const view = editor.export(peritext.rangeAll()!);
        const text = view[0];
        const newText = text.slice(0, 3) + '_0_' + text.slice(3);
        view[0] = newText;
        (<any>view)[2][0][1] += 3;
        (<any>view)[2][0][2] += 3;
        const patch = editor.merge(view)!;
        expect(patch[1]).toBe(undefined);
        expect(patch[0]!.ops.length).toBe(1);
        expect(patch[0]!.ops[0].name()).toBe('ins_str');
        expect(editor.export(peritext.rangeAll()!)[0]).toBe(newText);
        view[0] = text; // restore original text
        (<any>view)[2][0][1] -= 3;
        (<any>view)[2][0][2] -= 3;
        const patch2 = editor.merge(view)!;
        expect(patch2[1]).toBe(undefined);
        expect(patch2[0]!.ops.length).toBe(1);
        expect(patch2[0]!.ops[0].name()).toBe('del');
        expect(editor.export(peritext.rangeAll()!)[0]).toBe(text);
      });

      test('can handle block split type change and block split delete', () => {
        const {editor, peritext} = setup();
        editor.cursor.setAt(10);
        editor.saved.insMarker(CommonSliceType.blockquote);
        editor.cursor.setAt(20);
        editor.saved.insMarker([[CommonSliceType.p, 0, {indent: 1}]]);
        editor.cursor.setAt(25);
        editor.saved.insMarker([[CommonSliceType.p, 0, {indent: 2}]]);
        peritext.refresh();
        const view = editor.export(peritext.rangeAll()!);
        (<any>view)[2][0][3] = 'blockquote';
        <any>view[2].splice(2, 1);
        const patch = editor.merge(view);
        peritext.refresh();
        const view2 = editor.export(peritext.rangeAll()!);
        expect(view2).toEqual(view);
        expect(patch[0]).toBe(undefined);
      });

      test('block insert', () => {
        const {editor, peritext} = setup();
        const {peritext: peritext2} = setup();
        editor.cursor.setAt(10);
        editor.saved.insMarker(CommonSliceType.blockquote);
        peritext2.editor.cursor.setAt(10);
        peritext2.editor.saved.insMarker(CommonSliceType.blockquote);
        peritext2.editor.cursor.setAt(20);
        peritext2.editor.saved.insMarker(CommonSliceType.p);
        peritext.refresh();
        peritext2.refresh();
        const view2 = peritext2.editor.export(peritext2.rangeAll()!);
        const patch = editor.merge(view2);
        expect(patch[0]?.ops.length).toBe(1);
        expect(patch[0]?.ops[0].name()).toBe('ins_str');
        peritext.refresh();
        const view3 = editor.export(peritext.rangeAll()!);
        expect(view3).toEqual(view2);
      });

      test('complex block inserts (and moves)', () => {
        const {editor, peritext} = setup();
        const {peritext: peritext2} = setup();
        editor.cursor.setAt(10);
        editor.saved.insMarker(CommonSliceType.blockquote);
        peritext2.editor.cursor.setAt(11);
        peritext2.editor.saved.insMarker(CommonSliceType.blockquote);
        peritext2.editor.cursor.setAt(15);
        peritext2.editor.saved.insMarker([
          [SliceTypeCon.ul, 0, {type: 'tasks'}],
          [SliceTypeCon.li, 0, {checked: true}],
        ]);
        peritext2.editor.cursor.setAt(20);
        peritext2.editor.saved.insMarker(CommonSliceType.p);
        peritext.refresh();
        peritext2.refresh();
        const view = peritext2.editor.export(peritext2.rangeAll()!);
        editor.merge(view);
        peritext.refresh();
        const view3 = editor.export(peritext.rangeAll()!);
        expect(view3).toEqual(view);
      });

      test('change marker type', () => {
        const {editor, peritext} = setup();
        editor.cursor.setAt(10);
        editor.saved.insMarker(CommonSliceType.h1);
        peritext.refresh();
        const view = editor.export(peritext.rangeAll()!);
        view[2][0][3] = CommonSliceType.h2;
        const patch = editor.merge(view);
        expect(patch[0]).toBe(undefined);
        expect(patch[2]!.ops.length < 5).toBe(true);
        expect(patch[2]!.ops.length > 1).toBe(true);
        peritext.refresh();
        const slices = [...peritext.overlay.markers()];
        expect(slices.length).toBe(1);
        const slice = slices[0];
        expect(slice.type()).toEqual(CommonSliceType.h2);
        view[2][0][3] = [SliceTypeCon.ul, SliceTypeCon.li];
        const patch2 = editor.merge(view);
        expect(patch2[0]).toBe(undefined);
        peritext.refresh();
        const slices2 = [...peritext.overlay.markers()];
        expect(slices2.length).toBe(1);
        const slice2 = slices2[0];
        expect(slice2.type()).toEqual([SliceTypeCon.ul, SliceTypeCon.li]);
      });
    });

    describe('inline formatting', () => {
      const assertCanMerge = (src: Peritext, dst: Peritext) => {
        src.refresh();
        dst.refresh();
        const view = dst.editor.export(dst.rangeAll()!);
        src.editor.merge(view);
        src.refresh();
        const view2 = src.editor.export(src.rangeAll()!);
        expect(view2).toEqual(view);
      };

      test('can add a single slice', () => {
        const {peritext: txt1} = setup();
        const {peritext: txt2} = setup();
        txt2.editor.cursor.setAt(10, 5);
        txt2.editor.saved.insOne('bold');
        assertCanMerge(txt1, txt2);
      });

      test('can add two overlapping slices', () => {
        const {peritext: txt1} = setup();
        const {peritext: txt2} = setup();
        txt2.editor.cursor.setAt(10, 10);
        txt2.editor.saved.insOne('bold');
        txt2.editor.cursor.setAt(15, 10);
        txt2.editor.saved.insOne('italic');
        assertCanMerge(txt1, txt2);
      });

      test('can remove a single slice', () => {
        const {peritext: txt1} = setup();
        const {peritext: txt2} = setup();
        txt1.editor.cursor.setAt(10, 10);
        txt1.editor.saved.insOne('bold');
        assertCanMerge(txt1, txt2);
      });

      test('can change slice type', () => {
        const {peritext: txt1} = setup();
        const {peritext: txt2} = setup();
        txt1.editor.cursor.setAt(10, 10);
        txt1.editor.saved.insOne('bold');
        txt2.editor.cursor.setAt(10, 10);
        txt2.editor.saved.insOne('italic');
        assertCanMerge(txt1, txt2);
      });

      test('returns empty patch for equal documents', () => {
        const {peritext: txt1} = setup();
        const {peritext: txt2} = setup();
        txt1.editor.cursor.setAt(10, 10);
        txt1.editor.saved.insOne('bold');
        txt2.editor.cursor.setAt(10, 10);
        txt2.editor.saved.insOne('bold');
        assertCanMerge(txt1, txt2);
      });
    });

    describe('scenarios', () => {
      const assertCanMergeFromTo = (from: ViewRange, to: ViewRange) => {
        const kit = setupKit();
        kit.peritext.refresh();
        // kit.editor.import(0, from);
        kit.editor.merge(from);
        kit.peritext.refresh();
        // console.log(toTree(from));
        // expect(kit.editor.export()).toEqual(from);
        kit.editor.merge(to);
        kit.peritext.refresh();
        // console.log(toTree(to));
        // console.log(toTree(kit.editor.export()));
        expect(kit.editor.export()).toEqual(to);
      };

      test('example from ProseMirror tests', () => {
        assertCanMergeFromTo(fixtures.view1, fixtures.view2);
        assertCanMergeFromTo(fixtures.view2, fixtures.view1);
        assertCanMergeFromTo(fixtures.view1, fixtures.view3);
        assertCanMergeFromTo(fixtures.view3, fixtures.view1);
        assertCanMergeFromTo(fixtures.view2, fixtures.view3);
        assertCanMergeFromTo(fixtures.view3, fixtures.view2);
      });
    });
  });
};

// runAlphabetKitTestSuite(testSuite);
testSuite(setupAlphabetKit);
