import {Kit, runAlphabetKitTestSuite, setupHelloWorldKit} from '../../__tests__/setup';
import {MarkerOverlayPoint} from '../../overlay/MarkerOverlayPoint';
import {Block} from '../Block';
import {LeafBlock} from '../LeafBlock';

const testSuite = (setup: (() => Kit)): void => {
  describe('when no markers', () => {
    test('can create a fragment', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(3, 10);
      const fragment = kit.peritext.fragment(range);
      expect(fragment.text()).toBe('defghijklm');
      fragment.refresh();
      expect(fragment.root.children[0]).toBeInstanceOf(LeafBlock);
      // expect(fragment.root.children[0]).toBeInstanceOf(LeafBlock);
      console.log(fragment + '');
    });
  });
};

runAlphabetKitTestSuite(testSuite);