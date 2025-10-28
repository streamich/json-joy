import {type Kit, runNumbersKitTestSuite} from './setup';
import {Anchor} from '../rga/constants';

const testSuite = (setup: () => Kit): void => {
  describe('.pointIn()', () => {
    test('can infer point between characters', () => {
      const {peritext} = setup();
      for (let i = 0; i <= 9; i++) {
        const p0 = peritext.pointIn(i);
        expect(p0.anchor).toBe(Anchor.After);
        expect(p0.viewPos()).toBe(i);
        expect(p0.rightChar()?.view()).toBe(i.toString());
        const p1 = peritext.pointIn(i, Anchor.Before);
        expect(p1.anchor).toBe(Anchor.Before);
        expect(p1.viewPos()).toBe(i);
        expect(p1.rightChar()?.view()).toBe(i.toString());
      }
    });
  });
};

runNumbersKitTestSuite(testSuite);
