import {createEditor} from 'slate';
import {ModelWithExt as Model, ext} from 'json-joy/lib/json-crdt-extensions';
import {FromSlate} from '../sync/FromSlate';
import {toSlate} from '../sync/toSlate';
import {slatePointToGap, slatePointToPoint, pointToSlatePoint} from '../positions';
import {p, txt as textNode, h1, h2, blockquote, em, ul, li} from '../sync/__tests__/tools/builder';
import type {SlateDocument, SlateRange} from '../types';
import type {Editor} from 'slate';

/**
 * Create a Peritext model from a Slate document and a matching Slate editor.
 * The editor children are set to the canonical Slate representation produced
 * by `toSlate()` so that structure is guaranteed to be normalized.
 */
const setup = (doc: SlateDocument) => {
  const viewRange = FromSlate.convert(doc);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.import(0, viewRange);
  api.txt.refresh();
  const slateDoc = toSlate(api.txt);
  const editor = createEditor();
  (editor.children as unknown) = slateDoc;
  return {txt: api.txt, editor, doc: slateDoc};
};

/** Convert Slate.js point to Peritext gap, then immediately back to Slate.js point. */
const roundTrip = (editor: Editor, txt: ReturnType<typeof setup>['txt'], path: number[], offset: number) => {
  const slatePoint = {path, offset};
  const gap = slatePointToGap(txt, editor, slatePoint);
  const point = txt.pointIn(gap);
  // console.log(point + '');
  return pointToSlatePoint(txt.blocks.root, point, editor);
};

const assertRoundTrip = (editor: Editor, txt: ReturnType<typeof setup>['txt'], path: number[], offset: number) => {
  const result = roundTrip(editor, txt, path, offset);
  expect(result).toEqual({path, offset});
};

describe('slatePointToGap()', () => {
  describe('single paragraph', () => {
    test('returns -1 for a path with depth < 2', () => {
      const {txt, editor} = setup([p({}, textNode('hello'))]);
      expect(slatePointToGap(txt, editor, {path: [0], offset: 0})).toBe(-1);
      expect(slatePointToGap(txt, editor, {path: [], offset: 0})).toBe(-1);
    });

    test('returns -1 when path index is out of bounds', () => {
      const {txt, editor} = setup([p({}, textNode('hello'))]);
      expect(slatePointToGap(txt, editor, {path: [5, 0], offset: 0})).toBe(-1);
    });

    test('gap at offset 0 is after the block marker (view pos 1)', () => {
      const {txt, editor} = setup([p({}, textNode('hello'))]);
      const gap = slatePointToGap(txt, editor, {path: [0, 0], offset: 0});
      expect(gap).toBeGreaterThan(0);
      expect(txt.pointIn(gap).viewPos()).toBe(gap);
    });

    test('gap increases monotonically with offset', () => {
      const {txt, editor} = setup([p({}, textNode('hello'))]);
      const g0 = slatePointToGap(txt, editor, {path: [0, 0], offset: 0});
      const g2 = slatePointToGap(txt, editor, {path: [0, 0], offset: 2});
      const g5 = slatePointToGap(txt, editor, {path: [0, 0], offset: 5});
      expect(g2).toBe(g0 + 2);
      expect(g5).toBe(g0 + 5);
    });

    test('gap spans exactly the text length', () => {
      const text = 'hello';
      const {txt, editor} = setup([p({}, textNode(text))]);
      const g0 = slatePointToGap(txt, editor, {path: [0, 0], offset: 0});
      const gEnd = slatePointToGap(txt, editor, {path: [0, 0], offset: text.length});
      expect(gEnd - g0).toBe(text.length);
    });
  });

  describe('multiple paragraphs', () => {
    test('second paragraph gap starts after first paragraph text + its own marker', () => {
      const {txt, editor} = setup([p({}, textNode('abc')), p({}, textNode('def'))]);
      const g1Start = slatePointToGap(txt, editor, {path: [0, 0], offset: 0});
      const g1End = slatePointToGap(txt, editor, {path: [0, 0], offset: 3});
      const g2Start = slatePointToGap(txt, editor, {path: [1, 0], offset: 0});
      expect(g2Start).toBe(g1End + 1);
    });

    test('gap deltas match char counts across paragraphs', () => {
      const {txt, editor} = setup([p({}, textNode('foo')), p({}, textNode('bar'))]);
      const p1g0 = slatePointToGap(txt, editor, {path: [0, 0], offset: 0});
      const p1g3 = slatePointToGap(txt, editor, {path: [0, 0], offset: 3});
      const p2g0 = slatePointToGap(txt, editor, {path: [1, 0], offset: 0});
      const p2g3 = slatePointToGap(txt, editor, {path: [1, 0], offset: 3});
      expect(p1g3 - p1g0).toBe(3);
      expect(p2g3 - p2g0).toBe(3);
    });
  });

  describe('multiple inline text nodes in one paragraph', () => {
    test('gap accumulates lengths of preceding text nodes', () => {
      const doc: SlateDocument = [p({}, {text: 'foo'}, {text: 'bar', em: true}, {text: 'baz'})];
      const {txt, editor} = setup(doc);
      const children = (editor.children[0] as any).children as {text: string}[];
      let cumulative = 0;
      for (let nodeIdx = 0; nodeIdx < children.length; nodeIdx++) {
        const nodeLen = children[nodeIdx].text.length;
        const gStart = slatePointToGap(txt, editor, {path: [0, nodeIdx], offset: 0});
        const gEnd = slatePointToGap(txt, editor, {path: [0, nodeIdx], offset: nodeLen});
        expect(gEnd - gStart).toBe(nodeLen);
        if (nodeIdx > 0) {
          const prevEnd = slatePointToGap(txt, editor, {
            path: [0, nodeIdx - 1],
            offset: children[nodeIdx - 1].text.length,
          });
          expect(gStart).toBe(prevEnd);
        }
        cumulative += nodeLen;
      }
    });
  });

  describe('headings', () => {
    test('heading block gaps work the same as paragraph blocks', () => {
      const {txt, editor} = setup([h1(textNode('Title'))]);
      const g0 = slatePointToGap(txt, editor, {path: [0, 0], offset: 0});
      const g5 = slatePointToGap(txt, editor, {path: [0, 0], offset: 5});
      expect(g5 - g0).toBe(5);
    });
  });

  describe('nested blocks', () => {
    test('blockquote > paragraph gap is consistent', () => {
      const {txt, editor} = setup([blockquote({}, p({}, textNode('nested')))]);
      const g0 = slatePointToGap(txt, editor, {path: [0, 0, 0], offset: 0});
      const gEnd = slatePointToGap(txt, editor, {path: [0, 0, 0], offset: 6});
      expect(gEnd - g0).toBe(6);
    });
  });
});

