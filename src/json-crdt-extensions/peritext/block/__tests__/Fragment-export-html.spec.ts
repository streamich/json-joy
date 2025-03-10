import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import {toHtml, toJsonMl} from '../../transfer/export-html';
import {CommonSliceType} from '../../slice';

const runTests = (setup: () => Kit) => {
  describe('JSON-ML', () => {
    test('can export two paragraphs', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.p);
      peritext.refresh();
      const fragment = peritext.fragment(peritext.rangeAt(4, 10));
      fragment.refresh();
      const html = toJsonMl(fragment.toJson());
      expect(html).toEqual(['', null, ['p', null, 'efghij'], ['p', null, 'klm']]);
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
      const html = toJsonMl(fragment.toJson());
      expect(html).toEqual([
        '',
        null,
        ['p', null, 'ef', ['b', null, 'g'], ['i', null, ['b', null, 'h']], ['i', null, 'i'], 'j'],
        ['p', null, 'klm'],
      ]);
    });
  });

  describe('HTML', () => {
    test('can export two paragraphs', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.p);
      peritext.refresh();
      const fragment = peritext.fragment(peritext.rangeAt(4, 10));
      fragment.refresh();
      const html = toHtml(fragment.toJson());
      expect(html).toBe('<p>efghij</p><p>klm</p>');
    });

    test('can export two paragraphs (formatted)', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.p);
      peritext.refresh();
      const fragment = peritext.fragment(peritext.rangeAt(4, 10));
      fragment.refresh();
      const html = toHtml(fragment.toJson(), '    ');
      expect(html).toBe('<p>efghij</p>\n<p>klm</p>');
    });

    test('can export two paragraphs (formatted and wrapped in <div>)', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.p);
      peritext.refresh();
      const fragment = peritext.fragment(peritext.rangeAt(4, 10));
      fragment.refresh();
      const json = fragment.toJson();
      json[0] = 'div';
      const html = toHtml(json, '    ');
      expect(html).toBe('<div>\n    <p>efghij</p>\n    <p>klm</p>\n</div>');
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
      const json = fragment.toJson();
      const html = toHtml(json, '');
      expect(html).toEqual('<p>ef<b>g</b><i><b>h</b></i><i>i</i>j</p><p>klm</p>');
    });

    test('can export two paragraphs with inline formatting (formatted)', () => {
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
      const json = fragment.toJson();
      const html = toHtml(json, '    ');
      expect(html).toEqual(
        '<p>\n    ef\n    <b>g</b>\n    <i>\n        <b>h</b>\n    </i>\n    <i>i</i>\n    j\n</p>\n<p>klm</p>',
      );
    });

    test('can export two paragraphs with inline formatting (formatted, wrapped in <div>)', () => {
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
      const json = fragment.toJson();
      json[0] = 'div';
      const html = toHtml(json, '  ');
      expect('\n' + html).toEqual(`
<div>
  <p>
    ef
    <b>g</b>
    <i>
      <b>h</b>
    </i>
    <i>i</i>
    j
  </p>
  <p>klm</p>
</div>`);
    });
  });
};

describe('Fragment.toJson()', () => {
  runAlphabetKitTestSuite(runTests);
});
