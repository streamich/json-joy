/** @jsx h */
/** @jsxFrag h */
import {h} from '../jsx';
import {SliceTypeCon} from '../../slice/constants';
import {setup} from './setup';

test('can create basic JSX elements', () => {
  const jsx = (
    <div className="test">
      <b>Hello</b>
    </div>
  );

  expect(jsx).toEqual([
    SliceTypeCon.div,
    {data: {className: 'test'}, inline: false, stacking: 0},
    [SliceTypeCon.b, {inline: true, stacking: 2}, 'Hello'],
  ]);
});

test('can import JSX nodes', () => {
  const kit = setup();
  const jsx = (
    <>
      <p>
        <b>Hello</b> <u>world</u>!
      </p>
      <blockquote>
        <p>Test</p>
      </blockquote>
    </>
  );
  kit.transfer.fromJson(0, jsx as any);
  kit.peritext.refresh();
  expect(kit.transfer.toHtml()).toBe('<p><b>Hello</b> <u>world</u>!</p><blockquote><p>Test</p></blockquote>');
});
