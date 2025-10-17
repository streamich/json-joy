import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import {CommonSliceType} from '../../slice';
import {Inline} from '../Inline';
import {LeafBlock} from '../LeafBlock';

const testSuite = (setup: () => Kit): void => {
  describe('when no markers', () => {
    test('can create a fragment', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(3, 10);
      const fragment = kit.peritext.fragment(range);
      expect(fragment.text()).toBe('defghijklm');
      fragment.refresh();
      expect(fragment.root.children[0]).toBeInstanceOf(LeafBlock);
      expect(fragment.root.children[0].text()).toBe('defghijklm');
      expect([...fragment.root.children[0].texts()][0]).toBeInstanceOf(Inline);
      expect([...fragment.root.children[0].texts()][0].text()).toBe('defghijklm');
    });
  });

  describe('with markers', () => {
    test('around a marker', () => {
      const kit = setup();
      kit.peritext.editor.cursor.setAt(5);
      kit.peritext.editor.saved.insMarker(CommonSliceType.p);
      kit.peritext.refresh();
      const range = kit.peritext.rangeAt(3, 10);
      const fragment = kit.peritext.fragment(range);
      fragment.refresh();
      expect(fragment.root.children[0]).toBeInstanceOf(LeafBlock);
      expect(fragment.root.children[0].text()).toBe('de');
      expect(fragment.root.children[1]).toBeInstanceOf(LeafBlock);
      expect(fragment.root.children[1].text()).toBe('fghijkl');
    });
  });
};

runAlphabetKitTestSuite(testSuite);
