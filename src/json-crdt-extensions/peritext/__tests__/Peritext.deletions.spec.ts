import {setupAlphabetChunkSplitKit, setupAlphabetKit, Kit, setupAlphabetWithDeletesKit, setupAlphabetWithTwoChunksKit} from './setup';

const run = (setup: () => Kit) => {
  describe('.delAt()', () => {
    test('can delete text', () => {
      const {peritext} = setup();
      peritext.delAt(0, 1);
      peritext.delAt(0, 2);
      peritext.delAt(1, 2);
      peritext.delAt(3, 15);
      peritext.delAt(4, 2);
      expect(peritext.str.view()).toBe('dghx');
    });

    test('deletes slice if it is contained in deletion range', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(2, 2);
      editor.saved.insOverwrite('underline');
      editor.cursor.setAt(0);
      peritext.refresh();
      expect(editor.saved.slices.size()).toBe(1);
      peritext.delAt(1, 3);
      peritext.refresh();
      expect(editor.saved.slices.size()).toBe(0);
    });

    test('does not delete slice if it is only partially contained', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(2, 10);
      editor.extra.insOverwrite('underline');
      editor.cursor.setAt(0);
      peritext.refresh();
      expect(peritext.extraSlices.size()).toBe(1);
      peritext.delAt(1, 10);
      peritext.refresh();
      expect(peritext.extraSlices.size()).toBe(1);
      peritext.delAt(1, 10);
      peritext.refresh();
      expect(peritext.extraSlices.size()).toBe(0);
    });
  });
};

describe('basic alphabet', () => run(setupAlphabetKit));
describe('alphabet with chunk splits', () => run(setupAlphabetChunkSplitKit));
describe('alphabet with deletes', () => run(setupAlphabetWithDeletesKit));
describe('alphabet with two chunks', () => run(setupAlphabetWithTwoChunksKit));
