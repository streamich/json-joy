import {s} from 'json-joy/lib/json-crdt-patch';
import {Model} from 'json-joy/lib/json-crdt';
import {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';
import {toDto, type StrSelection} from '../str';

const setup = (text: string = 'hello world') => {
  const doc = Model.create().setSchema(
    s.obj({
      str: s.str(text),
    }),
  );
  if (Math.random() < 0.5) {
    doc.api.set({str: text});
  }
  const str = doc.s.str.$;
  const sid = doc.clock.sid;
  return {doc, str, sid};
};

describe('toDto', () => {
  describe('structure', () => {
    test('returns an RgaSelection tuple with correct envelope fields', () => {
      const {str, sid, doc} = setup('abc');
      const result = toDto(str, [0]);
      expect(result[0]).toBe(''); // documentId (empty default)
      expect(result[1]).toBe(''); // uiLocationId (empty default)
      expect(result[2]).toBe(sid); // sid
      expect(result[3]).toBe(doc.clock.time); // time
      expect(result[4]).toEqual({}); // meta
      expect(result[5]).toBe(JsonCrdtDataType.str); // type
      // result[6] is nodeId
      expect(Array.isArray(result[6])).toBe(true);
      // result[7] is cursors array
      expect(Array.isArray(result[7])).toBe(true);
    });

    test('nodeId references the str node', () => {
      const {str, sid} = setup('abc');
      const result = toDto(str, [0]);
      const nodeId = result[6];
      expect(nodeId[0]).toBe(str.node.id.time);
      // If str node was created by setSchema (sid=2), different from the
      // model clock sid, so the shorthand includes the sid.
      if (str.node.id.sid !== sid) {
        expect(nodeId.length).toBe(2);
        expect(nodeId[1]).toBe(str.node.id.sid);
      } else {
        expect(nodeId.length).toBe(1);
      }
    });
  });

  describe('caret selections (single position, no range)', () => {
    test('caret at position 0 (before first character)', () => {
      const {str} = setup('abc');
      const result = toDto(str, [0]);
      const cursors = result[7];
      expect(cursors.length).toBe(1);
      const [cursor] = cursors;
      expect(cursor.length).toBe(1);
      const [anchorPoint] = cursor;
      expect(anchorPoint[0][0]).toBe(str.node.id.time);
    });

    test('caret at position 1 (after first character)', () => {
      const {str} = setup('abc');
      const result = toDto(str, [1]);
      const cursors = result[7];
      expect(cursors.length).toBe(1);
      const [cursor] = cursors;
      expect(cursor.length).toBe(1);
      // findId(0) returns the ID of the first character
      const expectedId = str.findId(0);
      expect(cursor[0][0][0]).toBe(expectedId.time);
    });

    test('caret at end of string', () => {
      const {str} = setup('abc');
      const result = toDto(str, [3]);
      const cursors = result[7];
      expect(cursors.length).toBe(1);
      const [cursor] = cursors;
      expect(cursor.length).toBe(1);
      // findId(2) = last char
      const expectedId = str.findId(2);
      expect(cursor[0][0][0]).toBe(expectedId.time);
    });

    test('number shorthand produces the same result as [n] tuple', () => {
      const {str} = setup('hello');
      const fromNumber = toDto(str, [2]);
      const fromTuple = toDto(str, [[2]]);
      expect(fromNumber[7]).toEqual(fromTuple[7]);
    });

    test('tuple [n, n] with same anchor and focus produces a caret (no focus)', () => {
      const {str} = setup('hello');
      const result = toDto(str, [[3, 3]]);
      const cursors = result[7];
      expect(cursors.length).toBe(1);
      expect(cursors[0].length).toBe(1);
    });
  });

  describe('range selections (anchor and focus)', () => {
    test('forward selection [1, 3]', () => {
      const {str} = setup('abcde');
      const result = toDto(str, [[1, 3]]);
      // console.log(JSON.stringify(result, null, 2));
      const cursors = result[7];
      expect(cursors.length).toBe(1);
      const cursor = cursors[0];
      expect(cursor.length).toBe(2);
      const [anchorPoint, focusPoint] = cursor;
      const anchorId = str.findId(0);
      const focusId = str.findId(2);
      expect(anchorPoint[0][0]).toBe(anchorId.time);
      expect(focusPoint![0][0]).toBe(focusId.time);
    });

    test('backward selection [4, 1]', () => {
      const {str} = setup('abcde');
      const result = toDto(str, [[4, 1]]);
      const cursors = result[7];
      expect(cursors.length).toBe(1);
      const cursor = cursors[0];
      expect(cursor.length).toBe(2);
      const [anchorPoint, focusPoint] = cursor;
      const anchorId = str.findId(3);
      const focusId = str.findId(0);
      expect(anchorPoint[0][0]).toBe(anchorId.time);
      expect(focusPoint![0][0]).toBe(focusId.time);
    });

    test('select entire string [0, 5]', () => {
      const {str} = setup('abcde');
      const result = toDto(str, [[0, 5]]);
      const cursors = result[7];
      expect(cursors.length).toBe(1);
      const cursor = cursors[0];
      expect(cursor.length).toBe(2);
      expect(cursor[0][0][0]).toBe(str.node.id.time);
      const lastCharId = str.findId(4);
      expect(cursor[1]![0][0]).toBe(lastCharId.time);
    });
  });

  describe('multiple selections', () => {
    test('multiple carets', () => {
      const {str} = setup('hello world');
      const result = toDto(str, [0, 5, 11]);
      const cursors = result[7];
      expect(cursors.length).toBe(3);
      for (const cursor of cursors) {
        expect(cursor.length).toBe(1); // all carets
      }
    });

    test('mixed carets and ranges', () => {
      const {str} = setup('hello world');
      const selections: StrSelection[] = [3, [0, 5], 11];
      const result = toDto(str, selections);
      const cursors = result[7];
      expect(cursors.length).toBe(3);
      expect(cursors[0].length).toBe(1); // caret
      expect(cursors[1].length).toBe(2); // range
      expect(cursors[2].length).toBe(1); // caret
    });
  });

  describe('empty string', () => {
    test('caret at position 0 in empty string', () => {
      const {str} = setup('');
      const result = toDto(str, [0]);
      const cursors = result[7];
      expect(cursors.length).toBe(1);
      expect(cursors[0].length).toBe(1);
      expect(cursors[0][0][0][0]).toBe(str.node.id.time);
    });

    test('empty selections array', () => {
      const {str} = setup('hello');
      const result = toDto(str, []);
      const cursors = result[7];
      expect(cursors.length).toBe(0);
    });
  });

  describe('ID stability across edits', () => {
    test('IDs remain valid after text is inserted before the selection', () => {
      const {str, doc} = setup('abcde');
      const result = toDto(str, [3]);
      const anchorTime = result[7][0][0][0][0];
      const cId = str.findId(2);
      expect(anchorTime).toBe(cId.time);
      str.ins(0, 'XY');
      const newPos = str.findPos(cId);
      expect(newPos).toBe(4); // shifted by 2
    });

    test('IDs remain valid after text is deleted before the selection', () => {
      const {str} = setup('abcde');
      const cId = str.findId(2); // ID of 'c'
      const result = toDto(str, [3]);
      const anchorTime = result[7][0][0][0][0];
      expect(anchorTime).toBe(cId.time);
      // Delete 'ab'
      str.del(0, 2);
      // 'c' is now at position 0
      const newPos = str.findPos(cId);
      expect(newPos).toBe(0);
    });
  });

  describe('multi-chunk strings', () => {
    test('works after multiple insert operations create separate chunks', () => {
      const doc = Model.create();
      doc.api.set('');
      const str = doc.api.str([]);
      str.ins(0, 'aaa');
      str.ins(3, 'bbb');
      str.ins(0, 'ccc');
      // String is now 'cccaaabbb'
      expect(str.view()).toBe('cccaaabbb');
      const result = toDto(str, [3, [1, 8]]);
      const cursors = result[7];
      expect(cursors.length).toBe(2);
      // First: caret at position 3
      expect(cursors[0].length).toBe(1);
      const caretId = str.findId(2); // char at index 2 = last 'c'
      expect(cursors[0][0][0][0]).toBe(caretId.time);
      // Second: range [1, 8]
      expect(cursors[1].length).toBe(2);
      const anchorId = str.findId(0); // first 'c'
      const focusId = str.findId(7); // second 'b'
      expect(cursors[1][0][0][0]).toBe(anchorId.time);
      expect(cursors[1][1]![0][0]).toBe(focusId.time);
    });
  });
});
