import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import {toMdast, toMarkdown} from '../../transfer/export-markdown';
import {CommonSliceType} from '../../slice';

const runTests = (setup: () => Kit) => {
  describe('MDAST', () => {
    test('can export two paragraphs', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.p);
      peritext.refresh();
      const fragment = peritext.fragment(peritext.rangeAt(4, 10));
      fragment.refresh();
      const mdast = toMdast(fragment.toJson());
      expect(mdast).toMatchObject({
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{type: 'text', value: 'efghij'}],
          },
          {
            type: 'paragraph',
            children: [{type: 'text', value: 'klm'}],
          },
        ],
      });
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
      const mdast = toMdast(fragment.toJson());
      expect(mdast).toMatchObject({
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{type: 'text', value: 'efghij'}],
          },
          {
            type: 'paragraph',
            children: [{type: 'text', value: 'klm'}],
          },
        ],
      });
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
      const mdast = toMdast(fragment.toJson());
      expect(mdast).toMatchObject({
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {type: 'text', value: 'ef'},
              {type: 'strong', children: [{type: 'text', value: 'g'}]},
              {type: 'emphasis', children: [{type: 'strong', children: [{type: 'text', value: 'h'}]}]},
              {type: 'emphasis', children: [{type: 'text', value: 'i'}]},
              {type: 'text', value: 'j'},
            ],
          },
          {
            type: 'paragraph',
            children: [{type: 'text', value: 'klm'}],
          },
        ],
      });
    });

    test('can export blockquote', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.blockquote);
      editor.cursor.setAt(13, 2);
      editor.saved.insOne(CommonSliceType.b);
      peritext.refresh();
      const fragment = peritext.fragment(peritext.rangeAt(4, 10));
      fragment.refresh();
      const mdast = toMdast(fragment.toJson());
      expect(mdast).toMatchObject({
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{type: 'text', value: 'efghij'}],
          },
          {
            type: 'blockquote',
            children: [
              {
                type: 'paragraph',
                children: [
                  {type: 'text', value: 'kl'},
                  {type: 'strong', children: [{type: 'text', value: 'm'}]},
                ],
              },
            ],
          },
        ],
      });
    });
  });

  describe('Markdown', () => {
    test('can export two paragraphs', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.p);
      peritext.refresh();
      const fragment = peritext.fragment(peritext.rangeAt(4, 10));
      fragment.refresh();
      const html = toMarkdown(fragment.toJson());
      expect(html).toBe('efghij\n\nklm');
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
      const html = toMarkdown(json);
      expect(html).toBe('efghij\n\nklm');
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
      const html = toMarkdown(json);
      expect(html).toEqual('ef__g___**h**__i_j\n\nklm');
    });

    test('can export blockquote', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.blockquote);
      editor.cursor.setAt(13, 2);
      editor.saved.insOne(CommonSliceType.b);
      peritext.refresh();
      const fragment = peritext.fragment(peritext.rangeAt(4, 10));
      fragment.refresh();
      const json = fragment.toJson();
      const html = toMarkdown(json);
      expect(html).toEqual('efghij\n\n> kl__m__');
    });
  });
};

describe('Fragment.toJson()', () => {
  runAlphabetKitTestSuite(runTests);
});
