import {type Kit, runAlphabetKitTestSuite} from '../../../json-crdt-extensions/peritext/__tests__/setup';
import {PeritextEventDefaults} from '../PeritextEventDefaults';
import {PeritextEventTarget} from '../PeritextEventTarget';

const testSuite = (getKit: () => Kit) => {
  const setup = () => {
    const kit = getKit();
    const et = new PeritextEventTarget();
    const defaults = new PeritextEventDefaults(kit.peritext, et);
    et.defaults = defaults;
    return {...kit, et};
  };

  test('can add annotation to the current selection', async () => {
    const kit = setup();
    kit.et.cursor({at: 3, len: 3});
    kit.et.format({type: 'bold'});
    kit.peritext.refresh();
    const slices = kit.peritext.overlay.findOverlapping(kit.peritext.rangeAt(5));
    console.log([...slices]);
    console.log(kit.peritext + '');
  });
};

describe('"insert" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
