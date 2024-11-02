import {render} from './render';
import {
  type Kit,
  setupAlphabetChunkSplitKit,
  setupAlphabetKit,
  setupAlphabetWithDeletesKit,
  setupAlphabetWithTwoChunksKit,
  setupAlphabetWrittenInReverse,
  setupAlphabetWrittenInReverseWithDeletes,
} from './setup';

const runInlineSlicesTests = (desc: string, getKit: () => Kit) => {
  const setup = () => {
    const kit = getKit();
    const view = () => {
      kit.peritext.refresh();
      return render(kit.peritext.blocks.root, '', false);
    };
    // console.log(peritext.str + '');
    return {...kit, view};
  };

  describe(desc, () => {
    test('updates block hash only where something was changed - leading block', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(['p'], 'p1');
      editor.cursor.setAt(22);
      editor.saved.insMarker(['p'], 'p2');
      editor.cursor.setAt(editor.txt.str.length());
      peritext.refresh();
      const rootHash1 = peritext.blocks.root.hash;
      const firstBlockHash1 = peritext.blocks.root.children[0].hash;
      const secondBlockHash1 = peritext.blocks.root.children[1].hash;
      editor.cursor.setAt(2);
      editor.insert('___');
      peritext.refresh();
      const rootHash2 = peritext.blocks.root.hash;
      const firstBlockHash2 = peritext.blocks.root.children[0].hash;
      const secondBlockHash2 = peritext.blocks.root.children[1].hash;
      expect(rootHash1).not.toBe(rootHash2);
      expect(firstBlockHash1).not.toBe(firstBlockHash2);
      expect(secondBlockHash1).toBe(secondBlockHash2);
    });

    test('updates block hash only where hash has changed - middle block', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(['p', 'p1']);
      editor.cursor.setAt(22);
      editor.saved.insMarker(['p'], 'p2');
      peritext.refresh();
      const rootHash1 = peritext.blocks.root.hash;
      const firstBlockHash1 = peritext.blocks.root.children[0].hash;
      const secondBlockHash1 = peritext.blocks.root.children[1].hash;
      editor.cursor.setAt(13);
      editor.insert('___');
      peritext.refresh();
      const rootHash2 = peritext.blocks.root.hash;
      const firstBlockHash2 = peritext.blocks.root.children[0].hash;
      const secondBlockHash2 = peritext.blocks.root.children[1].hash;
      expect(rootHash1).not.toBe(rootHash2);
      expect(firstBlockHash1).toBe(firstBlockHash2);
      expect(secondBlockHash1).not.toBe(secondBlockHash2);
    });
  });
};

runInlineSlicesTests('single text chunk', setupAlphabetKit);
runInlineSlicesTests('two chunks', setupAlphabetWithTwoChunksKit);
runInlineSlicesTests('with chunk split', setupAlphabetChunkSplitKit);
runInlineSlicesTests('with deletes', setupAlphabetWithDeletesKit);
runInlineSlicesTests('written in reverse', setupAlphabetWrittenInReverse);
runInlineSlicesTests('written in reverse with deletes', setupAlphabetWrittenInReverseWithDeletes);
