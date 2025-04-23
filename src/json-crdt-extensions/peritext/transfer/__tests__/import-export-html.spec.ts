import {setupKit} from '../../__tests__/setup';
import {CommonSliceType} from '../../slice';
import {fromHtml, toViewRange} from '../import-html';

test('a single paragraph', () => {
  const {peritext, editor} = setupKit();
  const html = '<p>Hello world</p>';
  const peritextMl = fromHtml(html, editor.getRegistry());
  const rangeView = toViewRange(peritextMl);
  peritext.editor.import(0, rangeView);
  peritext.refresh();
  const json = peritext.blocks.toJson();
  expect(json).toEqual(['', null, [CommonSliceType.p, null, 'Hello world']]);
});
