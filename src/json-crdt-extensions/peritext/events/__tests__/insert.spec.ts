import {type Kit, runAlphabetKitTestSuite} from '../../../../json-crdt-extensions/peritext/__tests__/setup';
import {PeritextEventDefaults} from '../defaults/PeritextEventDefaults';
import {PeritextEventTarget} from '../PeritextEventTarget';

const testSuite = (getKit: () => Kit) => {
  const setup = () => {
    const kit = getKit();
    const et = new PeritextEventTarget();
    const defaults = new PeritextEventDefaults(kit.peritext, et);
    et.defaults = defaults;
    return {...kit, et};
  };

  test('can insert text', async () => {
    const kit = setup();
    kit.editor.cursor.setAt(2);
    kit.et.insert('123');
    expect(kit.peritext.str.view()).toBe('ab123cdefghijklmnopqrstuvwxyz');
  });

  test('can insert a character at text REL start', async () => {
    const kit = setup();
    kit.editor.cursor.set(kit.peritext.pointStart()!);
    kit.et.insert('0');
    expect(kit.peritext.str.view()).toBe('0abcdefghijklmnopqrstuvwxyz');
  });

  test('can insert a character at text ABS start', async () => {
    const kit = setup();
    kit.editor.cursor.set(kit.peritext.pointAbsStart()!);
    kit.et.insert('0');
    expect(kit.peritext.str.view()).toBe('0abcdefghijklmnopqrstuvwxyz');
  });

  test('can insert a character at text REL end', async () => {
    const kit = setup();
    kit.editor.cursor.set(kit.peritext.pointEnd()!);
    kit.et.insert('0');
    expect(kit.peritext.str.view()).toBe('abcdefghijklmnopqrstuvwxyz0');
  });

  test('can insert a character at text ABS end', async () => {
    const kit = setup();
    kit.editor.cursor.set(kit.peritext.pointAbsEnd()!);
    kit.et.insert('0');
    expect(kit.peritext.str.view()).toBe('abcdefghijklmnopqrstuvwxyz0');
  });
};

describe('"insert" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
