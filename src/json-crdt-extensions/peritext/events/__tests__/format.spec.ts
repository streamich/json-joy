import {type Kit, runAlphabetKitTestSuite} from '../../../../json-crdt-extensions/peritext/__tests__/setup';
import { SliceTypeCon } from '../../slice/constants';
import {PersistedSlice} from '../../slice/PersistedSlice';
import { getEventsKit } from './setup';

const testSuite = (getKit: () => Kit) => {
  const setup = () => getEventsKit(getKit);

  describe('"ins" action', () => {
    test('can mark text as bold', () => {
      const kit = setup();
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      const html = kit.toHtml();
      expect(html).toBe('<p>abc<b>def</b>ghijklmnopqrstuvwxyz</p>');
    });
  });

  describe('"erase" action', () => {
    test('inverts part of formatting', () => {
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

    test('removes entire formatting slice when cointained', () => {
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

    test('can "erase" all formatting for two overlapping formattings', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 15]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.i});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>klmno</b></i><i>pqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
      kit.et.cursor({at: [11, 13]});
      kit.et.format({action: 'erase'});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>k</b></i>lm<i><b>no</b></i><i>pqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(4);
    });

    test('can "erase" specific formatting type', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 15]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.i});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>klmno</b></i><i>pqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
      kit.et.cursor({at: [11, 13]});
      kit.et.format({action: 'erase', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>k</b></i><i>lm</i><i><b>no</b></i><i>pqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(3);
    });
  });

  describe('"del" action', () => {
    test('deletes all intersecting formattings', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 15]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.i});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>klmno</b></i><i>pqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
      kit.et.cursor({at: [11, 13]});
      kit.et.format({action: 'del'});
      expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(0);
    });

    test('delete specific PersistedSlice', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 15]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.i});
      kit.et.cursor({at: [0]})
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>klmno</b></i><i>pqrst</i>uvwxyz</p>');
      let slice: PersistedSlice | undefined;
      const iterator = kit.peritext.savedSlices.iterator0();
      for (let item = iterator(); item; item = iterator()) {
        if (item instanceof PersistedSlice && item.type === SliceTypeCon.i) {
          slice = item;
          break;
        }
      }
      kit.et.cursor({clear: true});
      kit.et.format({action: 'del', slice});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghijklmno</b>pqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
    });

    test('delete specific PersistedSlice by ID', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 15]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.i});
      kit.et.cursor({at: [0]})
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>klmno</b></i><i>pqrst</i>uvwxyz</p>');
      let slice: PersistedSlice | undefined;
      const iterator = kit.peritext.savedSlices.iterator0();
      for (let item = iterator(); item; item = iterator()) {
        if (item instanceof PersistedSlice && item.type === SliceTypeCon.b) {
          slice = item;
          break;
        }
      }
      kit.et.cursor({clear: true});
      kit.et.format({action: 'del', slice: slice!.id});
      expect(kit.toHtml()).toBe('<p>abcdefghij<i>klmnopqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
    });
  });

  describe('"tog" action', () => {
    test('can toggle annotation', () => {
      const kit = setup();
      expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(0);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abc<b>def</b>ghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(0);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abc<b>def</b>ghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
    });

    test('can toggle inside an annotation', () => {
      const kit = setup();
      expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(0);
      kit.et.cursor({at: [2, 7]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>ab<b>cdefg</b>hijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>ab<b>c</b>def<b>g</b>hijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>ab<b>c</b><b>def</b><b>g</b>hijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>ab<b>c</b>def<b>g</b>hijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
    });
  });
};

describe('"format" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
