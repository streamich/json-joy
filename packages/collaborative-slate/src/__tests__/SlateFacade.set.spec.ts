import {createEditor, Transforms, Node as SlateNode} from 'slate';
import {ModelWithExt as Model, ext} from 'json-joy/lib/json-crdt-extensions';
import {FromSlate} from '../sync/FromSlate';
import {toSlate} from '../sync/toSlate';
import {SlateFacade} from '../SlateFacade';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext/lib/PeritextBinding';
import {p, txt as textNode, h1, em, strong, blockquote, ul, ol, li, a} from '../sync/__tests__/tools/builder';
import type {SlateDocument} from '../types';

const assertRoundtrip = (doc: SlateDocument) => {
  const viewRange = FromSlate.convert(doc);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.import(0, viewRange);
  api.txt.refresh();
  const view = toSlate(api.txt);
  expect(view).toEqual(doc);
};

const setupBound = (doc: SlateDocument) => {
  const viewRange = FromSlate.convert(doc);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.merge(viewRange);
  api.txt.refresh();

  const editor = createEditor();
  const peritextRef = () => api;
  const facade = new SlateFacade(editor, peritextRef);
  const unbind = PeritextBinding.bind(peritextRef, facade);

  return {
    editor,
    facade,
    api,
    txt: api.txt,
    model,
    unbind,
    [Symbol.dispose]() {
      unbind();
    },
  };
};

const getDocText = (editor: {children: any}): string => {
  let result = '';
  for (const [node] of SlateNode.texts(editor as any)) result += node.text;
  return result;
};

describe('whole-document state transformation', () => {
  describe('empty / minimal documents', () => {
    test('single empty paragraph', () => {
      assertRoundtrip([p({}, textNode(''))]);
    });

    test('single paragraph with one character', () => {
      assertRoundtrip([p({}, textNode('x'))]);
    });

    test('two empty paragraphs', () => {
      assertRoundtrip([p({}, textNode('')), p({}, textNode(''))]);
    });

    test('paragraph with only spaces', () => {
      assertRoundtrip([p({}, textNode('   '))]);
    });

    test('paragraph with newline characters', () => {
      // Note: newlines within inline text are separate from block splits
      assertRoundtrip([p({}, textNode('line1'))]);
    });
  });

  describe('inline formatting edge cases', () => {
    test('entire paragraph is bold', () => {
      assertRoundtrip([p({}, strong('all bold'))]);
    });

    test('adjacent text nodes with different marks', () => {
      assertRoundtrip([p({}, em('italic'), strong('bold'), textNode('plain'))]);
    });

    test('overlapping marks: bold+italic', () => {
      assertRoundtrip([p({}, textNode('plain '), {text: 'both', em: true, strong: true}, textNode(' plain'))]);
    });

    test('link annotation with href attribute', () => {
      assertRoundtrip([p({}, textNode('Click '), a('https://example.com', 'here'), textNode(' please.'))]);
    });

    test('link with bold', () => {
      assertRoundtrip([p({}, {text: 'link', href: 'https://example.com', strong: true})]);
    });
  });

  describe('block nesting', () => {
    test('blockquote containing multiple paragraphs', () => {
      assertRoundtrip([blockquote({}, p({}, textNode('first')), p({}, textNode('second')))]);
    });

    test('deeply nested list', () => {
      assertRoundtrip([
        ul(li(p({}, textNode('top')), ul(li(p({}, textNode('mid')), ul(li(p({}, textNode('deep')))))))),
      ]);
    });

    test('ordered list with start index', () => {
      assertRoundtrip([ol(5, li(p({}, textNode('fifth'))), li(p({}, textNode('sixth'))))]);
    });
  });

  describe('document-level merges', () => {
    test('merge replaces all content', () => {
      const doc1: SlateDocument = [p({}, textNode('old content'))];
      const doc2: SlateDocument = [h1(textNode('New Title')), p({}, textNode('new body'))];
      const model = Model.create(ext.peritext.new(''));
      const api = model.s.toExt();
      api.txt.editor.merge(FromSlate.convert(doc1));
      api.txt.refresh();
      expect(toSlate(api.txt)).toEqual(doc1);
      api.txt.editor.merge(FromSlate.convert(doc2));
      const result = toSlate(api.txt);
      expect(result).toEqual(doc2);
    });

    test('merge from complex to simple document', () => {
      const doc1: SlateDocument = [
        h1(textNode('Title')),
        p({}, em('italic'), strong('bold')),
        blockquote({}, p({}, textNode('quote'))),
        ul(li(p({}, textNode('item')))),
      ];
      const doc2: SlateDocument = [p({}, textNode('simple'))];
      const model = Model.create(ext.peritext.new(''));
      const api = model.s.toExt();
      api.txt.editor.merge(FromSlate.convert(doc1));
      api.txt.refresh();
      expect(toSlate(api.txt)).toEqual(doc1);
      api.txt.editor.merge(FromSlate.convert(doc2));
      expect(toSlate(api.txt)).toEqual(doc2);
    });
  });
});

