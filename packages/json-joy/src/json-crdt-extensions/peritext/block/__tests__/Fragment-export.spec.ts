import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import {CommonSliceType} from '../../slice';

const runTests = (setup: () => Kit) => {
  test('can export two paragraphs', () => {
    const {editor, peritext} = setup();
    editor.cursor.setAt(10);
    editor.saved.insMarker(CommonSliceType.p);
    peritext.refresh();
    const fragment = peritext.fragment(peritext.rangeAt(4, 10));
    fragment.refresh();
    const node = fragment.toJson();
    expect(node).toEqual(['', null, [0, null, 'efghij'], [0, null, 'klm']]);
  });

  test('can export two paragraphs with inline formatting', () => {
    const {editor, peritext} = setup();
    editor.cursor.setAt(10);
    editor.saved.insMarker(CommonSliceType.p);
    editor.cursor.setAt(6, 2);
    editor.saved.insOne(CommonSliceType.b);
    editor.cursor.setAt(7, 2);
    editor.saved.insOne(CommonSliceType.i);
    peritext.refresh();
    const fragment = peritext.fragment(peritext.rangeAt(4, 10));
    fragment.refresh();
    const node = fragment.toJson();
    expect(node).toEqual([
      '',
      null,
      [
        0,
        null,
        'ef',
        [-3, {inline: true}, 'g'],
        [-4, {inline: true}, [-3, {inline: true}, 'h']],
        [-4, {inline: true}, 'i'],
        'j',
      ],
      [0, null, 'klm'],
    ]);
  });
};

describe('Fragment.toJson()', () => {
  runAlphabetKitTestSuite(runTests);
});
