import {type Kit, runAlphabetKitTestSuite} from '../../../../json-crdt-extensions/peritext/__tests__/setup';
import { SliceTypeCon } from '../../slice/constants';
import { getEventsKit } from './setup';

const testSuite = (getKit: () => Kit) => {
  const setup = () => getEventsKit(getKit);

  describe('"ins" action', () => {
    test('can mark text as bold', async () => {
      const kit = setup();
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      const html = kit.toHtml();
      expect(html).toBe('<p>abc<b>def</b>ghijklmnopqrstuvwxyz</p>');
    });
  });
    
  describe('"erase" action', () => {
    test('inverts part of formatting', async () => {
      const kit = setup();
      kit.et.cursor({at: [5, 10]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b>klmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
      kit.et.cursor({at: [7, 9]});
      kit.et.format({action: 'erase'});
      expect(kit.toHtml()).toBe('<p>abcde<b>fg</b>hi<b>j</b>klmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
    });

    test('removes entire formatting slice when cointained', async () => {
      const kit = setup();
      kit.et.cursor({at: [5, 10]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b>klmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
      kit.et.cursor({at: [4, 11]});
      kit.et.format({action: 'erase'});
      expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(0);
    });
  });
};

describe('"format" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