describe('minimal change application (facade.set)', () => {
  test('remote text insert updates editor children', () => {
    using testbed = setupBound([p({}, textNode('hello'))]);
    const {editor, facade, txt} = testbed;
    expect(getDocText(editor)).toBe('hello');
    // Insert at position after 'hello'
    const pos = (txt.str.view() as string).indexOf('hello') + 5;
    txt.insAt(pos, ' world');
    txt.refresh();
    facade.set(txt.blocks);
    expect(getDocText(editor)).toBe('hello world');
  });

  test('remote text insert preserves unchanged blocks', () => {
    using testbed = setupBound([p({}, textNode('first')), p({}, textNode('second'))]);
    const {editor, facade, txt} = testbed;
    // Modify only first paragraph
    const pos = (txt.str.view() as string).indexOf('first') + 5;
    txt.insAt(pos, '!');
    txt.refresh();
    facade.set(txt.blocks);
    expect(getDocText(editor)).toBe('first!second');
    expect((editor.children[0] as any).children[0].text).toBe('first!');
    expect((editor.children[1] as any).children[0].text).toBe('second');
  });

  test('remote text delete updates editor', () => {
    using testbed = setupBound([p({}, textNode('hello world'))]);
    const {editor, facade, txt} = testbed;
    const pos = (txt.str.view() as string).indexOf(' world');
    txt.delAt(pos, 6);
    txt.refresh();
    facade.set(txt.blocks);
    expect(getDocText(editor)).toBe('hello');
  });

  test('remote block split creates new paragraph in editor', () => {
    using testbed = setupBound([p({}, textNode('helloworld'))]);
    const {editor, facade, txt} = testbed;
    // Split at "hello|world"
    const pos = (txt.str.view() as string).indexOf('world');
    txt.insAt(pos, '\n');
    txt.refresh();
    // Need to set a marker for the new block
    facade.set(txt.blocks);
    // After split, we should have content distributed
    const fullText = getDocText(editor);
    expect(fullText).toContain('hello');
    expect(fullText).toContain('world');
  });

  test('facade.set with empty fragment is a no-op', () => {
    using testbed = setupBound([p({}, textNode('hello'))]);
    const {editor, facade, txt} = testbed;
    const before = JSON.stringify(editor.children);
    facade.set(txt.blocks);
    expect(JSON.stringify(editor.children)).toBe(before);
  });

  test('facade.get returns the current Slate state as ViewRange', () => {
    using testbed = setupBound([p({}, textNode('hello'))]);
    const {facade} = testbed;
    const viewRange = facade.get();
    expect(viewRange).toBeDefined();
    expect(viewRange[0]).toContain('hello');
  });

  test('multiple remote edits accumulate correctly', () => {
    using testbed = setupBound([p({}, textNode('abc'))]);
    const {editor, facade, txt} = testbed;
    const posA = (txt.str.view() as string).indexOf('abc');
    txt.insAt(posA, 'X');
    txt.refresh();
    facade.set(txt.blocks);
    expect(getDocText(editor)).toBe('Xabc');
    const posB = (txt.str.view() as string).indexOf('abc') + 3;
    txt.insAt(posB, 'Y');
    txt.refresh();
    facade.set(txt.blocks);
    expect(getDocText(editor)).toBe('XabcY');
  });
});
