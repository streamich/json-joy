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
};

describe('"format" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
