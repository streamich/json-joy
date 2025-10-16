import {CommonSliceType} from '../../slice';
import {setup} from './setup';

const assertMarkdownReExport = (markdown: string) => {
  const kit = setup();
  kit.transfer.fromMarkdown(0, markdown);
  kit.peritext.refresh();
  const back = kit.transfer.toMarkdown(kit.peritext.rangeAll()!);
  expect(back).toBe(markdown);
};

test('ignores empty inline tags', () => {
  const {peritext, transfer} = setup();
  const html =
    '1<span><a/></span><b></b>2<span /><b data-json-joy-peritext="eyJ2aWV3IjpbImdyYXBwbGVzIiw4MixbXV19"></b>';
  peritext.strApi().ins(0, 'ab');
  transfer.fromHtml(1, html);
  peritext.refresh();
  // console.log(peritext + '');
  expect(peritext.savedSlices.size()).toBe(0);
  expect(peritext.strApi().view()).toBe('a12b');
});

test('removes meta tags', () => {
  const {peritext, transfer} = setup();
  const html = '<meta>0</meta>12<meta />';
  peritext.strApi().ins(0, 'ab');
  transfer.fromHtml(1, html);
  peritext.refresh();
  // console.log(peritext + '');
  expect(peritext.savedSlices.size()).toBe(0);
  expect(peritext.strApi().view()).toBe('a12b');
});

test('does not insert a first paragraph, if insert inside the first block (implicit paragraph)', () => {
  const {peritext, transfer} = setup();
  const html = '<p>123</p>';
  peritext.strApi().ins(0, 'ab');
  transfer.fromHtml(1, html);
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('a123b');
  expect(peritext.blocks.root.children.length).toBe(1);
  const html2 = transfer.toHtml(peritext.rangeAll()!);
  expect(html2).toBe('<p>a123b</p>');
});

test('does not insert a first paragraph, inserts the second paragraph, if insert inside the first block (implicit paragraph)', () => {
  const {peritext, transfer} = setup();
  const html = '<p>1</p><p>2</p>';
  peritext.strApi().ins(0, 'ab');
  transfer.fromHtml(1, html);
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('a1\n2b');
  expect(peritext.blocks.root.children.length).toBe(2);
  const html2 = transfer.toHtml(peritext.rangeAll()!);
  expect(html2).toBe('<p>a1</p><p>2b</p>');
});

test('does not insert a first paragraph, inserts the second paragraph, if inside a paragraph', () => {
  const {peritext, transfer} = setup();
  transfer.fromHtml(0, '<p>ab</p><p>cd</p>');
  peritext.refresh();
  const html = '<p>1</p><p>2</p>';
  transfer.fromHtml(4, html);
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('ab\nc1\n2d');
  expect(peritext.blocks.root.children.length).toBe(3);
  const html2 = transfer.toHtml(peritext.rangeAll()!);
  expect(html2).toBe('<p>ab</p><p>c1</p><p>2d</p>');
});

test('inserts the first paragraph if markers of different type', () => {
  const {peritext, transfer} = setup();
  transfer.fromHtml(0, '<p>ab</p><p>cd</p>');
  peritext.refresh();
  const html = '<blockquote>1</blockquote><blockquote>2</blockquote>';
  transfer.fromHtml(4, html);
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('ab\nc\n1\n2d');
  expect(peritext.blocks.root.children.length).toBe(4);
  const html2 = transfer.toHtml(peritext.rangeAll()!);
  expect(html2).toBe('<p>ab</p><p>c</p><blockquote>1</blockquote><blockquote>2d</blockquote>');
});

test('does not insert paragraph marker into an empty document', () => {
  const {peritext, transfer} = setup();
  transfer.fromHtml(0, '<p>1</p>');
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('1');
  expect(peritext.blocks.root.children.length).toBe(1);
  expect(peritext.savedSlices.size()).toBe(0);
});

test('does not insert the first paragraph marker into an empty document, two paragraphs', () => {
  const {peritext, transfer} = setup();
  transfer.fromHtml(0, '<p>1</p><p>2</p>');
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('1\n2');
  expect(peritext.blocks.root.children.length).toBe(2);
  expect(peritext.savedSlices.size()).toBe(1);
});

test('does not create a new paragraph if, inserted inside a paragraph', () => {
  const {peritext, transfer} = setup();
  const html = '<meta charset="utf-8"><p>123</p><b data-json-joy-peritext="eyJ2aWV3IjpbImdyYXBwbGVzIiw4MixbXV19"></b>';
  peritext.strApi().ins(0, 'ab');
  transfer.fromHtml(1, html);
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('a123b');
  expect(peritext.blocks.root.children.length).toBe(1);
  const html2 = transfer.toHtml(peritext.rangeAll()!);
  expect(html2).toBe('<p>a123b</p>');
});

