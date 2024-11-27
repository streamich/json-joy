import {
  type Kit,
  setupAlphabetKit,
} from '../../__tests__/setup';
import {CommonSliceType} from '../../slice';

const runTests = (setup: () => Kit) => {
  test('can export two paragraphs', () => {
    const {editor, peritext} = setup();
    editor.cursor.setAt(10);
    editor.saved.insMarker(CommonSliceType.p);
    peritext.refresh();
    const fragment = peritext.fragment(peritext.rangeAt(4, 10));
    fragment.refresh();
    expect(fragment.toJsonMl()).toEqual([
      'div',
      {},
      ['p', {}, 'efghij'],
      ['p', {}, 'klm'],
    ]);
    expect(fragment.toHtml()).toBe('<div><p>efghij</p><p>klm</p></div>');
  });
};

describe('Fragment.toJsonMl()', () => {
  describe('basic alphabet', () => {
    runTests(setupAlphabetKit);
  });

  // describe('alphabet with two chunks', () => {
  //   runTests(setupAlphabetWithTwoChunksKit);
  // });

  // describe('alphabet with chunk split', () => {
  //   runTests(setupAlphabetChunkSplitKit);
  // });

  // describe('alphabet with deletes', () => {
  //   runTests(setupAlphabetWithDeletesKit);
  // });
});