describe('slatePointToPoint()', () => {
  test('returns a CRDT Point whose viewPos matches the gap', () => {
    const {txt, editor} = setup([p({}, textNode('hello'))]);
    const slatePoint = {path: [0, 0], offset: 3};
    const gap = slatePointToGap(txt, editor, slatePoint);
    const point = slatePointToPoint(txt, editor, slatePoint);
    expect(point.viewPos()).toBe(gap);
  });

  test('returns pointAbsStart for invalid slate point', () => {
    const {txt, editor} = setup([p({}, textNode('hello'))]);
    const fallback = slatePointToPoint(txt, editor, {path: [], offset: 0});
    const absStart = txt.pointStart() ?? txt.pointAbsStart();
    expect(fallback.viewPos()).toBe(absStart.viewPos());
  });

  test('offset 0 of first paragraph maps to a point after the block marker', () => {
    const {txt, editor} = setup([p({}, textNode('abc'))]);
    const point = slatePointToPoint(txt, editor, {path: [0, 0], offset: 0});
    const start = txt.pointStart() ?? txt.pointAbsStart();
    expect(point.viewPos()).toBeGreaterThan(start.viewPos());
  });
});

describe('pointToSlatePoint()', () => {
  test('maps point at gap 0 of first paragraph to {path:[0,0], offset:0}', () => {
    const {txt, editor} = setup([p({}, textNode('hi'))]);
    const gap = slatePointToGap(txt, editor, {path: [0, 0], offset: 0});
    const point = txt.pointIn(gap);
    const slate = pointToSlatePoint(txt.blocks.root, point, editor);
    expect(slate).toEqual({path: [0, 0], offset: 0});
  });

  test('maps end-of-text point to last offset of last text node', () => {
    const text = 'hello';
    const {txt, editor} = setup([p({}, textNode(text))]);
    const gap = slatePointToGap(txt, editor, {path: [0, 0], offset: text.length});
    const point = txt.pointIn(gap);
    const slate = pointToSlatePoint(txt.blocks.root, point, editor);
    expect(slate).toEqual({path: [0, 0], offset: text.length});
  });

  test('second paragraph resolves to correct path', () => {
    const {txt, editor} = setup([p({}, textNode('first')), p({}, textNode('second'))]);
    const gap = slatePointToGap(txt, editor, {path: [1, 0], offset: 2});
    const point = txt.pointIn(gap);
    const slate = pointToSlatePoint(txt.blocks.root, point, editor);
    expect(slate).toEqual({path: [1, 0], offset: 2});
  });

  test('middle of first paragraph resolves correctly', () => {
    const {txt, editor} = setup([p({}, textNode('abcde')), p({}, textNode('fghij'))]);
    const gap = slatePointToGap(txt, editor, {path: [0, 0], offset: 3});
    const point = txt.pointIn(gap);
    const slate = pointToSlatePoint(txt.blocks.root, point, editor);
    expect(slate).toEqual({path: [0, 0], offset: 3});
  });
});

