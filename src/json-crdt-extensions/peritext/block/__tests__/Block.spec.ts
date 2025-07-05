import {setupHelloWorldKit} from '../../__tests__/setup';
import {Block} from '../Block';

const setup = () => {
  const kit = setupHelloWorldKit();
  kit.peritext.editor.cursor.setAt(6);
  const data = {
    source: 'http://example.com',
  };
  kit.peritext.editor.saved.insMarker(['li', ['blockquote', 0, data]]);
  kit.peritext.refresh();
  const marker = kit.peritext.overlay.markers().next().value!;
  const type = marker.type();
  const path = type instanceof Array ? type : [type];
  const block = new Block(kit.peritext, path, marker, kit.peritext.pointAbsStart(), kit.peritext.pointAbsEnd());
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

describe('discriminants', () => {
  test('can construct a blockquote with two paragraphs', () => {
    const {peritext, editor} = setupHelloWorldKit();
    editor.cursor.setAt(8);
    editor.saved.insMarker(['blockquote', 'p']);
    editor.cursor.setAt(4);
    editor.saved.insMarker(['blockquote', 'p']);
    peritext.refresh();
    const block2 = peritext.blocks.root.children[1];
    expect(block2.children.length).toBe(2);
    expect(block2.children[0].path).toEqual(['blockquote', 'p']);
    expect(block2.children[0].text()).toBe('o wo');
    expect(block2.children[1].path).toEqual(['blockquote', 'p']);
    expect(block2.children[1].text()).toBe('rld');
  });

  test('can construct a two blockquotes with a paragraphs in each', () => {
    const {peritext, editor} = setupHelloWorldKit();
    editor.cursor.setAt(8);
    editor.saved.insMarker(['blockquote', 'p']);
    editor.cursor.setAt(4);
    editor.saved.insMarker([['blockquote', 1], 'p']);
    peritext.refresh();
    expect(peritext.blocks.root.children.length).toBe(3);
    const block2 = peritext.blocks.root.children[1];
    const block3 = peritext.blocks.root.children[2];
    expect(block2.children.length).toBe(1);
    expect(block2.children[0].path).toEqual([['blockquote', 1], 'p']);
    expect(block2.children[0].text()).toBe('o wo');
    expect(block3.children.length).toBe(1);
    expect(block3.children[0].path).toEqual(['blockquote', 'p']);
    expect(block3.children[0].text()).toBe('rld');
  });
});
