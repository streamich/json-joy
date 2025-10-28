import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import {Anchor} from '../../rga/constants';
import {CommonSliceType} from '../../slice';
import {SliceStacking, SliceHeaderShift} from '../../slice/constants';
import {create} from '../../transfer/create';
import type {ViewRange} from '../types';

const testSuite = (setup: () => Kit) => {
  describe('.export()', () => {
    test('can export whole un-annotated document', () => {
      const {editor} = setup();
      editor.selectAll();
      const json = editor.export(editor.cursor);
      expect(json).toEqual(['abcdefghijklmnopqrstuvwxyz', 0, []]);
    });

    test('can export part of un-annotated document', () => {
      const {editor} = setup();
      editor.cursor.setAt(5, 5);
      const json = editor.export(editor.cursor);
      expect(json).toEqual(['fghij', 5, []]);
    });

    test('range which contains bold text', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(3, 3);
      editor.saved.insOne('bold');
      const range = peritext.rangeAt(2, 5);
      peritext.refresh();
      const json = editor.export(range);
      expect(json).toEqual(['cdefg', 2, [[expect.any(Number), 3, 6, 'bold']]]);
    });

    test('exports only "saved" slices', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(3, 3);
      editor.local.insOne('italic');
      editor.saved.insOne('bold');
      editor.extra.insOne('underline');
      const range = peritext.rangeAt(2, 5);
      peritext.refresh();
      const json = editor.export(range);
      expect(json).toEqual(['cdefg', 2, [[expect.any(Number), 3, 6, 'bold']]]);
    });

    test('range which start in bold text', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(3, 10);
      editor.saved.insOne(CommonSliceType.b);
      editor.cursor.setAt(5, 15);
      peritext.refresh();
      const json = editor.export(editor.cursor);
      expect(json).toEqual(['fghijklmnopqrst', 5, [[expect.any(Number), 3, 13, CommonSliceType.b]]]);
    });

    test('range which ends in bold text', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(3, 10);
      editor.saved.insOne(CommonSliceType.b);
      const range = peritext.rangeAt(0, 5);
      peritext.refresh();
      const json = editor.export(range);
      expect(json).toEqual(['abcde', 0, [[expect.any(Number), 3, 13, CommonSliceType.b]]]);
    });

    test('can export <p> marker', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.p);
      const range = peritext.rangeAt(8, 5);
      peritext.refresh();
      const json = editor.export(range);
      const header =
        (SliceStacking.Marker << SliceHeaderShift.Stacking) +
        (Anchor.Before << SliceHeaderShift.X1Anchor) +
        (Anchor.Before << SliceHeaderShift.X2Anchor);
      expect(json).toEqual(['ij\nkl', 8, [[header, 10, 10, CommonSliceType.p]]]);
    });

    test('can export <p> marker, <blockquote> marker, and italic text', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(15);
      editor.saved.insMarker(CommonSliceType.blockquote);
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.p);
      editor.cursor.setAt(12, 2);
      editor.saved.insOne(CommonSliceType.i);
      const range = peritext.rangeAt(8, 12);
      peritext.refresh();
      const json = editor.export(range);
      const pHeader =
        (SliceStacking.Marker << SliceHeaderShift.Stacking) +
        (Anchor.Before << SliceHeaderShift.X1Anchor) +
        (Anchor.Before << SliceHeaderShift.X2Anchor);
      const iHeader =
        (SliceStacking.One << SliceHeaderShift.Stacking) +
        (Anchor.Before << SliceHeaderShift.X1Anchor) +
        (Anchor.After << SliceHeaderShift.X2Anchor);
      const blockquoteHeader =
        (SliceStacking.Marker << SliceHeaderShift.Stacking) +
        (Anchor.Before << SliceHeaderShift.X1Anchor) +
        (Anchor.Before << SliceHeaderShift.X2Anchor);
      expect(json).toEqual([
        'ij\nklmno\npqr',
        8,
        [
          [iHeader, 12, 14, CommonSliceType.i],
          [pHeader, 10, 10, CommonSliceType.p],
          [blockquoteHeader, 16, 16, CommonSliceType.blockquote],
        ],
      ]);
    });
  });

  describe('.exportStyle()', () => {
    test('returns empty list if there are no annotations', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(5, 2);
      peritext.refresh();
      const json = editor.exportStyle(editor.cursor);
      expect(json).toEqual([]);
    });

    test('returns empty list if there are no annotations', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(2, 2);
      editor.saved.insOne('bold');
      editor.cursor.setAt(9, 2);
      editor.saved.insOne('italic');
      editor.cursor.setAt(5, 2);
      peritext.refresh();
      const json = editor.exportStyle(editor.cursor);
      expect(json).toEqual([]);
    });

    test('returns all range formatting annotations', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(2, 2);
      editor.saved.insOne('bold');
      editor.cursor.setAt(3, 2);
      editor.saved.insOne('italic');
      editor.cursor.setAt(3, 1);
      peritext.refresh();
      const json = editor.exportStyle(editor.cursor);
      expect(json.length).toBe(2);
      expect(json).toEqual([
        [SliceStacking.One, 'bold'],
        [SliceStacking.One, 'italic'],
      ]);
    });
  });

  describe('.import()', () => {
    test('can insert text into another document', () => {
      const kit1 = setup();
      const kit2 = setup();
      kit1.editor.cursor.setAt(0, 3);
      const json = kit1.editor.export(kit1.editor.cursor);
      kit2.editor.import(3, json);
      expect(kit2.peritext.strApi().view()).toBe('abcabcdefghijklmnopqrstuvwxyz');
    });

    test('can copy a range with bold text annotation', () => {
      const kit1 = setup();
      const kit2 = setup();
      kit1.editor.cursor.setAt(5, 5);
      kit1.editor.saved.insOne('bold');
      kit1.editor.cursor.setAt(3, 10);
      kit1.peritext.refresh();
      const json = kit1.editor.export(kit1.editor.cursor);
      kit2.editor.import(5, json);
      kit2.peritext.refresh();
      expect(kit2.peritext.strApi().view()).toBe('abcde' + 'defghijklm' + 'fghijklmnopqrstuvwxyz');
      const [, i2] = kit2.peritext.blocks.root.children[0].texts();
      expect(i2.text()).toBe('fghij');
      expect(!!i2.attr().bold).toBe(true);
    });

    test('can import a contained <b> annotation', () => {
      const kit1 = setup();
      kit1.editor.cursor.setAt(0, 3);
      kit1.editor.saved.insOne(CommonSliceType.b);
      kit1.peritext.refresh();
      const range = kit1.peritext.rangeAt(1, 1);
      const view = kit1.editor.export(range);
      kit1.editor.import(5, view);
      kit1.peritext.refresh();
      const jsonml = kit1.peritext.blocks.toJson();
      expect(jsonml).toEqual([
        '',
        null,
        [
          CommonSliceType.p,
          expect.any(Object),
          [CommonSliceType.b, expect.any(Object), 'abc'],
          'de',
          [CommonSliceType.b, expect.any(Object), 'b'],
          'fghijklmnopqrstuvwxyz',
        ],
      ]);
      const block = kit1.peritext.blocks.root.children[0];
      const inlines = [...block.texts()];
      const inline = inlines.find((i) => i.text() === 'b')!;
      expect(inline.start.anchor).toBe(Anchor.Before);
      expect(inline.end.anchor).toBe(Anchor.After);
    });

    test('can import a contained <b> annotation (with end edge anchored to neighbor chars)', () => {
      const kit1 = setup();
      kit1.editor.cursor.setAt(0, 3);
      const start = kit1.editor.cursor.start.clone();
      const end = kit1.editor.cursor.end.clone();
      start.refAfter();
      end.refBefore();
      kit1.editor.cursor.set(start, end);
      kit1.editor.saved.insOne(CommonSliceType.b);
      kit1.peritext.refresh();
      const range = kit1.peritext.rangeAt(1, 1);
      const view = kit1.editor.export(range);
      kit1.editor.import(5, view);
      kit1.peritext.refresh();
      const jsonml = kit1.peritext.blocks.toJson();
      expect(jsonml).toEqual([
        '',
        null,
        [
          CommonSliceType.p,
          expect.any(Object),
          [CommonSliceType.b, expect.any(Object), 'abc'],
          'de',
          [CommonSliceType.b, expect.any(Object), 'b'],
          'fghijklmnopqrstuvwxyz',
        ],
      ]);
      const block = kit1.peritext.blocks.root.children[0];
      const inlines = [...block.texts()];
      const inline = inlines.find((i) => i.text() === 'b')!;
      expect(inline.start.anchor).toBe(Anchor.After);
      expect(inline.end.anchor).toBe(Anchor.Before);
    });

    test('annotation start edge cannot point to ABS start', () => {
      const kit1 = setup();
      kit1.editor.cursor.setAt(1, 2);
      const start = kit1.editor.cursor.start.clone();
      const end = kit1.editor.cursor.end.clone();
      start.refAfter();
      end.refBefore();
      kit1.editor.cursor.set(start, end);
      kit1.editor.saved.insOne(CommonSliceType.b);
      kit1.editor.delCursors();
      kit1.peritext.refresh();
      const range = kit1.peritext.rangeAt(1, 1);
      const view = kit1.editor.export(range);
      kit1.editor.import(0, view);
      kit1.peritext.refresh();
      const jsonml = kit1.peritext.blocks.toJson();
      expect(jsonml).toEqual([
        '',
        null,
        [
          CommonSliceType.p,
          expect.any(Object),
          [CommonSliceType.b, expect.any(Object), 'b'],
          'a',
          [CommonSliceType.b, expect.any(Object), 'bc'],
          'defghijklmnopqrstuvwxyz',
        ],
      ]);
      const block = kit1.peritext.blocks.root.children[0];
      const inlines = [...block.texts()];
      const inline = inlines.find((i) => i.text() === 'b')!;
      expect(inline.start.anchor).toBe(Anchor.Before);
      expect(inline.end.anchor).toBe(Anchor.Before);
    });

    test('annotation end edge cannot point to ABS end', () => {
      const kit1 = setup();
      kit1.editor.cursor.setAt(1, 2);
      const start = kit1.editor.cursor.start.clone();
      const end = kit1.editor.cursor.end.clone();
      start.refAfter();
      end.refBefore();
      kit1.editor.cursor.set(start, end);
      kit1.editor.saved.insOne(CommonSliceType.b);
      kit1.editor.delCursors();
      kit1.peritext.refresh();
      const range = kit1.peritext.rangeAt(1, 1);
      const view = kit1.editor.export(range);
      const length = kit1.peritext.strApi().length();
      kit1.editor.import(length, view);
      kit1.peritext.refresh();
      const jsonml = kit1.peritext.blocks.toJson();
      expect(jsonml).toEqual([
        '',
        null,
        [
          CommonSliceType.p,
          expect.any(Object),
          'a',
          [CommonSliceType.b, expect.any(Object), 'bc'],
          'defghijklmnopqrstuvwxyz',
          [CommonSliceType.b, expect.any(Object), 'b'],
        ],
      ]);
      const block = kit1.peritext.blocks.root.children[0];
      const inlines = [...block.texts()];
      const inline = inlines.find((i) => i.text() === 'b')!;
      expect(inline.start.anchor).toBe(Anchor.After);
      expect(inline.end.anchor).toBe(Anchor.After);
    });

    test('can copy a paragraph split', () => {
      const kit1 = setup();
      const kit2 = setup();
      kit1.editor.cursor.setAt(5);
      kit1.editor.saved.insMarker(CommonSliceType.p);
      kit1.editor.cursor.setAt(3, 5);
      kit1.peritext.refresh();
      const json = kit1.editor.export(kit1.editor.cursor);
      kit2.editor.import(0, json);
      kit2.peritext.refresh();
      const json2 = kit2.peritext.blocks.toJson();
      expect(json2).toEqual([
        '',
        null,
        [CommonSliceType.p, null, 'de'],
        [CommonSliceType.p, null, 'fgabcdefghijklmnopqrstuvwxyz'],
      ]);
    });

    test('can insert paragraph covered in inline annotation', () => {
      const kit1 = setup();
      const json: ViewRange = [
        '\n123',
        0,
        [
          [0, 0, 0, 0],
          [10, 1, 4, -3],
        ],
      ];
      kit1.peritext.refresh();
      kit1.editor.import(2, json);
      kit1.peritext.refresh();
      const json2 = kit1.peritext.blocks.toJson();
      expect(json2).toEqual([
        '',
        null,
        [CommonSliceType.p, null, 'ab', [CommonSliceType.b, {inline: true}, '123'], 'cdefghijklmnopqrstuvwxyz'],
      ]);
    });
  });

  describe('.importStyle()', () => {
    test('can copy formatting into another document part', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(2, 2);
      editor.saved.insOne(CommonSliceType.b);
      editor.cursor.setAt(3, 2);
      editor.saved.insOne(CommonSliceType.i);
      editor.cursor.setAt(3, 1);
      peritext.refresh();
      const json = editor.exportStyle(editor.cursor);
      editor.cursor.setAt(10, 3);
      editor.importStyle(editor.cursor, json);
      peritext.refresh();
      const transfer = create(peritext);
      const html = transfer.toHtml(peritext.rangeAll()!);
      expect(html).toBe('<p>ab<b>c</b><i><b>d</b></i><i>e</i>fghij<i><b>klm</b></i>nopqrstuvwxyz</p>');
    });
  });
};

runAlphabetKitTestSuite(testSuite);
