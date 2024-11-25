import {
  type Kit,
  setupAlphabetKit,
} from '../../__tests__/setup';

const runTests = (setup: () => Kit) => {
  test('...', () => {
    const {editor, peritext} = setup();
    editor.cursor.setAt(10);
    editor.saved.insMarker(['p'], 'p1');
    peritext.refresh();
    const fragment = peritext.fragment(peritext.rangeAt(4, 10));
    fragment.refresh();

    console.log(fragment + '')
    console.log(fragment.toJsonMl());
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
