import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Anchor} from '../../rga/constants';
import type {Editor} from '../Editor';
import type {PointDto} from '../types';

const setup = (
  insert = (editor: Editor<string>) => {
    editor.insert('Hello world!');
  },
  sid?: number,
) => {
  const model = Model.create(void 0, sid);
  model.api.set({
    text: '',
    slices: [],
  });
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  const editor = peritext.editor;
  insert(editor);
  return {model, peritext, editor};
};

describe('.pos2point()', () => {
  test('resolves a numeric view position', () => {
    const {editor, peritext} = setup();
    const point = editor.pos2point(3);
    expect(point.cmp(peritext.pointAt(3))).toBe(0);
  });

  test('returns a Point instance unchanged', () => {
    const {editor, peritext} = setup();
    const point = peritext.pointAt(4, Anchor.After);
    expect(editor.pos2point(point)).toBe(point);
  });

  test('resolves a [position, anchor] tuple', () => {
    const {editor, peritext} = setup();
    const after = editor.pos2point([3, 1]);
    expect(after.cmp(peritext.pointAt(3, Anchor.After))).toBe(0);
    expect(after.anchor).toBe(Anchor.After);
    const before = editor.pos2point([3, 0]);
    expect(before.cmp(peritext.pointAt(3, Anchor.Before))).toBe(0);
    expect(before.anchor).toBe(Anchor.Before);
  });

  describe('PointDto', () => {
    test('resolves a [sid, time, anchor] tuple back to the original point', () => {
      const {editor, peritext} = setup();
      const original = peritext.pointAt(5, Anchor.After);
      const dto = original.toDto();
      // The disambiguation from a [position, anchor] tuple relies on the second
      // element (the logical `time`) being greater than 1.
      expect(dto[1]).toBeGreaterThan(1);
      const point = editor.pos2point(dto);
      expect(point.id.sid).toBe(original.id.sid);
      expect(point.id.time).toBe(original.id.time);
      expect(point.anchor).toBe(original.anchor);
      expect(point.cmp(original)).toBe(0);
      expect(point.viewPos()).toBe(original.viewPos());
    });

    test('resolves a [sid, time] tuple with the default anchor', () => {
      const {editor, peritext} = setup();
      const original = peritext.pointAt(7, Anchor.Before);
      const dto: PointDto = [original.id.sid, original.id.time];
      const point = editor.pos2point(dto);
      expect(point.anchor).toBe(Anchor.Before);
      expect(point.cmp(original)).toBe(0);
    });

    test('round-trips every point through .toDto() / .pos2point()', () => {
      const {editor, peritext} = setup();
      for (let pos = 0; pos < 12; pos++) {
        for (const anchor of [Anchor.Before, Anchor.After]) {
          const original = peritext.pointAt(pos, anchor);
          const point = editor.pos2point(original.toDto());
          expect(point.cmp(original)).toBe(0);
          expect(point.viewPos()).toBe(original.viewPos());
        }
      }
    });
  });
});

describe('.sel2range()', () => {
  test('resolves a pair of PointDto tuples into the same range as the points', () => {
    const {editor, peritext} = setup();
    const p1 = peritext.pointAt(2, Anchor.Before);
    const p2 = peritext.pointAt(6, Anchor.After);
    const [rangeFromDto] = editor.sel2range([p1.toDto(), p2.toDto()]);
    const [rangeFromPoints] = editor.sel2range([p1, p2]);
    expect(rangeFromDto.text()).toBe(rangeFromPoints.text());
    expect(rangeFromDto.text()).toBe('llo w');
  });

  test('can mix a PointDto with a numeric position', () => {
    const {editor, peritext} = setup();
    const start = peritext.pointAt(0, Anchor.Before);
    const [range] = editor.sel2range([start.toDto(), 5]);
    expect(range.text()).toBe('Hello');
  });
});
