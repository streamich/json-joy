import {CommonSliceType} from '../../slice';
import {fromHtml} from '../import-html';

describe('.fromHtml()', () => {
  it('a single paragraph', () => {
    const html = '<p>Hello world</p>';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual([
      '',
      null,
      [CommonSliceType.p, null, 'Hello world'],
    ]);
  });

  it('a paragraph with trailing text', () => {
    const html = '<p>Hello world</p> more text';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual([
      '',
      null,
      [CommonSliceType.p, null, 'Hello world'],
      ' more text',
    ]);
  });

  it('text formatted as italic', () => {
    const html = '<p>Hello world</p>\n<p><em>italic</em> text, <i>more italic</i></p>';
    const peritextMl = fromHtml(html);
    expect(peritextMl).toEqual([
      '',
      null,
      [CommonSliceType.p, null, 'Hello world'],
      '\n',
      [CommonSliceType.p, null,
        [CommonSliceType.i, null, 'italic'],
        ' text, ',
        [CommonSliceType.i, null, 'more italic'],
      ],
    ]);
  });
});