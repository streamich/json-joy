import {Timestamp} from '../../../../json-crdt-patch';
import {updateId} from '../../../../json-crdt/hash';
import {updateNum} from '../../../../json-hash/hash';
import {
  type Kit,
  setupKit,
  setupNumbersKit,
  setupNumbersWithMultipleChunksAndDeletesKit,
  setupNumbersWithRgaSplitKit,
  setupNumbersWithTombstonesKit,
  setupNumbersWithTwoChunksKit,
} from '../../__tests__/setup';
import {Point} from '../../rga/Point';
import {Inline} from '../Inline';

describe('range hash', () => {
  test('computes unique hash - 1', () => {
    const {peritext} = setupKit();
    const p1 = new Point(peritext.str, new Timestamp(12313123, 41), 0);
    const p2 = new Point(peritext.str, new Timestamp(12313123, 41), 1);
    const p3 = new Point(peritext.str, new Timestamp(12313123, 43), 0);
    const p4 = new Point(peritext.str, new Timestamp(12313123, 43), 1);
    const hash1 = updateNum(p1.refresh(), p2.refresh());
    const hash2 = updateNum(p3.refresh(), p4.refresh());
    expect(hash1).not.toBe(hash2);
  });

  test('computes unique hash - 2', () => {
    const {peritext} = setupKit();
    const p1 = new Point(peritext.str, new Timestamp(12313123, 61), 0);
    const p2 = new Point(peritext.str, new Timestamp(12313123, 23), 1);
    const p3 = new Point(peritext.str, new Timestamp(12313123, 60), 0);
    const p4 = new Point(peritext.str, new Timestamp(12313123, 56), 1);
    const hash1 = updateNum(p1.refresh(), p2.refresh());
    const hash2 = updateNum(p3.refresh(), p4.refresh());
    expect(hash1).not.toBe(hash2);
  });

  test('computes unique hash - 3', () => {
    const {peritext} = setupKit();
    const p1 = new Point(peritext.str, new Timestamp(12313123, 43), 0);
    const p2 = new Point(peritext.str, new Timestamp(12313123, 61), 1);
    const p3 = new Point(peritext.str, new Timestamp(12313123, 43), 0);
    const p4 = new Point(peritext.str, new Timestamp(12313123, 60), 1);
    const hash1 = updateNum(p1.refresh(), p2.refresh());
    const hash2 = updateNum(p3.refresh(), p4.refresh());
    expect(hash1).not.toBe(hash2);
  });

  test('computes unique hash - 4', () => {
    const hash1 = updateNum(updateId(0, new Timestamp(2, 7)), updateId(1, new Timestamp(2, 7)));
    const hash2 = updateNum(updateId(0, new Timestamp(2, 6)), updateId(1, new Timestamp(2, 40)));
    expect(hash1).not.toBe(hash2);
  });
});

const runKeyTests = (setup: () => Kit) => {
  describe('.key()', () => {
    test('construct unique keys for all ranges', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      const length = peritext.strApi().length();
      const keys = new Map<number | string, Inline>();
      let cnt = 0;
      for (let i = 0; i < length; i++) {
        // for (let j = 1; j <= length - i; j++) {
        const j = 1;
        peritext.editor.cursor.setAt(i, j);
        overlay.refresh();
        const [start, end] = [...overlay.points()];
        const inline = new Inline(peritext, start, end, start, end);
        if (keys.has(inline.key())) {
          const inline2 = keys.get(inline.key())!;
          // tslint:disable-next-line:no-console
          console.error('DUPLICATE KEY:', inline.key());
          // tslint:disable-next-line:no-console
          console.log('INLINE 1:', inline.p1.id, inline.p1.anchor, inline.end.id, inline.end.anchor);
          // tslint:disable-next-line:no-console
          console.log('INLINE 2:', inline2.p1.id, inline2.p1.anchor, inline2.end.id, inline2.end.anchor);
          throw new Error('Duplicate key');
        }
        keys.set(inline.key(), inline);
        cnt++;
        // }
      }
      expect(keys.size).toBe(cnt);
    });
  });
};

describe('Inline', () => {
  describe('lorem ipsum', () => {
    runKeyTests(() => setupKit('lorem ipsum dolor sit amet consectetur adipiscing elit'));
  });

  describe('numbers "0123456789", no edits', () => {
    runKeyTests(setupNumbersKit);
  });

  describe('numbers "0123456789", with default schema and tombstones', () => {
    runKeyTests(setupNumbersWithTombstonesKit);
  });

  describe('numbers "0123456789", two RGA chunks', () => {
    runKeyTests(setupNumbersWithTwoChunksKit);
  });

  describe('numbers "0123456789", with RGA split', () => {
    runKeyTests(setupNumbersWithRgaSplitKit);
  });

  describe('numbers "0123456789", with multiple deletes', () => {
    runKeyTests(setupNumbersWithMultipleChunksAndDeletesKit);
  });

  describe('numbers "0123456789", with default schema and tombstones and constant sid', () => {
    runKeyTests(() => setupNumbersWithTombstonesKit(12313123));
  });
});
