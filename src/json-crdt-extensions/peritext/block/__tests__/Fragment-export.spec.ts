import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import {toJsonMl} from '../../export/toJsonMl';
import {CommonSliceType} from '../../slice';

const runTests = (setup: () => Kit) => {
  test('can export two paragraphs', () => {
    const {editor, peritext} = setup();
    editor.cursor.setAt(10);
    editor.saved.insMarker(CommonSliceType.p);
    peritext.refresh();
    const fragment = peritext.fragment(peritext.rangeAt(4, 10));
    fragment.refresh();
    const html = toJsonMl(fragment.toJson());
    expect(html).toEqual([
      '',
      null,
      ['p', null, 'efghij'],
      ['p', null, 'klm'],
    ]);
  });

  test('can export two paragraphs with inline formatting', () => {
    const {editor, peritext} = setup();
    editor.cursor.setAt(10);
    editor.saved.insMarker(CommonSliceType.p);
    editor.cursor.setAt(6, 2);
    editor.saved.insOverwrite(CommonSliceType.b);
    editor.cursor.setAt(7, 2);
    editor.saved.insOverwrite(CommonSliceType.i);
    peritext.refresh();
    const fragment = peritext.fragment(peritext.rangeAt(4, 10));
    fragment.refresh();
    const html = toJsonMl(fragment.toJson());
    expect(html).toEqual([
      '',
      null,
      ['p', null,
        'ef',
        ['b', null, 'g'],
        ['i', null,
          ['b', null, 'h'],
        ],
        ['i', null, 'i'],
        'j',
      ],
      ['p', null, 'klm'],
    ]);
  });
};

describe('Fragment.toJson()', () => {
  runAlphabetKitTestSuite(runTests);
});
