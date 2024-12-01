import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import {CommonSliceType} from '../../slice';

const testSuite = (setup: () => Kit) => {
  describe('.export()', () => {
    test('can export whole un-annotated document', () => {
      const {editor} = setup();
      editor.selectAll();
      const json = editor.export(editor.cursor);
      expect(json).toEqual(['abcdefghijklmnopqrstuvwxyz', 0, []]);
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
  });
};

runAlphabetKitTestSuite(testSuite);
