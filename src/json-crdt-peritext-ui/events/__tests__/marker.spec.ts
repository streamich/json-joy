import {create} from '..';
import {type Kit, runAlphabetKitTestSuite} from '../../../json-crdt-extensions/peritext/__tests__/setup';
import {SliceTypeCon} from '../../../json-crdt-extensions/peritext/slice/constants';
import {create as createTransfer} from '../../../json-crdt-extensions/peritext/transfer/create';

const testSuite = (getKit: () => Kit) => {
  const setup = () => {
    const kit = getKit();
    const defaults = create(kit.peritext);
    const et = defaults.et;
    return {...kit, defaults, et};
  };

  test('on [Enter] in <blockquote> adds new paragraph', async () => {
    const kit = setup();
    kit.et.cursor({at: 5});
    kit.et.marker({action: 'ins', type: [SliceTypeCon.blockquote, SliceTypeCon.p]});
    kit.peritext.refresh();
    const transfer = createTransfer(kit.peritext);
    const html1 = transfer.toHtml(kit.peritext.rangeAll()!);
    expect(html1).toBe('<p>abcde</p><blockquote><p>fghijklmnopqrstuvwxyz</p></blockquote>');
    expect(kit.peritext.blocks.root.children.length).toBe(2);
    expect(kit.peritext.blocks.root.children[1].children.length).toBe(1);
    kit.et.cursor({at: 10});
    kit.et.marker({action: 'ins'});
    kit.peritext.refresh();
    expect(kit.peritext.blocks.root.children.length).toBe(2);
    expect(kit.peritext.blocks.root.children[1].children.length).toBe(2);
    const html2 = transfer.toHtml(kit.peritext.rangeAll()!);
    expect(html2).toBe('<p>abcde</p><blockquote><p>fghi</p><p>jklmnopqrstuvwxyz</p></blockquote>');
  });

  test('on [Enter] in empty <blockquote> splits the blockquote', async () => {
    const kit = setup();
    kit.et.cursor({at: 5});
    kit.et.marker({action: 'ins', type: [SliceTypeCon.blockquote, SliceTypeCon.p]});
    kit.peritext.refresh();
    const transfer = createTransfer(kit.peritext);
    const html1 = transfer.toHtml(kit.peritext.rangeAll()!);
    expect(html1).toBe('<p>abcde</p><blockquote><p>fghijklmnopqrstuvwxyz</p></blockquote>');
    kit.et.cursor({at: 10});
    kit.et.marker({action: 'ins'});
    kit.peritext.refresh();
    const html2 = transfer.toHtml(kit.peritext.rangeAll()!);
    expect(html2).toBe('<p>abcde</p><blockquote><p>fghi</p><p>jklmnopqrstuvwxyz</p></blockquote>');
    kit.et.marker({action: 'ins'});
    kit.peritext.refresh();
    const html3 = transfer.toHtml(kit.peritext.rangeAll()!);
    expect(html3).toBe('<p>abcde</p><blockquote><p>fghi</p></blockquote><blockquote><p>jklmnopqrstuvwxyz</p></blockquote>');
  });

  test('can split <p> in list, list item <li> and create two adjacent lists', async () => {
    const kit = setup();
    kit.et.cursor({at: 3});
    kit.et.marker({action: 'ins', type: [SliceTypeCon.ul, SliceTypeCon.li, SliceTypeCon.p]});
    kit.peritext.refresh();
    const transfer = createTransfer(kit.peritext);
    const html1 = transfer.toHtml(kit.peritext.rangeAll()!);
    expect(html1).toBe('<p>abc</p><ul><li><p>defghijklmnopqrstuvwxyz</p></li></ul>');
    kit.et.cursor({at: 12});
    kit.et.marker({action: 'ins'});
    kit.peritext.refresh();
    const html2 = transfer.toHtml(kit.peritext.rangeAll()!);
    expect(html2).toBe('<p>abc</p><ul><li><p>defghijk</p><p>lmnopqrstuvwxyz</p></li></ul>');
    kit.et.marker({action: 'ins'});
    kit.peritext.refresh();
    const html3 = transfer.toHtml(kit.peritext.rangeAll()!);
    expect(html3).toBe('<p>abc</p><ul><li><p>defghijk</p></li><li><p>lmnopqrstuvwxyz</p></li></ul>');
    kit.et.marker({action: 'ins'});
    kit.peritext.refresh();
    const html4 = transfer.toHtml(kit.peritext.rangeAll()!);
    expect(html4).toBe('<p>abc</p><ul><li><p>defghijk</p></li></ul><ul><li><p>lmnopqrstuvwxyz</p></li></ul>');
  });
};

describe('"marker" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
