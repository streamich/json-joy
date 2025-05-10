import {
  type Kit,
  setupAlphabetChunkSplitKit,
  setupAlphabetKit,
  setupAlphabetWithDeletesKit,
  setupAlphabetWithTwoChunksKit,
} from '../../__tests__/setup';
import {LeafBlock} from '../LeafBlock';

const runTests = (setup: () => Kit) => {
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

  test('updates block hash when part of it is annotated bold', () => {
    const {editor, peritext} = setup();
    editor.cursor.setAt(10, 10);
    peritext.refresh();
    const rootHash1 = peritext.blocks.root.hash;
    const firstBlockHash1 = peritext.blocks.root.children[0].hash;
    editor.saved.insOne('b');
    peritext.refresh();
    const rootHash2 = peritext.blocks.root.hash;
    const firstBlockHash2 = peritext.blocks.root.children[0].hash;
    expect(rootHash1).not.toBe(rootHash2);
    expect(firstBlockHash1).not.toBe(firstBlockHash2);
  });

  test('does not create collapsed Inline at the beginning of block', () => {
    const {editor, peritext} = setup();
    editor.cursor.setAt(0);
    editor.saved.insMarker('p');
    editor.cursor.setAt(1, 4);
    editor.saved.insOne('strong');
    peritext.refresh();
    const fragment = peritext.blocks.root;
    const block = fragment.children[0];
    expect(block instanceof LeafBlock).toBe(true);
    expect(block.tag()).toBe('p');
    const [inline0, inline1] = block.texts();
    expect(inline0.text()).toBe('abcd');
    expect(!!inline0.attr().strong).toBe(true);
    expect(inline1.text()).toBe('efghijklmnopqrstuvwxyz');
    expect(!!inline1.attr().strong).toBe(false);
  });
};

describe('Blocks.refresh()', () => {
  describe('basic alphabet', () => {
    runTests(setupAlphabetKit);
  });

  describe('alphabet with two chunks', () => {
    runTests(setupAlphabetWithTwoChunksKit);
  });

  describe('alphabet with chunk split', () => {
    runTests(setupAlphabetChunkSplitKit);
  });

  describe('alphabet with deletes', () => {
    runTests(setupAlphabetWithDeletesKit);
  });
});
