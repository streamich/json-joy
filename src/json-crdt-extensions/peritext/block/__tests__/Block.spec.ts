import {setupHelloWorldKit} from '../../__tests__/setup';
import {Block} from '../Block';

const setup = () => {
  const kit = setupHelloWorldKit();
  kit.peritext.editor.cursor.setAt(6);
  const data = {
    source: 'http://example.com'
  };
  kit.peritext.editor.saved.insMarker(['li', 'blockquote'], data);
  kit.peritext.refresh();
  const marker = kit.peritext.overlay.markers().next().value!;
  const type = marker.type();
  const path = type instanceof Array ? type : [type];
  const block = new Block(kit.peritext, path, marker);
  return {
    ...kit,
    block,
    marker,
  };
};

test('can retrieve the "tag"', () => {
  const {block} = setup();
  expect(block.tag()).toBe('blockquote');
});

test('can retrieve marker data as "attributes"', () => {
  const {block} = setup();
  expect(block.attr()).toEqual({source: 'http://example.com'});
});

describe('refresh()', () => {
  test('returns the same hash, when no changes were made', () => {
    const {block} = setup();
    const hash1 = block.refresh();
    expect(hash1).toBe(block.hash);
    const hash2 = block.refresh();
    expect(hash2).toBe(hash1);
    expect(hash2).toBe(block.hash);
  });
});
