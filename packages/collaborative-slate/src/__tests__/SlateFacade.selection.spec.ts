import {createEditor} from 'slate';
import {ModelWithExt as Model, ext} from 'json-joy/lib/json-crdt-extensions';
import {FromSlate} from '../sync/FromSlate';
import {SlateFacade} from '../SlateFacade';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext/lib/PeritextBinding';
import {p, txt as textNode, h1, h2, em} from '../sync/__tests__/tools/builder';
import type {SlateDocument} from '../types';

const setup = (doc: SlateDocument) => {
  const viewRange = FromSlate.convert(doc);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.merge(viewRange);
  api.txt.refresh();

  const editor = createEditor();
  const peritextRef = () => api;
  const facade = new SlateFacade(editor, peritextRef);
  const unbind = PeritextBinding.bind(peritextRef, facade);

  return {
    editor,
    facade,
    api,
    txt: api.txt,
    unbind,
    [Symbol.dispose]() {
      unbind();
    },
  };
};

describe('SlateFacade — selection synchronization', () => {
  describe('getSelection()', () => {
    test('returns undefined when editor has no selection', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {facade} = testbed;
      // No selection set yet
      expect(facade.getSelection()).toBeUndefined();
    });

    test('returns a selection for a collapsed cursor at offset 0', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade} = testbed;
      editor.selection = {
        anchor: {path: [0, 0], offset: 0},
        focus: {path: [0, 0], offset: 0},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      const [range, startIsAnchor] = sel!;
      // Collapsed range: start and end viewPos should be equal
      expect(range.start.viewPos()).toBe(range.end.viewPos());
      expect(startIsAnchor).toBe(true);
    });

    test('returns a selection for a collapsed cursor in the middle of text', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade} = testbed;
      editor.selection = {
        anchor: {path: [0, 0], offset: 3},
        focus: {path: [0, 0], offset: 3},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      const [range, startIsAnchor] = sel!;
      expect(range.start.viewPos()).toBe(range.end.viewPos());
      expect(startIsAnchor).toBe(true);
    });

    test('returns a forward selection (anchor before focus)', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade} = testbed;
      editor.selection = {
        anchor: {path: [0, 0], offset: 1},
        focus: {path: [0, 0], offset: 4},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      const [range, startIsAnchor] = sel!;
      // Forward: anchor is at start, focus is at end
      expect(startIsAnchor).toBe(true);
      expect(range.end.viewPos() - range.start.viewPos()).toBe(3);
      expect(range.text()).toBe('ell');
    });

    test('returns a backward selection (anchor after focus)', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade} = testbed;
      editor.selection = {
        anchor: {path: [0, 0], offset: 4},
        focus: {path: [0, 0], offset: 1},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      const [range, startIsAnchor] = sel!;
      // Backward: anchor is at end, start is focus
      expect(startIsAnchor).toBe(false);
      expect(range.end.viewPos() - range.start.viewPos()).toBe(3);
      expect(range.text()).toBe('ell');
    });

    test('handles selection spanning the entire text of a paragraph', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade} = testbed;
      editor.selection = {
        anchor: {path: [0, 0], offset: 0},
        focus: {path: [0, 0], offset: 5},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      const [range] = sel!;
      expect(range.text()).toBe('hello');
    });

    test('handles selection spanning across multiple paragraphs', () => {
      using testbed = setup([p({}, textNode('abc')), p({}, textNode('def'))]);
      const {editor, facade} = testbed;
      editor.selection = {
        anchor: {path: [0, 0], offset: 1},
        focus: {path: [1, 0], offset: 2},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      const [range, startIsAnchor] = sel!;
      expect(startIsAnchor).toBe(true);
      // The selected text should span from 'b' in first paragraph through 'de' in second
      const selectedText = range.text();
      expect(selectedText).toContain('bc');
      expect(selectedText).toContain('de');
    });

    test('handles selection across inline formatted text nodes', () => {
      using testbed = setup([p({}, textNode('plain '), em('italic'), textNode(' after'))]);
      const {editor, facade} = testbed;
      // Select from middle of "plain " to middle of " after"
      const _children = (editor.children[0] as any).children;
      editor.selection = {
        anchor: {path: [0, 0], offset: 2},
        focus: {path: [0, 2], offset: 3},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      const [range] = sel!;
      const text = range.text();
      expect(text).toContain('ain');
      expect(text).toContain('italic');
      expect(text).toContain(' af');
    });
  });

  describe('setSelection()', () => {
    test('sets a collapsed selection from Peritext coordinates', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade, api, txt} = testbed;

      // Create a collapsed range at offset 2
      const point = txt.pointIn(txt.blocks.root.children[0].start.viewPos() + 1 + 2);
      const range = txt.rangeFromPoints(point, point);

      facade.setSelection(api, range, true);
      expect(editor.selection).toBeDefined();
      expect(editor.selection!.anchor.offset).toBe(2);
      expect(editor.selection!.focus.offset).toBe(2);
      expect(editor.selection!.anchor.path).toEqual([0, 0]);
    });

    test('sets a forward selection from Peritext coordinates', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade, api, txt} = testbed;

      const blockStart = txt.blocks.root.children[0].start.viewPos() + 1;
      const startPoint = txt.pointIn(blockStart + 1);
      const endPoint = txt.pointIn(blockStart + 4);
      const range = txt.rangeFromPoints(startPoint, endPoint);

      facade.setSelection(api, range, true);
      expect(editor.selection).toBeDefined();
      expect(editor.selection!.anchor.offset).toBe(1);
      expect(editor.selection!.focus.offset).toBe(4);
    });

    test('sets a backward selection (anchor at end, focus at start)', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade, api, txt} = testbed;

      const blockStart = txt.blocks.root.children[0].start.viewPos() + 1;
      const startPoint = txt.pointIn(blockStart + 1);
      const endPoint = txt.pointIn(blockStart + 4);
      const range = txt.rangeFromPoints(startPoint, endPoint);

      // startIsAnchor = false means anchor is at end
      facade.setSelection(api, range, false);
      expect(editor.selection).toBeDefined();
      // When startIsAnchor is false, anchor comes from end and focus from start
      expect(editor.selection!.anchor.offset).toBe(4);
      expect(editor.selection!.focus.offset).toBe(1);
    });

    test('sets selection in second paragraph', () => {
      using testbed = setup([p({}, textNode('abc')), p({}, textNode('def'))]);
      const {editor, facade, api, txt} = testbed;

      const blocks = txt.blocks.root.children;
      const block1Start = blocks[1].start.viewPos() + 1;
      const startPoint = txt.pointIn(block1Start + 0);
      const endPoint = txt.pointIn(block1Start + 2);
      const range = txt.rangeFromPoints(startPoint, endPoint);

      facade.setSelection(api, range, true);
      expect(editor.selection).toBeDefined();
      expect(editor.selection!.anchor.path).toEqual([1, 0]);
      expect(editor.selection!.anchor.offset).toBe(0);
      expect(editor.selection!.focus.path).toEqual([1, 0]);
      expect(editor.selection!.focus.offset).toBe(2);
    });
  });

  describe('getSelection + setSelection round-trip', () => {
    test('collapsed cursor round-trips through Peritext', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade, api} = testbed;
      editor.selection = {
        anchor: {path: [0, 0], offset: 3},
        focus: {path: [0, 0], offset: 3},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      // Clear selection and restore from Peritext
      editor.selection = null;
      facade.setSelection(api, sel![0], sel![1]);
      expect(editor.selection).toEqual({
        anchor: {path: [0, 0], offset: 3},
        focus: {path: [0, 0], offset: 3},
      });
    });

    test('forward selection round-trips through Peritext', () => {
      using testbed = setup([p({}, textNode('hello world'))]);
      const {editor, facade, api} = testbed;
      const origSel = {
        anchor: {path: [0, 0], offset: 2},
        focus: {path: [0, 0], offset: 8},
      };
      editor.selection = origSel;
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      editor.selection = null;
      facade.setSelection(api, sel![0], sel![1]);
      expect(editor.selection).toEqual(origSel);
    });

    test('backward selection round-trips through Peritext', () => {
      using testbed = setup([p({}, textNode('hello world'))]);
      const {editor, facade, api} = testbed;
      const origSel = {
        anchor: {path: [0, 0], offset: 8},
        focus: {path: [0, 0], offset: 2},
      };
      editor.selection = origSel;
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      editor.selection = null;
      facade.setSelection(api, sel![0], sel![1]);
      expect(editor.selection).toEqual(origSel);
    });

    test('cross-paragraph selection round-trips through Peritext', () => {
      using testbed = setup([p({}, textNode('abc')), p({}, textNode('def'))]);
      const {editor, facade, api} = testbed;
      const origSel = {
        anchor: {path: [0, 0], offset: 1},
        focus: {path: [1, 0], offset: 2},
      };
      editor.selection = origSel;
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      editor.selection = null;
      facade.setSelection(api, sel![0], sel![1]);
      expect(editor.selection).toEqual(origSel);
    });
  });

  describe('edge cases and invalid points', () => {
    test('setSelection silently ignores out-of-bounds points', () => {
      using testbed = setup([p({}, textNode('hi'))]);
      const {editor, facade, api, txt} = testbed;
      // Set an initial selection
      editor.selection = {
        anchor: {path: [0, 0], offset: 0},
        focus: {path: [0, 0], offset: 1},
      };
      // Try to set selection to an invalid very-far-out point
      // This creates a valid Peritext point but one that may not map into Slate properly
      const absEnd = txt.pointAbsEnd();
      const range = txt.rangeFromPoints(absEnd, absEnd);
      facade.setSelection(api, range, true);
      // Should either set to a valid clamped position or leave the editor unchanged
      // (depending on validation), but should NOT throw
    });

    test('getSelection returns correct direction for cursor at offset 0', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade} = testbed;
      editor.selection = {
        anchor: {path: [0, 0], offset: 0},
        focus: {path: [0, 0], offset: 0},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      expect(sel![1]).toBe(true); // startIsAnchor
    });

    test('getSelection returns correct direction for cursor at end of text', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade} = testbed;
      editor.selection = {
        anchor: {path: [0, 0], offset: 5},
        focus: {path: [0, 0], offset: 5},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      expect(sel![1]).toBe(true);
    });

    test('selection in heading works the same as paragraph', () => {
      using testbed = setup([h1(textNode('Title')), p({}, textNode('body'))]);
      const {editor, facade, api} = testbed;
      editor.selection = {
        anchor: {path: [0, 0], offset: 1},
        focus: {path: [0, 0], offset: 4},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      const [range] = sel!;
      expect(range.text()).toBe('itl');
      // Round-trip
      editor.selection = null;
      facade.setSelection(api, sel![0], sel![1]);
      expect(editor.selection).toEqual({
        anchor: {path: [0, 0], offset: 1},
        focus: {path: [0, 0], offset: 4},
      });
    });

    test('selection in mixed document with headings and paragraphs', () => {
      using testbed = setup([h1(textNode('Title')), h2(textNode('Sub')), p({}, textNode('body'))]);
      const {editor, facade} = testbed;
      // Select from heading to paragraph
      editor.selection = {
        anchor: {path: [0, 0], offset: 2},
        focus: {path: [2, 0], offset: 3},
      };
      const sel = facade.getSelection();
      expect(sel).toBeDefined();
      const selectedText = sel![0].text();
      expect(selectedText).toContain('tle');
      expect(selectedText).toContain('Sub');
      expect(selectedText).toContain('bod');
    });

    test('disposed facade returns undefined from getSelection', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, facade} = testbed;
      editor.selection = {
        anchor: {path: [0, 0], offset: 0},
        focus: {path: [0, 0], offset: 3},
      };
      facade.dispose();
      expect(facade.getSelection()).toBeUndefined();
    });

    test('disposed facade ignores setSelection', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {facade, api, txt} = testbed;
      facade.dispose();
      const point = txt.pointIn(0);
      const range = txt.rangeFromPoints(point, point);
      // Should not throw
      facade.setSelection(api, range, true);
    });
  });
});
