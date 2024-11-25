import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import {Anchor} from '../../rga/constants';
import {SliceBehavior} from '../../slice/constants';

const testSuite = (setup: () => Kit) => {
  describe('.export()', () => {
    test('can export whole un-annotated document', () => {
      const {editor} = setup();
      editor.selectAll();
      const json = editor.export(editor.cursor);
      expect(json).toEqual(['abcdefghijklmnopqrstuvwxyz', []]);
    });

    test('can export range, which contains bold text', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(3, 3);
      editor.saved.insOverwrite('bold');
      const range = peritext.rangeAt(2, 5);
      peritext.refresh();
      const json = editor.export(range);
      expect(json).toEqual(['cdefg', [
        [
          1,
          Anchor.Before,
          4,
          Anchor.After,
          SliceBehavior.One,
          'bold',
        ],
      ]]);
    });
  });
};

runAlphabetKitTestSuite(testSuite);
