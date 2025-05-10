import {SliceRegistry} from '../../registry/SliceRegistry';
import {CommonSliceType} from '../../slice';
import {SliceStacking} from '../../slice/constants';
import {fromMarkdown} from '../import-markdown';

describe('fromMarkdown()', () => {
  test('a single paragraph', () => {
    const text = 'Hello world';
    const registry = SliceRegistry.withCommon();
    const peritextMl = fromMarkdown(text, registry);
    expect(peritextMl).toEqual(['', null, [CommonSliceType.p, null, 'Hello world']]);
  });

  test('can import a link', () => {
    const text = '[Hello world](https://example.com)';
    const registry = SliceRegistry.withCommon();
    const peritextMl = fromMarkdown(text, registry);
    expect(peritextMl).toMatchObject([
      '',
      null,
      [CommonSliceType.p, null, [CommonSliceType.a, {data: {href: 'https://example.com'}}, 'Hello world']],
    ]);
  });

  test('multi-block realistic example', () => {
    const text =
      'The German __automotive sector__ is in the process of *cutting \n' +
      'thousands of jobs* as it grapples with a global shift toward electric vehicles \n' +
      '— a transformation Musk himself has been at the forefront of.\n' +
      '\n' +
      '> To be or not to be, that is the question.\n' +
      '\n' +
      'A `ClipboardEvent` is dispatched for copy, cut, and paste events, and it contains \n' +
      'a `clipboardData` property of type `DataTransfer`. The `DataTransfer` object \n' +
      'is used by the Clipboard Events API to hold multiple representations of data.\n';
    const registry = SliceRegistry.withCommon();
    const peritextMl = fromMarkdown(text, registry);
    expect(peritextMl).toEqual([
      '',
      null,
      [
        CommonSliceType.p,
        null,
        'The German ',
        [CommonSliceType.b, {stacking: SliceStacking.One, inline: true}, 'automotive sector'],
        ' is in the process of ',
        [CommonSliceType.i, {stacking: SliceStacking.One, inline: true}, 'cutting thousands of jobs'],
        ' as it grapples with a global shift toward electric vehicles — a transformation Musk himself has been at the forefront of.',
      ],
      [CommonSliceType.blockquote, null, [CommonSliceType.p, null, 'To be or not to be, that is the question.']],
      [
        CommonSliceType.p,
        null,
        'A ',
        [CommonSliceType.code, {stacking: SliceStacking.One, inline: true}, 'ClipboardEvent'],
        ' is dispatched for copy, cut, and paste events, and it contains a ',
        [CommonSliceType.code, {stacking: SliceStacking.One, inline: true}, 'clipboardData'],
        ' property of type ',
        [CommonSliceType.code, {stacking: SliceStacking.One, inline: true}, 'DataTransfer'],
        '. The ',
        [CommonSliceType.code, {stacking: SliceStacking.One, inline: true}, 'DataTransfer'],
        ' object is used by the Clipboard Events API to hold multiple representations of data.',
      ],
    ]);
  });
});
