import {type Kit, runAlphabetKitTestSuite} from '../../../../json-crdt-extensions/peritext/__tests__/setup';
import {PeritextCommands} from '../../commands/PeritextCommands';
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
    const cmd = new PeritextCommands(kit.peritext, et);
    const exec: typeof cmd.exec = (...args: any[]): any => {
      const result = (cmd as any).exec(...args);
      kit.peritext.refresh();
      return result;
    };
    const run = cmd.run;
    return {...kit, et, cmd, exec, run};
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

  test('can insert with different affinity at bold end', async () => {
    const kit = setup();
    kit.et.cursor({at: [10, 13]}); // "klm"
    kit.peritext.refresh();
    kit.et.format('ins', 'BOLD');
    kit.editor.delCursors();
    kit.peritext.refresh();
    kit.et.cursor({at: [12]});
    kit.editor.cursor.collapseToStart();
    kit.peritext.refresh();
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('l');

    // Insert "x" after "m", bold, gravitates to the left.
    kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('m');
    kit.et.insert('x');
    kit.peritext.refresh();
    const range = kit.peritext.rangeAt(13, 1);
    expect(range.text()).toBe('x');
    const slices = kit.peritext.overlay.findOverlapping(range);
    expect(slices.size).toBe(1);
    const slice = slices.values().next().value;
    expect(slice?.type()).toBe('BOLD');
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('x');

    // Insert "y" half-point to right, now bold, gravitates to the right.
    kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('x');
    kit.et.insert('y');
    kit.peritext.refresh();
    const range2 = kit.peritext.rangeAt(14, 1);
    expect(range2.text()).toBe('y');
    const slices2 = kit.peritext.overlay.findOverlapping(range2);
    expect(slices2.size).toBe(0);

    // Cursor appears after the newly inserted text
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('y');
  });

  test('can insert with different affinity at bold end (tombstone)', async () => {
    const kit = setup();
    kit.et.cursor({at: [10, 13]}); // "klm"
    kit.peritext.refresh();
    kit.et.format('ins', 'BOLD');
    kit.editor.delCursors();
    kit.peritext.refresh();
    kit.et.cursor({at: [13, 14]}); // Creates tombstone out of "n"
    kit.editor.del();
    kit.peritext.refresh();
    kit.et.cursor({at: [12]});
    kit.editor.cursor.collapseToStart();
    kit.peritext.refresh();
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('l');

    // Insert "x" after "m", bold, gravitates to the left.
    kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('m');
    kit.et.insert('x');
    kit.peritext.refresh();
    const range = kit.peritext.rangeAt(13, 1);
    expect(range.text()).toBe('x');
    const slices = kit.peritext.overlay.findOverlapping(range);
    expect(slices.size).toBe(1);
    const slice = slices.values().next().value;
    expect(slice?.type()).toBe('BOLD');
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('x');

    // Insert "y" half-point to right, now bold, gravitates to the right.
    kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('x');
    kit.et.insert('y');
    kit.peritext.refresh();
    const range2 = kit.peritext.rangeAt(14, 1);
    expect(range2.text()).toBe('y');
    const slices2 = kit.peritext.overlay.findOverlapping(range2);
    expect(slices2.size).toBe(0);

    // Cursor appears after the newly inserted text
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('y');
  });

  test('can insert at different affinities in empty <code>', async () => {
    const kit = setup();
    kit.et.cursor({at: [2, 1]}); // <code>"b"</code>
    kit.peritext.refresh();
    kit.et.format('ins', 'code');
    kit.editor.delCursors();
    kit.peritext.refresh();
    kit.et.cursor({at: [2]}); // Delete "b", creating empty <code></code> slice.
    kit.editor.del();
    kit.peritext.refresh();
    kit.editor.delCursors();
    kit.et.cursor({at: [0]});
    kit.editor.cursor.collapseToStart();
    kit.peritext.refresh();
    expect(kit.editor.cursor.start.rightChar()?.view()).toBe('a');

    // Insert "x" before <code></code>, not code, gravitates to the left.
    kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('a');
    kit.et.insert('x');
    kit.peritext.refresh();
    const range = kit.peritext.rangeAt(1, 1);
    expect(range.text()).toBe('x');
    const slices = kit.peritext.overlay.findOverlapping(range);
    expect(slices.size).toBe(0);

    // Insert "y" inside <code></code>, gravitates to the inside.
    kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('x');
    kit.et.insert('y');
    kit.peritext.refresh();
    const range2 = kit.peritext.rangeAt(2, 1);
    expect(range2.text()).toBe('y');
    const slices2 = kit.peritext.overlay.findOverlapping(range2);
    expect(slices2.size).toBe(1);
    const slice2 = slices2.values().next().value;
    expect(slice2?.type()).toBe('code');

    // Insert "z" after <code></code>.
    kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
    expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('y');
    expect(kit.editor.cursor.start.rightChar()?.view()).toBe('c');
    kit.et.insert('z');
    kit.peritext.refresh();
    const range3 = kit.peritext.rangeAt(3, 1);
    expect(range3.text()).toBe('z');
    const slices3 = kit.peritext.overlay.findOverlapping(range3);
    expect(slices3.size).toBe(0);

    // Cursor appears after the newly inserted text
    expect(kit.editor.cursor.start.leftChar()?.view()).toBe('z');
  });

  test('can insert in <code>, whose all contents are deleted (zombie slice)', async () => {
    const kit = setup();
    kit.et.cursor({at: [2, 3]}); // <code>"c"</code>
    kit.peritext.refresh();
    kit.et.format('ins', 'code');
    kit.peritext.refresh();
    kit.exec('Caret', 4);
    kit.editor.del();
    kit.peritext.refresh();
    kit.editor.del();
    kit.peritext.refresh();
    kit.editor.delCursors();
    kit.peritext.refresh();

    // Insert before the deleted <code></code> slice.
    kit.exec('Caret', 1);
    expect(kit.exec('CharLeft')).toBe('a');
    kit.exec('MoveRight');
    expect(kit.exec('CharLeft')).toBe('b');
    kit.exec('Insert', '0');
    expect(kit.exec('CharLeft')).toBe('0');

    // Enter into deleted <code></code> slice.
    kit.exec('MoveRight');
    expect(kit.exec('CharLeft')).toBe('0');
    kit.exec('Insert', '1');
    const range = kit.peritext.rangeAt(3, 1);
    const [complete] = kit.peritext.overlay.stat(range);
    expect([...complete]).toEqual(['code']);
    expect(kit.exec('CharLeft')).toBe('1');

    // Insert right after the <code>0</code> slice.
    kit.exec('MoveRight');
    expect(kit.exec('CharLeft')).toBe('1');
    expect(kit.exec('CharRight')).toBe('e');
    kit.exec('Insert', '2');
    const range2 = kit.peritext.rangeAt(4, 1);
    const [complete2] = kit.peritext.overlay.stat(range2);
    expect([...complete2]).toEqual([]);

    // Move after "e".
    kit.exec('MoveRight');
    expect(kit.exec('CharLeft')).toBe('e');
  });

  // test('can navigate two zombie slices one after another', async () => {
  //   const kit = setup();
  //   kit.et.cursor({at: [2, 3]}); // <code>"c"</code>
  //   kit.peritext.refresh();
  //   kit.et.format('ins', 'code');
  //   kit.peritext.refresh();
  //   kit.et.cursor({at: [4, 5]}); // <key>"e"</key>
  //   kit.peritext.refresh();
  //   kit.et.format('ins', 'key');
  //   kit.peritext.refresh();

  //   kit.et.cursor({at: [4]});
  //   kit.peritext.refresh();
  //   kit.editor.del(); // delete "d"
  //   kit.peritext.refresh();
  //   kit.editor.del(); // delete "c"
  //   kit.peritext.refresh();

  //   kit.et.cursor({at: [4]});
  //   kit.peritext.refresh();
  //   kit.editor.del(); // delete "f"
  //   kit.peritext.refresh();
  //   console.log(kit.peritext + '');
  //   kit.editor.del(); // delete "e"
  //   kit.peritext.refresh();
  //   console.log(kit.peritext + '');

  //   // Insert before the deleted <code></code> slice.
  //   kit.et.cursor({at: [1]});
  //   kit.peritext.refresh();
  //   expect(kit.editor.cursor.start.leftChar()?.view()).toBe('a');
  //   kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
  //   kit.peritext.refresh();
  //   expect(kit.editor.cursor.start.leftChar()?.view()).toBe('b');
  //   kit.et.insert('0');
  //   kit.peritext.refresh();
  //   expect(kit.editor.cursor.start.leftChar()?.view()).toBe('0');

  //   // Enter into deleted <code></code> slice.
  //   kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
  //   kit.peritext.refresh();
  //   expect(kit.editor.cursor.start.leftChar()?.view()).toBe('0');
  //   kit.et.insert('1');
  //   kit.peritext.refresh();
  //   const range = kit.peritext.rangeAt(3, 1);
  //   const [complete] = kit.peritext.overlay.stat(range);
  //   // expect([...complete]).toEqual(['code']);
  //   // expect(kit.editor.cursor.start.leftChar()?.view()).toBe('1');

  //   console.log(kit.peritext + '');

  //   // // Insert right after the <code>0</code> slice.
  //   // kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
  //   // kit.peritext.refresh();
  //   // expect(kit.editor.cursor.start.leftChar()?.view()).toBe('1');
  //   // expect(kit.editor.cursor.start.rightChar()?.view()).toBe('e');
  //   // kit.et.insert('2');
  //   // kit.peritext.refresh();
  //   // const range2 = kit.peritext.rangeAt(4, 1);
  //   // const [complete2] = kit.peritext.overlay.stat(range2);
  //   // expect([...complete2]).toEqual([]);

  //   // // Move after "e".
  //   // kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
  //   // kit.peritext.refresh();
  //   // expect(kit.editor.cursor.start.leftChar()?.view()).toBe('e');
  // });
};

describe('"insert" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
