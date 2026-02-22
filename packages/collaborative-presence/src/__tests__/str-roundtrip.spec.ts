import {s} from 'json-joy/lib/json-crdt-patch';
import {Model} from 'json-joy/lib/json-crdt';
import {toDto, fromDto, type StrSelection, type StrSelectionStrict} from '../str';

/**
 * Roundtrip tests: for every possible (anchor, focus) pair in a short string,
 * verify that `fromDto(model, toDto(str, [selection]))` recovers the original
 * offset-based selection.
 */

const setup = (text: string) => {
  const doc = Model.create().setSchema(
    s.obj({
      str: s.str(text),
    }),
  );
  const str = doc.s.str.$;
  return {doc, str};
};

const setupMultiChunk = () => {
  const doc = Model.create('ab');
  const str = doc.api.str([]);
  str.ins(2, 'cd');
  str.ins(0, 'ef');
  // result: 'efabcd'
  return {doc, str, text: str.view()};
};

describe('"str" roundtrip', () => {
  test('caret roundtrip (all positions)', () => {
    const text = 'abcde';
    const {doc, str} = setup(text);
    const len = text.length;
    for (let pos = 0; pos <= len; pos++) {
      const dto = toDto(str, [pos]);
      const result = fromDto(doc, dto);
      expect(result).toEqual([[pos]]);
    }
  });

  test('range roundtrip (all N^2 anchor/focus pairs)', () => {
    const text = 'abcde';
    const {doc, str} = setup(text);
    const len = text.length;
    for (let anchor = 0; anchor <= len; anchor++) {
      for (let focus = 0; focus <= len; focus++) {
        if (anchor === focus) {
          const dto = toDto(str, [[anchor, focus]]);
          const result = fromDto(doc, dto);
          expect(result).toEqual([[anchor]]);
        } else {
          const dto = toDto(str, [[anchor, focus]]);
          const result = fromDto(doc, dto);
          expect(result).toEqual([[anchor, focus]]);
        }
      }
    }
  });

  describe('batch roundtrip (multiple selections at once)', () => {
    const text = 'abc';
    const {doc, str} = setup(text);
    const len = text.length;

    test('all carets in one call', () => {
      const carets: StrSelection[] = [];
      for (let i = 0; i <= len; i++) carets.push(i);
      const dto = toDto(str, carets);
      const result = fromDto(doc, dto);
      const expected: StrSelectionStrict[] = [];
      for (let i = 0; i <= len; i++) expected.push([i]);
      expect(result).toEqual(expected);
    });

    test('all distinct ranges in one call', () => {
      const ranges: StrSelection[] = [];
      const expected: StrSelectionStrict[] = [];
      for (let a = 0; a <= len; a++) {
        for (let f = 0; f <= len; f++) {
          if (a === f) continue;
          ranges.push([a, f]);
          expected.push([a, f]);
        }
      }
      const dto = toDto(str, ranges);
      const result = fromDto(doc, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('roundtrip with multi-chunk string', () => {
    test('all N^2 pairs roundtrip across chunk boundaries', () => {
      const {doc, str, text} = setupMultiChunk();
      const len = text.length;
      expect(len).toBe(6); // 'efabcd'
      for (let anchor = 0; anchor <= len; anchor++) {
        for (let focus = 0; focus <= len; focus++) {
          const input: StrSelection[] = anchor === focus ? [anchor] : [[anchor, focus]];
          const dto = toDto(str, input);
          const result = fromDto(doc, dto);
          if (anchor === focus) {
            expect(result).toEqual([[anchor]]);
          } else {
            expect(result).toEqual([[anchor, focus]]);
          }
        }
      }
    });
  });
});
