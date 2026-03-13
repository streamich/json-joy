import {type Kit, runNumbersKitTestSuite} from '../../__tests__/setup';

/**
 * Verifies that the `padded` flag causes slice endpoints to be anchored to
 * immediately-deleted tombstone characters rather than to the content chars.
 */

const testSuite = (setup: () => Kit): void => {
  const stackings: [name: string, ins: (kit: Kit) => ReturnType<Kit['peritext']['savedSlices']['insAtomic']>][] = [
    ['Many (Stack)', ({peritext}) => peritext.savedSlices.insStack(peritext.rangeAt(3, 3), 'tag', void 0, true)],
    ['One (Overwrite)', ({peritext}) => peritext.savedSlices.insOne(peritext.rangeAt(3, 3), 'tag', void 0, true)],
    ['Atomic', ({peritext}) => peritext.savedSlices.insAtomic(peritext.rangeAt(3, 3), 'tag', void 0, true)],
  ];

  for (const [name, ins] of stackings) {
    describe(`${name} – padded = true`, () => {
      test('visible text is unchanged after padded insertion', () => {
        const kit = setup();
        ins(kit);
        expect(kit.peritext.strApi().view()).toBe('0123456789');
      });

      test('slice start is anchored to a tombstone character', () => {
        const kit = setup();
        const slice = ins(kit);
        expect(slice.start.chunk()?.del).toBe(true);
      });

      test('slice end is anchored to a tombstone character', () => {
        const kit = setup();
        const slice = ins(kit);
        expect(slice.end.chunk()?.del).toBe(true);
      });

      test('start and end tombstones are distinct from content characters', () => {
        const kit = setup();
        const slice = ins(kit);
        // Content char IDs live in the RGA. The pad IDs must not equal any
        // visible-character ID inside the range "345" (positions 3, 4, 5).
        const {peritext} = kit;
        const contentIds = [3, 4, 5].map((pos) => peritext.pointAt(pos).id);
        for (const contentId of contentIds) {
          expect(slice.start.id).not.toStrictEqual(contentId);
          expect(slice.end.id).not.toStrictEqual(contentId);
        }
      });
    });
  }
};

runNumbersKitTestSuite(testSuite);
