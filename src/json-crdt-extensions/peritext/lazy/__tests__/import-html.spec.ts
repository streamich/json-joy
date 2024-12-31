import {Anchor} from '../../rga/constants';
import {CommonSliceType} from '../../slice';
import {SliceBehavior, SliceHeaderShift} from '../../slice/constants';
import {fromHtml, toViewRange} from '../import-html';

describe('.fromHtml()', () => {
  test('a single paragraph', () => {
    const html = '<p>Hello world</p>';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual([
      '',
      null,
      [CommonSliceType.p, null, 'Hello world'],
    ]);
  });

  test('a paragraph with trailing text', () => {
    const html = '<p>Hello world</p> more text';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual([
      '',
      null,
      [CommonSliceType.p, null, 'Hello world'],
      ' more text',
    ]);
  });

  test('text formatted as italic', () => {
    const html = '<p>Hello world</p>\n<p><em>italic</em> text, <i>more italic</i></p>';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual([
      '',
      null,
      [CommonSliceType.p, null, 'Hello world'],
      '\n',
      [CommonSliceType.p, null,
        [CommonSliceType.i, {behavior: SliceBehavior.One, inline:true}, 'italic'],
        ' text, ',
        [CommonSliceType.i, {behavior: SliceBehavior.One, inline:true}, 'more italic'],
      ],
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
    expect(view).toEqual(['Hello world', 0, [[0, 0, 0, 0]]]);
  });

  test('single inline annotation', () => {
    const html = 'here is some <em>italic</em> text';
    const peritextMl = fromHtml(html);
    const view = toViewRange(peritextMl);
    expect(view).toEqual(['here is some italic text', 0, [
      [(SliceBehavior.One << SliceHeaderShift.Behavior) +
        (Anchor.Before << SliceHeaderShift.X1Anchor) +
        (Anchor.After << SliceHeaderShift.X2Anchor),
        13, 19, CommonSliceType.i],
    ]]);
  });
});