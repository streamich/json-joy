import {type Kit, runAlphabetKitTestSuite} from '../../../../json-crdt-extensions/peritext/__tests__/setup';
import {view1} from '../../editor/__tests__/fixtures';
import {Anchor} from '../../rga/constants';
import {SliceTypeCon} from '../../slice/constants';
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

  test('can insert with different affinity at bold start', async () => {
    const kit = setup();
    kit.et.cursor({at: [1, 2]});
    kit.peritext.refresh();
    kit.et.format('ins', SliceTypeCon.b);
    kit.editor.delCursors();
    kit.peritext.refresh();
    kit.et.cursor({at: [1]});
    kit.editor.cursor.collapseToStart();
    kit.peritext.refresh();
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

    // Insert "x" at position 1, not bold, gravitates to the left.
    kit.et.insert('x');
    kit.peritext.refresh();
    const range = kit.peritext.rangeAt(1, 1);
    expect(range.text()).toBe('x');
    const slices = kit.peritext.overlay.findOverlapping(range);
    expect(slices.size).toBe(0);
    
    // Insert "y" half-point to right, now bold, gravitates to the right.
    kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);
    kit.et.insert('y');
    kit.peritext.refresh();
    const range2 = kit.peritext.rangeAt(2, 1);
    expect(range2.text()).toBe('y');
    const slices2 = kit.peritext.overlay.findOverlapping(range);
    expect(slices2.size).toBe(1);
    const slice = slices2.values().next().value;
    expect(slice?.type()).toBe(SliceTypeCon.b);

    // Cursor appears after the newly inserted text
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('y');
  });

  test('can insert with different affinity at bold start (tombstone)', async () => {
    const kit = setup();
    kit.et.cursor({at: [2, 5]});
    kit.peritext.refresh();
    kit.et.format('ins', SliceTypeCon.b);
    kit.editor.delCursors();
    kit.peritext.refresh();
    kit.et.cursor({at: [2, 3]});
    kit.editor.del();
    kit.editor.delCursors();
    kit.peritext.refresh();
    kit.et.cursor({at: [1]});
    kit.peritext.refresh();
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('a');
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);
    
    // Insert "x" after "b", not bold, gravitates to the left.
    kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
    kit.peritext.refresh();
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('b');
    kit.et.insert('x');
    kit.peritext.refresh();
    const range = kit.peritext.rangeAt(2, 1);
    expect(range.text()).toBe('x');
    const slices = kit.peritext.overlay.findOverlapping(range);
    expect(slices.size).toBe(0); // not bold
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('x');
    
    // Insert "y" after "x", now bold, gravitates to the right.
    kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('x');
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);
    kit.et.insert('y');
    kit.peritext.refresh();
    const range2 = kit.peritext.rangeAt(3, 1);
    expect(range2.text()).toBe('y');
    const slices2 = kit.peritext.overlay.findOverlapping(range);
    expect(slices2.size).toBe(1);
    const slice = slices2.values().next().value;
    expect(slice?.type()).toBe(SliceTypeCon.b);

    // Cursor appears after the newly inserted text
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('y');
  });
};

describe('"insert" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