describe('round-trip: slatePoint > gap > Point > slatePoint', () => {
  test('single paragraph — all offsets', () => {
    const text = 'hello';
    const {txt, editor} = setup([p({}, textNode(text))]);
    for (let offset = 0; offset <= text.length; offset++) assertRoundTrip(editor, txt, [0, 0], offset);
  });

  test('extracted text equals', () => {
    const {txt, editor} = setup([p({}, textNode('abc')), p({}, textNode('defg'))]);
    const slateRange: SlateRange = {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 2}};
    const strSlate = editor.string(slateRange);
    const point1 = slatePointToPoint(txt, editor, slateRange.anchor);
    const point2 = slatePointToPoint(txt, editor, slateRange.focus);
    const peritextRange = txt.rangeFromPoints(point1, point2);
    const strPeritext = peritextRange.text();
    expect(strPeritext).toBe(strSlate);
  });

  test('two paragraphs — all offsets in each', () => {
    const {txt, editor} = setup([p({}, textNode('abc')), p({}, textNode('defg'))]);
    for (let offset = 0; offset <= 3; offset++) assertRoundTrip(editor, txt, [0, 0], offset);
    for (let offset = 0; offset <= 4; offset++) assertRoundTrip(editor, txt, [1, 0], offset);
  });

  test('heading — all offsets', () => {
    const title = 'My Title';
    const {txt, editor} = setup([h1(textNode(title))]);
    for (let offset = 0; offset <= title.length; offset++) assertRoundTrip(editor, txt, [0, 0], offset);
  });

  test('mixed document (heading + paragraphs)', () => {
    const {txt, editor} = setup([
      h1(textNode('Intro')),
      p({}, textNode('First.')),
      h2(textNode('Body')),
      p({}, textNode('Second.')),
    ]);
    const checks: [number[], number][] = [
      [[0, 0], 0],
      [[0, 0], 5],
      [[1, 0], 0],
      [[1, 0], 3],
      [[1, 0], 6],
      [[2, 0], 0],
      [[2, 0], 4],
      [[3, 0], 0],
      [[3, 0], 7],
    ];
    for (const [path, offset] of checks) {
      assertRoundTrip(editor, txt, path, offset);
    }
  });

  test('blockquote > paragraph round-trip', () => {
    const {txt, editor} = setup([blockquote({}, p({}, textNode('quote')))]);
    for (let offset = 0; offset <= 5; offset++) assertRoundTrip(editor, txt, [0, 0, 0], offset);
  });

  test('paragraph with inline formatting (em text node)', () => {
    const {txt, editor} = setup([p({}, textNode('plain '), em('bold'), textNode(' after'))]);
    const para = (editor.children[0] as any).children as {text: string}[];
    for (let nodeIdx = 0; nodeIdx < para.length; nodeIdx++) {
      const nodeText: string = para[nodeIdx].text;
      const isFirst = nodeIdx === 0;
      const isLast = nodeIdx === para.length - 1;
      const minOffset = isFirst ? 0 : 1;
      const maxOffset = isLast ? nodeText.length : nodeText.length - 1;
      for (let offset = minOffset; offset <= maxOffset; offset++) assertRoundTrip(editor, txt, [0, nodeIdx], offset);
    }
  });

  test('bold/italic mixed inline nodes', () => {
    const {txt, editor} = setup([
      p({}, textNode('a'), {text: 'b', em: true}, {text: 'c', strong: true}, textNode('d')),
    ]);
    const para = (editor.children[0] as any).children as {text: string}[];
    for (let nodeIdx = 0; nodeIdx < para.length; nodeIdx++) {
      const nodeText: string = para[nodeIdx].text;
      const isFirst = nodeIdx === 0;
      const isLast = nodeIdx === para.length - 1;
      const minOffset = isFirst ? 0 : 1;
      const maxOffset = isLast ? nodeText.length : nodeText.length - 1;
      for (let offset = minOffset; offset <= maxOffset; offset++) assertRoundTrip(editor, txt, [0, nodeIdx], offset);
    }
  });

  test('list item paragraph round-trip', () => {
    const {txt, editor} = setup([ul(li(p({}, textNode('item one'))), li(p({}, textNode('item two'))))]);
    // path: [0, 0, 0, 0] = bulleted_list > list_item[0] > paragraph > text
    // path: [0, 1, 0, 0] = bulleted_list > list_item[1] > paragraph > text
    const firstItem = (editor.children[0] as any).children[0].children[0].children as {text: string}[];
    for (let offset = 0; offset <= firstItem[0].text.length; offset++)
      assertRoundTrip(editor, txt, [0, 0, 0, 0], offset);
    const secondItem = (editor.children[0] as any).children[1].children[0].children as {text: string}[];
    for (let offset = 0; offset <= secondItem[0].text.length; offset++)
      assertRoundTrip(editor, txt, [0, 1, 0, 0], offset);
  });
});
