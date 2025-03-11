import {
  setupAlphabetChunkSplitKit,
  setupAlphabetKit,
  type Kit,
  setupAlphabetWithDeletesKit,
  setupAlphabetWithTwoChunksKit,
} from './setup';

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
      editor.saved.insOne('underline');
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
      editor.extra.insOne('underline');
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

  describe('.delSlices()', () => {
    test('does not delete already deleted slice', () => {
      const {peritext, editor, model} = setup();
      editor.cursor.setAt(15, 2);
      editor.saved.insOne('bold');
      editor.cursor.setAt(2, 2);
      editor.saved.insOne('underline');
      editor.cursor.setAt(0);
      peritext.refresh();
      const tick1 = model.tick;
      expect(editor.saved.slices.size()).toBe(2);
      const range = peritext.rangeAt(1, 5);
      const deleted = peritext.delSlices(range);
      const tick2 = model.tick;
      expect(deleted).toBe(true);
      expect(tick2).not.toBe(tick1);
      peritext.refresh();
      const deleted2 = peritext.delSlices(range);
      const tick3 = model.tick;
      expect(editor.saved.slices.size()).toBe(1);
      expect(deleted2).toBe(false);
      expect(tick3).toBe(tick2);
    });

    test('does not attempt to delete slices in the wrong models', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(2, 2);
      editor.extra.insStack('something...');
      editor.cursor.setAt(0);
      peritext.refresh();
      const tick1 = peritext.savedSlices.set.doc.tick;
      const tick2 = peritext.extraSlices.set.doc.tick;
      const tick3 = peritext.localSlices.set.doc.tick;
      expect(editor.extra.slices.size()).toBe(1);
      const range = peritext.rangeAt(1, 5);
      const deleted = peritext.delSlices(range);
      peritext.refresh();
      const tick4 = peritext.savedSlices.set.doc.tick;
      const tick5 = peritext.extraSlices.set.doc.tick;
      const tick6 = peritext.localSlices.set.doc.tick;
      expect(deleted).toBe(true);
      expect(editor.extra.slices.size()).toBe(0);
      expect(tick1 === tick4).toBe(true);
      expect(tick2 < tick5).toBe(true);
      expect(tick3 === tick6).toBe(true);
    });
  });
};

describe('basic alphabet', () => run(setupAlphabetKit));
describe('alphabet with chunk splits', () => run(setupAlphabetChunkSplitKit));
describe('alphabet with deletes', () => run(setupAlphabetWithDeletesKit));
describe('alphabet with two chunks', () => run(setupAlphabetWithTwoChunksKit));