describe('Markdown', () => {
  test('can insert bold into text', () => {
    const {peritext, transfer} = setup();
    const md = '__123__';
    peritext.strApi().ins(0, 'ab');
    peritext.refresh();
    transfer.fromMarkdown(1, md);
    peritext.refresh();
    const all = peritext.rangeAll()!;
    const html = transfer.toHtml(all);
    expect(html).toBe('<p>a<b>123</b>b</p>');
    const md2 = transfer.toMarkdown(all);
    expect(md2).toBe('a__123__b');
  });

  test('can insert multiple annotations into text', () => {
    const {peritext, transfer} = setup();
    const md = '__123__ and *456*';
    peritext.strApi().ins(0, 'ab');
    peritext.refresh();
    transfer.fromMarkdown(1, md);
    peritext.refresh();
    const all = peritext.rangeAll()!;
    const html = transfer.toHtml(all);
    expect(html).toBe('<p>a<b>123</b> and <i>456</i>b</p>');
    const md2 = transfer.toMarkdown(all);
    expect(md2).toBe('a__123__ and _456_b');
  });

  test('can insert two paragraphs into text', () => {
    const {peritext, transfer} = setup();
    const md = '123\n\n456';
    peritext.strApi().ins(0, 'ab');
    peritext.refresh();
    transfer.fromMarkdown(1, md);
    peritext.refresh();
    const all = peritext.rangeAll()!;
    const html = transfer.toHtml(all);
    expect(html).toBe('<p>a123</p><p>456b</p>');
    const md2 = transfer.toMarkdown(all);
    expect(md2).toBe('a123\n\n456b');
  });

  test('can insert two paragraphs into the first paragraph of two-paragraph text', () => {
    const {peritext, transfer} = setup();
    const md = '__123__\n\n++456++';
    peritext.strApi().ins(0, 'abcd');
    peritext.editor.cursor.setAt(2);
    peritext.editor.saved.insMarker(CommonSliceType.p);
    peritext.refresh();
    transfer.fromMarkdown(1, md);
    peritext.refresh();
    const all = peritext.rangeAll()!;
    const html = transfer.toHtml(all);
    expect(html).toBe('<p>a<b>123</b></p><p><u>456</u>b</p><p>cd</p>');
    const md2 = transfer.toMarkdown(all);
    expect(md2).toBe('a__123__\n\n++456++b\n\ncd');
  });

  test('can insert two paragraphs into the second paragraph of two-paragraph text', () => {
    const {peritext, transfer} = setup();
    const md = '__123__\n\n++456++';
    peritext.strApi().ins(0, 'abcd');
    peritext.editor.cursor.setAt(2);
    peritext.editor.saved.insMarker(CommonSliceType.p);
    peritext.refresh();
    transfer.fromMarkdown(4, md);
    peritext.refresh();
    const all = peritext.rangeAll()!;
    const html = transfer.toHtml(all);
    expect(html).toBe('<p>ab</p><p>c<b>123</b></p><p><u>456</u>d</p>');
    const md2 = transfer.toMarkdown(all);
    expect(md2).toBe('ab\n\nc__123__\n\n++456++d');
  });

  test('can insert Markdown with inline line breaks', () => {
    const {peritext, transfer} = setup();
    const md = '1\n2\n3';
    peritext.strApi().ins(0, 'ab');
    peritext.refresh();
    transfer.fromMarkdown(1, md);
    peritext.refresh();
    const all = peritext.rangeAll()!;
    const html = transfer.toHtml(all);
    expect(html).toBe('<p>a1 2 3b</p>');
    const md2 = transfer.toMarkdown(all);
    expect(md2).toBe('a1 2 3b');
  });

  test('can insert a blockquote and a paragraph into empty string', () => {
    const {peritext, transfer} = setup();
    const md = '> blockquote';
    transfer.fromMarkdown(0, md);
    peritext.refresh();
    const all = peritext.rangeAll()!;
    const html = transfer.toHtml(all);
    expect(html).toBe('<blockquote><p>blockquote</p></blockquote>');
    const md2 = transfer.toMarkdown(all);
    expect(md2).toBe('> blockquote');
  });

  test('can insert a blockquote', () => {
    const {peritext, transfer} = setup();
    const md = '> blockquote';
    peritext.strApi().ins(0, 'ab');
    peritext.refresh();
    transfer.fromMarkdown(1, md);
    peritext.refresh();
    const all = peritext.rangeAll()!;
    const html = transfer.toHtml(all);
    expect(html).toBe('<p>a</p><blockquote><p>blockquoteb</p></blockquote>');
    const md2 = transfer.toMarkdown(all);
    expect(md2).toBe('a\n\n> blockquoteb');
  });

  test('can insert a blockquote and a paragraph', () => {
    const {peritext, transfer} = setup();
    const md = '> blockquote\n\nparagraph';
    peritext.strApi().ins(0, 'ab');
    peritext.refresh();
    transfer.fromMarkdown(1, md);
    peritext.refresh();
    const all = peritext.rangeAll()!;
    const html = transfer.toHtml(all);
    expect(html).toBe('<p>a</p><blockquote><p>blockquote</p></blockquote><p>paragraphb</p>');
    const md2 = transfer.toMarkdown(all);
    expect(md2).toBe('a\n\n> blockquote\n\nparagraphb');
  });

  test('can insert realistic 3 paragraphs of Markdown', () => {
    const {peritext, transfer} = setup();
    const md =
      'The German __automotive sector__ is in the process of _cutting ' +
      'thousands of jobs_ as it grapples with a global shift toward electric vehicles ' +
      '— a transformation Musk himself has been at the forefront of.' +
      '\n\n' +
      '> To be or not to be, that is the question.' +
      '\n\n' +
      'A `ClipboardEvent` is dispatched for copy, cut, and paste events, and it contains ' +
      'a `clipboardData` property of type `DataTransfer`. The `DataTransfer` object ' +
      'is used by the Clipboard Events API to hold multiple representations of data.';
    peritext.strApi().ins(0, 'ab');
    peritext.refresh();
    transfer.fromMarkdown(1, md);
    peritext.refresh();
    // console.log(peritext.blocks + '');
    const all = peritext.rangeAll()!;
    const md2 = transfer.toMarkdown(all);
    // console.log(md2);
    expect(md2).toBe('a' + md + 'b');
  });

  test('can re-export a single paragraph', () => {
    assertMarkdownReExport('Hello world');
  });

  test('can re-export a paragraph and a blockquote', () => {
    assertMarkdownReExport('Hello world\n\n> blockquote');
  });

  test('can re-export a single blockquote', () => {
    assertMarkdownReExport('> blockquote');
  });

  test('can re-export a code block', () => {
    assertMarkdownReExport('```\nconsole.log(123);\n```');
  });

  test.skip('can re-export a code with language specified', () => {
    assertMarkdownReExport('```js\nconsole.log(123);\n```');
  });

  test('can re-export various block elements', () => {
    assertMarkdownReExport('paragraph\n\n> blockquote');
  });

  test('can re-export various block elements', () => {
    assertMarkdownReExport('paragraph\n\n> blockquote');
    assertMarkdownReExport('paragraph\n\n> blockquot e\n\n```\ncode block\n```');
    assertMarkdownReExport('paragraph\n\n> blockquot e\n\n```\ncode block\n```\n\nparagraph 2');
    assertMarkdownReExport('paragraph\n\n> blockquot e\n\n```\ncode block\n```\n\nparagraph 2\n\n> blockquote 2');
  });

  test('can re-export various block elements with inline formatting', () => {
    assertMarkdownReExport('par_a_g`a`ph\n\n> blo__c__kqu`o`te');
    assertMarkdownReExport('par_a_g`a`ph\n\n> blo__c__kqu`o`te e\n\n```\ncode block\n```');
    assertMarkdownReExport('par_a_g`a`ph\n\n> blo__c__kqu`o`te e\n\n```\ncode block\n```\n\npar_a_g`a`ph 2');
    assertMarkdownReExport(
      'par_a_g`a`ph\n\n> blo__c__kqu`o`te e\n\n```\ncode block\n```\n\npar_a_g`a`ph 2\n\n> blo__c__kqu`o`te 2',
    );
  });

  test('can re-export demo text', () => {
    const markdown =
      'The German __automotive sector__ is in the process of _cutting ' +
      'thousands of jobs_ as it grapples with a global shift toward electric vehicles ' +
      '— a transformation Musk himself has been at the forefront of.' +
      '\n\n' +
      '> To be, or not to be: that is the question.' +
      '\n\n' +
      'This is code:' +
      '\n\n' +
      '```' +
      '\n' +
      'console.log(123);' +
      '\n' +
      '```' +
      '\n\n' +
      'A `ClipboardEvent` is dispatched for copy, cut, and paste events, and it contains ' +
      'a `clipboardData` property of type `DataTransfer`. The `DataTransfer` object ' +
      'is used by the Clipboard Events API to hold multiple representations of data.';
    assertMarkdownReExport(markdown);
  });
});
