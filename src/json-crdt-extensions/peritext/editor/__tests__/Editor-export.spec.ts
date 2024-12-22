import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import {Anchor} from '../../rga/constants';
import {CommonSliceType} from '../../slice';
import {SliceBehavior, SliceHeaderShift} from '../../slice/constants';

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
      editor.saved.insOverwrite('bold');
      const range = peritext.rangeAt(2, 5);
      peritext.refresh();
      const json = editor.export(range);
      expect(json).toEqual(['cdefg', 2, [[expect.any(Number), 3, 6, 'bold']]]);
    });

    test('exports only "saved" slices', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(3, 3);
      editor.local.insOverwrite('italic');
      editor.saved.insOverwrite('bold');
      editor.extra.insOverwrite('underline');
      const range = peritext.rangeAt(2, 5);
      peritext.refresh();
      const json = editor.export(range);
      expect(json).toEqual(['cdefg', 2, [[expect.any(Number), 3, 6, 'bold']]]);
    });

    test('range which start in bold text', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(3, 10);
      editor.saved.insOverwrite(CommonSliceType.b);
      editor.cursor.setAt(5, 15);
      peritext.refresh();
      const json = editor.export(editor.cursor);
      expect(json).toEqual(['fghijklmnopqrst', 5, [[expect.any(Number), 3, 13, CommonSliceType.b]]]);
    });

    test('range which ends in bold text', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(3, 10);
      editor.saved.insOverwrite(CommonSliceType.b);
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
      const header = (SliceBehavior.Marker << SliceHeaderShift.Behavior) +
        (Anchor.Before << SliceHeaderShift.X1Anchor) +
        (Anchor.Before << SliceHeaderShift.X2Anchor);
      expect(json).toEqual(['ij\nkl', 8, [
        [header, 10, 10, CommonSliceType.p]
      ]]);
    });

    test('can export <p> marker, <blockquote> marker, and italic text', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(15);
      editor.saved.insMarker(CommonSliceType.blockquote);
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.p);
      editor.cursor.setAt(12, 2);
      editor.saved.insOverwrite(CommonSliceType.i);
      const range = peritext.rangeAt(8, 12);
      peritext.refresh();
      const json = editor.export(range);
      const pHeader = (SliceBehavior.Marker << SliceHeaderShift.Behavior) +
        (Anchor.Before << SliceHeaderShift.X1Anchor) +
        (Anchor.Before << SliceHeaderShift.X2Anchor);
      const iHeader = (SliceBehavior.One << SliceHeaderShift.Behavior) +
        (Anchor.Before << SliceHeaderShift.X1Anchor) +
        (Anchor.After << SliceHeaderShift.X2Anchor);
      const blockquoteHeader = (SliceBehavior.Marker << SliceHeaderShift.Behavior) +
        (Anchor.Before << SliceHeaderShift.X1Anchor) +
        (Anchor.Before << SliceHeaderShift.X2Anchor);
      expect(json).toEqual(['ij\nklmno\npqr', 8, [
        [pHeader, 10, 10, CommonSliceType.p],
        [iHeader, 12, 14, CommonSliceType.i],
        [blockquoteHeader, 16, 16, CommonSliceType.blockquote],
      ]]);
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
      kit1.editor.saved.insOverwrite('bold');
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
      kit1.editor.saved.insOverwrite(CommonSliceType.b);
      kit1.peritext.refresh();
      const range = kit1.peritext.rangeAt(1, 1);
      const view = kit1.editor.export(range);
      kit1.editor.import(5, view);
      kit1.peritext.refresh();
      const jsonml = kit1.peritext.blocks.toJson();
      expect(jsonml).toEqual([
        '',
        null,
        [CommonSliceType.p, expect.any(Object),
          [CommonSliceType.b, expect.any(Object), 'abc'],
          'de',
          [CommonSliceType.b, expect.any(Object), 'b'],
          'fghijklmnopqrstuvwxyz',
        ]
      ]);
      const block = kit1.peritext.blocks.root.children[0];
      const inlines = [...block.texts()];
      const inline = inlines.find((i) => i.text() === 'b')!;
      expect(inline.start.anchor).toBe(Anchor.Before);
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
  });
};

runAlphabetKitTestSuite(testSuite);
