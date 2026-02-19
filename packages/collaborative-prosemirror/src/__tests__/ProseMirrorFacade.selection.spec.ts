/** @jest-environment jsdom */

import {TextSelection} from 'prosemirror-state';
import {Node} from 'prosemirror-model';
import {doc, p, blockquote, h1, h2, h3, ul, li, em, strong} from 'prosemirror-test-builder';
import {setup} from './setup';

/**
 * Enumerate every valid cursor position in a PM doc (positions inside text
 * blocks). Returns an array of PM positions.
 */
const allCursorPositions = (pmDoc: Node): number[] => {
  const positions: number[] = [];
  pmDoc.descendants((node, pos) => {
    if (node.isTextblock) {
      // Valid positions inside this textblock: pos+1 (start) to pos+1+node.content.size (end)
      for (let i = 0; i <= node.content.size; i++) {
        positions.push(pos + 1 + i);
      }
      return false; // don't descend into inline content
    }
    return true;
  });
  return positions;
};

describe('ProseMirrorFacade selection', () => {
  describe('getSelection()', () => {
    test('returns undefined when disposed', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {facade, api: peritextApi} = testbed;
      facade.dispose();
      expect(facade.getSelection(peritextApi)).toBeUndefined();
    });

    test('collapsed caret in single paragraph', () => {
      // doc: <doc><p>Hello</p></doc>
      // PM positions: 0=doc_open, 1=p_open, 2..6=H,e,l,l,o, 7=p_close, 8=doc_close
      const pmDoc = doc(p('Hello')) as Node;
      using testbed = setup(pmDoc);

      // Peritext RGA: \nHello (positions 0..5)
      // PM pos 1 (start of p, before H) -> Peritext gap 1 (after \n)
      const result = testbed.getSelectionAt(1, 1);
      expect(result).toBeDefined();
      const [range, startIsAnchor] = result!;
      expect(range.isCollapsed()).toBe(true);
      expect(range.start.rightChar()?.view()).toBe('H');
      expect(startIsAnchor).toBe(true);
      expect(range.start.viewPos()).toBe(1);
      expect(range.end.viewPos()).toBe(1);

      // PM pos 3 (after 'e') -> Peritext gap 3
      const result2 = testbed.getSelectionAt(3, 3);
      expect(result2).toBeDefined();
      const [range2] = result2!;
      expect(range2.isCollapsed()).toBe(true);
      expect(range2.start.viewPos()).toBe(3);
      expect(range2.start.rightChar()?.view()).toBe('l');
      expect(range2.start.leftChar()?.view()).toBe('e');

      // PM pos 6 (after 'o', end of paragraph) -> Peritext gap 6
      const result3 = testbed.getSelectionAt(6, 6);
      expect(result3).toBeDefined();
      const [range3] = result3!;
      expect(range3.isCollapsed()).toBe(true);
      expect(range3.start.viewPos()).toBe(6);
      expect(range3.start.leftChar()?.view()).toBe('o');
    });

    test('forward selection in single paragraph', () => {
      const pmDoc = doc(p('Hello')) as Node;
      using testbed = setup(pmDoc);
      // Select "ell" -> PM [2,5] -> Peritext [2,5]
      const result = testbed.getSelectionAt(2, 5);
      expect(result).toBeDefined();
      const [range, startIsAnchor] = result!;
      expect(startIsAnchor).toBe(true);
      expect(range.text()).toBe('ell');
      expect(range.start.viewPos()).toBe(2);
      expect(range.end.viewPos()).toBe(5);
    });

    test('backward selection in single paragraph', () => {
      const pmDoc = doc(p('Hello')) as Node;
      using testbed = setup(pmDoc);
      // Backward select "ell" -> PM anchor=5, head=2
      const result = testbed.getSelectionAt(5, 2);
      expect(result).toBeDefined();
      const [range, startIsAnchor] = result!;
      expect(startIsAnchor).toBe(false);
      expect(range.text()).toBe('ell');
      expect(range.start.viewPos()).toBe(2);
      expect(range.end.viewPos()).toBe(5);
    });

    test('two paragraphs', () => {
      // ProseMirror:
      // <doc><p>Hello</p><p>World</p></doc>
      //     0  123456   7  89..13  14    15
      //
      // Peritext:
      // \nHello\nWorld
      //  012345 67..11 (gap positions 0..12)
      const pmDoc = doc(p('Hello'), p('World')) as Node;
      using testbed = setup(pmDoc);

      // Start of first paragraph (PM 1 -> PT gap 1)
      const r1 = testbed.getSelectionAt(1, 1)!;
      expect(r1[0].start.viewPos()).toBe(1);
      expect(r1[0].start.rightChar()?.view()).toBe('H');
      
      // End of first paragraph (PM 6 -> PT gap 6)
      const r2 = testbed.getSelectionAt(6, 6)!;
      expect(r2[0].start.viewPos()).toBe(6);
      expect(r2[0].start.leftChar()?.view()).toBe('o');
      
      // Start of second paragraph (PM 8 -> PT gap 7)
      const r3 = testbed.getSelectionAt(8, 8)!;
      expect(r3[0].start.viewPos()).toBe(7);
      expect(r3[0].start.rightChar()?.view()).toBe('W');
      
      // After 'W' in second paragraph (PM 9 -> PT gap 8)
      const r4 = testbed.getSelectionAt(9, 9)!;
      expect(r4[0].start.viewPos()).toBe(8);
      expect(r4[0].start.leftChar()?.view()).toBe('W');
      expect(r4[0].start.rightChar()?.view()).toBe('o');
      
      // End of second paragraph (PM 13 -> PT gap 12)
      const r5 = testbed.getSelectionAt(13, 13)!;
      expect(r5[0].start.viewPos()).toBe(12);
      expect(r5[0].start.leftChar()?.view()).toBe('d');
    });

    test('nested blockquote', () => {
      // ProseMirror:
      // <doc><blockquote><p>Hi</p></blockquote></doc>
      //     0           1  234   5            6     7
      //
      // Peritext:
      // \nHi
      //  012
      const pmDoc = doc(blockquote(p('Hi'))) as Node;
      using testbed = setup(pmDoc);

      // Inside p, before 'H' (PM 2 -> PT gap 1)
      const r1 = testbed.getSelectionAt(2, 2)!;
      expect(r1[0].start.viewPos()).toBe(1);
      expect(r1[0].start.rightChar()?.view()).toBe('H');

      // After 'H' (PM 3 -> PT gap 2)
      const r2 = testbed.getSelectionAt(3, 3)!;
      expect(r2[0].start.viewPos()).toBe(2);
      expect(r2[0].start.rightChar()?.view()).toBe('i');

      // After 'i' (PM 4 -> PT gap 3)
      const r3 = testbed.getSelectionAt(4, 4)!;
      expect(r3[0].start.viewPos()).toBe(3);
      expect(r3[0].start.leftChar()?.view()).toBe('i');
    });

    test('empty paragraph', () => {
      // ProseMirror:
      // <doc><p></p></doc>
      //     0  1   2     3
      //
      // Peritext:
      // \n
      //  0
      const pmDoc = doc(p()) as Node;
      using testbed = setup(pmDoc);
      const r1 = testbed.getSelectionAt(1, 1)!;
      expect(r1[0].start.viewPos()).toBe(1);
    });

    test('headings and paragraphs', () => {
      // ProseMirror:
      // <doc><h1>Title</h1><p>Text</p></doc>
      //     0   123456    7  89.12  13    14
      //
      // Peritext:
      // \nTitle\nText
      //  012345 67.10
      const pmDoc = doc(h1('Title'), p('Text')) as Node;
      using testbed = setup(pmDoc);

      // Start of h1 (PM 1 -> PT gap 1)
      const r1 = testbed.getSelectionAt(1, 1)!;
      expect(r1[0].start.viewPos()).toBe(1);

      // End of h1, after 'e' (PM 6 -> PT gap 6)
      const r2 = testbed.getSelectionAt(6, 6)!;
      expect(r2[0].start.viewPos()).toBe(6);

      // Start of p (PM 8 -> PT gap 7)
      const r3 = testbed.getSelectionAt(8, 8)!;
      expect(r3[0].start.viewPos()).toBe(7);

      // Selection inside "Title"
      const r4 = testbed.getSelectionAt(3, 5)!;
      expect(r4[0].text()).toBe('tl');

      // Selection across paragraphs
      const r5 = testbed.getSelectionAt(3, 10)!;
      expect(r5[0].text()).toBe('tle\nTe');
    });

    test('inline marks do not affect position mapping', () => {
      // <doc><p>A<em>B</em>C</p></doc>
      // PM text positions are the same regardless of marks
      const pmDoc = doc(p('A', em('B'), 'C')) as Node;
      using testbed = setup(pmDoc);

      // After 'A' (PM 2 -> PT gap 2)
      const r1 = testbed.getSelectionAt(2, 2)!;
      expect(r1[0].start.viewPos()).toBe(2);

      // After 'B' (PM 3 -> PT gap 3)
      const r2 = testbed.getSelectionAt(3, 3)!;
      expect(r2[0].start.viewPos()).toBe(3);

      // After 'C' (PM 4 -> PT gap 4)
      const r3 = testbed.getSelectionAt(4, 4)!;
      expect(r3[0].start.viewPos()).toBe(4);
    });
  });

  describe('setSelection()', () => {
    test('no-op when disposed', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {facade, api: peritextApi, txt} = testbed
      facade.dispose();
      // Should not throw
      const range = txt.rangeFromPoints(txt.pointIn(1), txt.pointIn(3));
      facade.setSelection(peritextApi, range, true);
    });

    test('sets collapsed caret in single paragraph', () => {
      const pmDoc = doc(p('Hello')) as Node;
      using testbed = setup(pmDoc);
      const {facade, view, api: peritextApi, txt} = testbed;

      // Set caret at Peritext gap 3 -> PM pos 3 (after "He")
      const point = txt.pointIn(3);
      const range = txt.rangeFromPoints(point, point);
      facade.setSelection(peritextApi, range, true);
      expect(view.state.selection.anchor).toBe(3);
      expect(view.state.selection.head).toBe(3);
    });

    test('sets forward selection in single paragraph', () => {
      const pmDoc = doc(p('Hello')) as Node;
      using testbed = setup(pmDoc);
      const {facade, view, api: peritextApi, txt} = testbed;

      // Select Peritext gap [2,5] -> PM [2,5]
      const range = txt.rangeFromPoints(txt.pointIn(2), txt.pointIn(5));
      expect(range.text()).toBe('ell');
      facade.setSelection(peritextApi, range, true); // start is anchor
      const { selection } = view.state;
      const text = view.state.doc.textBetween(selection.from, selection.to, '\n');
      expect(text).toBe('ell');
      expect(view.state.selection.anchor).toBe(2);
      expect(view.state.selection.head).toBe(5);
    });

    test('sets backward selection in single paragraph', () => {
      const pmDoc = doc(p('Hello')) as Node;
      using testbed = setup(pmDoc);
      const {facade, view, api: peritextApi, txt} = testbed;

      // Range [2,5] with startIsAnchor=false -> anchor=end, head=start
      const range = txt.rangeFromPoints(txt.pointIn(2), txt.pointIn(5));
      facade.setSelection(peritextApi, range, false); // end is anchor
      expect(view.state.selection.anchor).toBe(5);
      expect(view.state.selection.head).toBe(2);
    });

    test('sets selection in second paragraph', () => {
      // Peritext: \nHello\nWorld (gap 0..12)
      // PM: <doc><p>Hello</p><p>World</p></doc>
      const pmDoc = doc(p('Hello'), p('World')) as Node;
      const testbed = setup(pmDoc);
      const {facade, view, api: peritextApi, txt} = testbed;

      // Peritext gap 7 (after \n of 2nd paragraph) -> PM 8 (start of 2nd p)
      const point = txt.pointIn(7);
      const range = txt.rangeFromPoints(point, point);
      facade.setSelection(peritextApi, range, true);
      expect(view.state.selection.anchor).toBe(8);

      // Peritext gap 8 (after W) -> PM 9
      const point2 = txt.pointIn(8);
      const range2 = txt.rangeFromPoints(point2, point2);
      facade.setSelection(peritextApi, range2, true);
      expect(view.state.selection.anchor).toBe(9);
    });

    test('sets selection in nested blockquote', () => {
      const pmDoc = doc(blockquote(p('Hi'))) as Node;
      using testbed = setup(pmDoc);
      const {facade, view, api: peritextApi, txt} = testbed;

      // PT gap 2 (after 'H') -> PM 3
      const point = txt.pointIn(2);
      const range = txt.rangeFromPoints(point, point);
      facade.setSelection(peritextApi, range, true);
      expect(view.state.selection.anchor).toBe(3);
    });
  });

  describe('round-trip', () => {
    test('getSelection -> setSelection preserves PM selection (single paragraph)', () => {
      const pmDoc = doc(p('Hello World')) as Node;
      using testbed = setup(pmDoc);
      const {facade, view: editorView, api: peritextApi} = testbed;
      const sel = TextSelection.create(editorView.state.doc, 3, 8);
      editorView.dispatch(editorView.state.tr.setSelection(sel));
      const result = facade.getSelection(peritextApi)!;
      expect(result).toBeDefined();
      const [range, startIsAnchor] = result;
      facade.setSelection(peritextApi, range, startIsAnchor);
      expect(editorView.state.selection.anchor).toBe(3);
      expect(editorView.state.selection.head).toBe(8);
    });

    test('getSelection -> setSelection preserves backward selection', () => {
      const pmDoc = doc(p('Hello World')) as Node;
      using testbed = setup(pmDoc);
      const {facade, view: editorView, api: peritextApi} = testbed;

      // Backward: anchor=8, head=3
      const sel = TextSelection.create(editorView.state.doc, 8, 3);
      editorView.dispatch(editorView.state.tr.setSelection(sel));
      const result = facade.getSelection(peritextApi)!;
      const [range, startIsAnchor] = result;
      expect(startIsAnchor).toBe(false);
      facade.setSelection(peritextApi, range, startIsAnchor);
      expect(editorView.state.selection.anchor).toBe(8);
      expect(editorView.state.selection.head).toBe(3);
    });

    test('round-trip for all selection ranges in a small doc', () => {
      const pmDoc = doc(p('AB'), p('CD')) as Node;
      using testbed = setup(pmDoc);
      const {facade, view: editorView, api: peritextApi} = testbed;
      const positions = allCursorPositions(pmDoc);
      for (const anchor of positions) {
        for (const head of positions) {
          const sel = TextSelection.create(editorView.state.doc, anchor, head);
          editorView.dispatch(editorView.state.tr.setSelection(sel));
          const result = facade.getSelection(peritextApi)!;
          expect(result).toBeDefined();
          const [range, startIsAnchor] = result;
          facade.setSelection(peritextApi, range, startIsAnchor);
          expect(editorView.state.selection.anchor).toBe(anchor);
          expect(editorView.state.selection.head).toBe(head);
        }
      }
    });

    const roundTripFixtures: [string, Node][] = [
      ['single paragraph', doc(p('Hello')) as Node],
      ['two paragraphs', doc(p('Hello'), p('World')) as Node],
      ['three paragraphs', doc(p('One'), p('Two'), p('Three')) as Node],
      ['blockquote with paragraph', doc(blockquote(p('Quote'))) as Node],
      ['heading + paragraph', doc(h1('Title'), p('Body')) as Node],
      ['mixed headings', doc(h1('H1'), h2('H2'), h3('H3'), p('text')) as Node],
      ['inline marks', doc(p('A', em('B'), strong('C'), 'D')) as Node],
      ['empty paragraph', doc(p()) as Node],
      ['two blockquotes', doc(blockquote(p('A')), blockquote(p('B'))) as Node],
      ['nested list', doc(ul(li(p('Item 1')), li(p('Item 2'), ul(li(p('Sub')))))) as Node],
    ];

    for (const [name, pmDoc] of roundTripFixtures) {
      test(`round-trip for ${name}`, () => {
        using testbed = setup(pmDoc);
        const {facade, view: editorView, api: peritextApi} = testbed;
        const positions = allCursorPositions(pmDoc);
        for (const pos of positions) {
          // Set PM caret
          const sel = TextSelection.create(editorView.state.doc, pos);
          editorView.dispatch(editorView.state.tr.setSelection(sel));

          // Get peritext selection
          const result = facade.getSelection(peritextApi);
          expect(result).toBeDefined();
          const [range, startIsAnchor] = result!;

          // Set it back
          facade.setSelection(peritextApi, range, startIsAnchor);
          expect(editorView.state.selection.anchor).toBe(pos);
          expect(editorView.state.selection.head).toBe(pos);
        }
      });
    }
  });
});
