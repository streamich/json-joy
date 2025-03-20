import {Anchor} from '../../rga/constants';
import {CommonSliceType} from '../../slice';
import {SliceBehavior, SliceHeaderShift} from '../../slice/constants';
import {fromHtml, toViewRange} from '../import-html';

describe('.fromHtml()', () => {
  test('a single paragraph', () => {
    const html = '<p>Hello world</p>';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual(['', null, [CommonSliceType.p, null, 'Hello world']]);
  });

  test('a paragraph with trailing text', () => {
    const html = '<p>Hello world</p> more text';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual(['', null, [CommonSliceType.p, null, 'Hello world'], ' more text']);
  });

  test('text formatted as italic', () => {
    const html = '<p>Hello world</p>\n<p><em>italic</em> text, <i>more italic</i></p>';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual([
      '',
      null,
      [CommonSliceType.p, null, 'Hello world'],
      '\n',
      [
        CommonSliceType.p,
        null,
        [CommonSliceType.i, {behavior: SliceBehavior.One, inline: true}, 'italic'],
        ' text, ',
        [CommonSliceType.i, {behavior: SliceBehavior.One, inline: true}, 'more italic'],
      ],
    ]);
  });

  test('can import a single <blockquote> block', () => {
    const html = '<blockquote>2b||!2b</blockquote>';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual(['', null, [CommonSliceType.blockquote, null, '2b||!2b']]);
  });

  test('can import a single <blockquote> block with nested single <p>', () => {
    const html = '<blockquote><p>2b||!2b</p></blockquote>';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual(['', null, [CommonSliceType.blockquote, null, [CommonSliceType.p, null, '2b||!2b']]]);
  });

  test('can import a single <blockquote> block after a <p> block', () => {
    const html = '<p>123</p><blockquote>2b||!2b</blockquote>';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual([
      '',
      null,
      [CommonSliceType.p, null, '123'],
      [CommonSliceType.blockquote, null, '2b||!2b'],
    ]);
  });

  test('can import a single <blockquote> block with nested single <p>, after a <p> block', () => {
    const html = '<p>123</p><blockquote><p>2b||!2b</p></blockquote>';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual([
      '',
      null,
      [CommonSliceType.p, null, '123'],
      [CommonSliceType.blockquote, null, [CommonSliceType.p, null, '2b||!2b']],
    ]);
  });

  test('can import a single <blockquote> block with nested single <p>, after a <p> block with inline formatting', () => {
    const html = '<p><b>1</b><code>2</code>3</p><blockquote><p>2b||!2b</p></blockquote>';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual([
      '',
      null,
      [
        CommonSliceType.p,
        null,
        [CommonSliceType.b, {behavior: SliceBehavior.One, inline: true}, '1'],
        [CommonSliceType.code, {behavior: SliceBehavior.One, inline: true}, '2'],
        '3',
      ],
      [CommonSliceType.blockquote, null, [CommonSliceType.p, null, '2b||!2b']],
    ]);
  });
});

describe('.toViewRange()', () => {
  test('plain text', () => {
    const html = 'this is plain text';
    const peritextMl = fromHtml(html);
    const view = toViewRange(peritextMl);
    expect(view).toEqual(['this is plain text', 0, []]);
  });

  test('a single paragraph', () => {
    const html = '<p>Hello world</p>';
    const peritextMl = fromHtml(html);
    const view = toViewRange(peritextMl);
    expect(view).toEqual(['\nHello world', 0, [[0, 0, 0, 0]]]);
  });

  test('paragraph with bold text', () => {
    const html = '<p><b>123</b></p>';
    const peritextMl = fromHtml(html);
    const view = toViewRange(peritextMl);
    expect(view).toEqual([
      '\n123',
      0,
      [
        [0, 0, 0, 0],
        [10, 1, 4, -3],
      ],
    ]);
  });

  test('two consecutive paragraphs', () => {
    const html = '<p>Hello world</p><p>Goodbye world</p>';
    const peritextMl = fromHtml(html);
    const view = toViewRange(peritextMl);
    expect(view).toEqual([
      '\nHello world\nGoodbye world',
      0,
      [
        [0, 0, 0, 0],
        [0, 12, 12, 0],
      ],
    ]);
  });

  test('two paragraphs with whitespace gap', () => {
    const html = '  <p>Hello world</p>\n  <p>Goodbye world</p>';
    const peritextMl = fromHtml(html);
    const view = toViewRange(peritextMl);
    expect(view).toEqual([
      '\nHello world\nGoodbye world',
      0,
      [
        [0, 0, 0, 0],
        [0, 12, 12, 0],
      ],
    ]);
  });

  test('single inline annotation', () => {
    const html = 'here is some <em>italic</em> text';
    const peritextMl = fromHtml(html);
    const view = toViewRange(peritextMl);
    expect(view).toEqual([
      'here is some italic text',
      0,
      [
        [
          (SliceBehavior.One << SliceHeaderShift.Behavior) +
            (Anchor.Before << SliceHeaderShift.X1Anchor) +
            (Anchor.After << SliceHeaderShift.X2Anchor),
          13,
          19,
          CommonSliceType.i,
        ],
      ],
    ]);
  });
});
