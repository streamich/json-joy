import {fromHtml} from '../import-html';

describe('.fromHtml()', () => {
  it('a single paragraph', () => {
    const html = '<p>Hello world</p>';
    const peritextMl = fromHtml(html);
    console.log(peritextMl);
    // expect(peritextMl).toEqual(['p', null, 'Hello world']);
  });
});