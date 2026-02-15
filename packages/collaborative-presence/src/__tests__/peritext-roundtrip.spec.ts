import {s} from 'json-joy/lib/json-crdt-patch';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {Anchor} from 'json-joy/lib/json-crdt-extensions/peritext/rga/constants';
import {toDto, fromDto, type StablePeritextSelection} from '../peritext';

/**
 * Roundtrip tests: verify that `fromDto(txt, toDto(txt, [selection]))`
 * recovers the original Peritext range selection.
 */

const setup = (text: string) => {
  const schema = s.obj({text: ext.peritext.new(text)});
  const model = ModelWithExt.create(schema);
  const txtApi = model.s.text.toExt();
  const txt = txtApi.txt;
  return {model, txtApi, txt};
};

describe('"peritext" roundtrip', () => {
  test('collapsed caret roundtrip (all positions)', () => {
    const text = 'abcde';
    const {txt} = setup(text);
    const len = text.length;
    for (let pos = 0; pos <= len; pos++) {
      const pt = txt.pointIn(pos, Anchor.After);
      const range = txt.range(pt, pt.clone());
      const sel: StablePeritextSelection = [range, true];
      const dto = toDto(txt, [sel]);
      const result = fromDto(txt, dto);
      expect(result).toHaveLength(1);
      const [resRange, resStartIsAnchor] = result[0];
      expect(resStartIsAnchor).toBe(true);
      expect(resRange.isCollapsed()).toBe(true);
      expect(resRange.start.viewPos()).toBe(pos);
    }
  });

  test('forward range roundtrip (startIsAnchor = true)', () => {
    const text = 'abcde';
    const {txt} = setup(text);
    const len = text.length;
    for (let anchor = 0; anchor < len; anchor++) {
      for (let focus = anchor + 1; focus <= len; focus++) {
        const startPt = txt.pointIn(anchor, Anchor.After);
        const endPt = txt.pointIn(focus, Anchor.After);
        const range = txt.range(startPt, endPt);
        const sel: StablePeritextSelection = [range, true];
        const dto = toDto(txt, [sel]);
        const result = fromDto(txt, dto);
        expect(result).toHaveLength(1);
        const [resRange, resStartIsAnchor] = result[0];
        expect(resStartIsAnchor).toBe(true);
        expect(resRange.start.id.sid).toBe(range.start.id.sid);
        expect(resRange.start.id.time).toBe(range.start.id.time);
        expect(resRange.start.anchor).toBe(range.start.anchor);
        expect(resRange.end.id.sid).toBe(range.end.id.sid);
        expect(resRange.end.id.time).toBe(range.end.id.time);
        expect(resRange.end.anchor).toBe(range.end.anchor);
      }
    }
  });

  test('backward range roundtrip (startIsAnchor = false)', () => {
    const text = 'abcde';
    const {txt} = setup(text);
    const len = text.length;
    for (let anchor = 1; anchor <= len; anchor++) {
      for (let focus = 0; focus < anchor; focus++) {
        // anchor > focus, so anchor is the end and focus is the start.
        const anchorPt = txt.pointIn(anchor, Anchor.After);
        const focusPt = txt.pointIn(focus, Anchor.After);
        // Range is always ordered start <= end, so start=focusPt, end=anchorPt.
        const range = txt.rangeFromPoints(anchorPt, focusPt);
        const sel: StablePeritextSelection = [range, false];
        const dto = toDto(txt, [sel]);
        const result = fromDto(txt, dto);
        expect(result).toHaveLength(1);
        const [resRange, resStartIsAnchor] = result[0];
        expect(resStartIsAnchor).toBe(false);
        expect(resRange.start.id.sid).toBe(range.start.id.sid);
        expect(resRange.start.id.time).toBe(range.start.id.time);
        expect(resRange.start.anchor).toBe(range.start.anchor);
        expect(resRange.end.id.sid).toBe(range.end.id.sid);
        expect(resRange.end.id.time).toBe(range.end.id.time);
        expect(resRange.end.anchor).toBe(range.end.anchor);
      }
    }
  });

  test('batch roundtrip (multiple selections at once)', () => {
    const text = 'abc';
    const {txt} = setup(text);
    const len = text.length;
    // Create a mix of carets and ranges.
    const selections: StablePeritextSelection[] = [];
    // All carets.
    for (let pos = 0; pos <= len; pos++) {
      const pt = txt.pointIn(pos, Anchor.After);
      selections.push([txt.range(pt, pt.clone()), true]);
    }
    // Some forward ranges.
    for (let a = 0; a < len; a++) {
      for (let f = a + 1; f <= len; f++) {
        const startPt = txt.pointIn(a, Anchor.After);
        const endPt = txt.pointIn(f, Anchor.After);
        selections.push([txt.range(startPt, endPt), true]);
      }
    }
    const dto = toDto(txt, selections);
    const result = fromDto(txt, dto);
    expect(result).toHaveLength(selections.length);
    for (let i = 0; i < selections.length; i++) {
      const [origRange, origIsAnchor] = selections[i];
      const [resRange, resIsAnchor] = result[i];
      expect(resIsAnchor).toBe(origIsAnchor);
      expect(resRange.start.id.sid).toBe(origRange.start.id.sid);
      expect(resRange.start.id.time).toBe(origRange.start.id.time);
      expect(resRange.start.anchor).toBe(origRange.start.anchor);
      expect(resRange.end.id.sid).toBe(origRange.end.id.sid);
      expect(resRange.end.id.time).toBe(origRange.end.id.time);
      expect(resRange.end.anchor).toBe(origRange.end.anchor);
    }
  });

  test('preserves Anchor.Before on points', () => {
    const text = 'abcde';
    const {txt} = setup(text);
    // Create a range with Before anchors on both start and end points.
    const startPt = txt.pointAt(1, Anchor.Before); // before char at pos 1
    const endPt = txt.pointAt(3, Anchor.Before); // before char at pos 3
    const range = txt.range(startPt, endPt);
    const sel: StablePeritextSelection = [range, true];
    const dto = toDto(txt, [sel]);
    const result = fromDto(txt, dto);
    expect(result).toHaveLength(1);
    const [resRange, resIsAnchor] = result[0];
    expect(resIsAnchor).toBe(true);
    expect(resRange.start.anchor).toBe(Anchor.Before);
    expect(resRange.end.anchor).toBe(Anchor.Before);
    expect(resRange.start.id.time).toBe(range.start.id.time);
    expect(resRange.end.id.time).toBe(range.end.id.time);
  });

  test('preserves mixed anchors (After/Before)', () => {
    const text = 'abcde';
    const {txt} = setup(text);
    // Start with After anchor, end with Before anchor.
    const startPt = txt.pointIn(1, Anchor.After); // after char at pos 0
    const endPt = txt.pointAt(3, Anchor.Before); // before char at pos 3
    const range = txt.range(startPt, endPt);
    const sel: StablePeritextSelection = [range, true];
    const dto = toDto(txt, [sel]);
    const result = fromDto(txt, dto);
    expect(result).toHaveLength(1);
    const [resRange] = result[0];
    expect(resRange.start.anchor).toBe(Anchor.After);
    expect(resRange.end.anchor).toBe(Anchor.Before);
  });

  test('empty string: caret at position 0', () => {
    const {txt} = setup('');
    const pt = txt.pointAbsStart();
    const range = txt.range(pt, pt.clone());
    const sel: StablePeritextSelection = [range, true];
    const dto = toDto(txt, [sel]);
    const result = fromDto(txt, dto);
    expect(result).toHaveLength(1);
    const [resRange, resIsAnchor] = result[0];
    expect(resIsAnchor).toBe(true);
    expect(resRange.isCollapsed()).toBe(true);
  });

  test('empty selections array produces empty cursors', () => {
    const {txt} = setup('abc');
    const dto = toDto(txt, []);
    expect(dto[7]).toEqual([]);
    const result = fromDto(txt, dto);
    expect(result).toEqual([]);
  });
});
