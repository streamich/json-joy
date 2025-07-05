import {type Kit, runAlphabetKitTestSuite} from '../../../../json-crdt-extensions/peritext/__tests__/setup';
import {SliceTypeCon} from '../../../../json-crdt-extensions/peritext/slice/constants';
import {create as createTransfer} from '../../../../json-crdt-extensions/peritext/transfer/create';
import {getEventsKit} from './setup';

const testSuite = (getKit: () => Kit) => {
  const setup = () => getEventsKit(getKit);

  describe('"ins" action', () => {
    test('can insert a paragraph marker in the middle of text', () => {
      const kit = setup();
      kit.et.cursor({at: [8]});
      kit.et.marker({action: 'ins', type: SliceTypeCon.p});
      const html = kit.toHtml();
      expect(html).toBe('<p>abcdefgh</p><p>ijklmnopqrstuvwxyz</p>');
    });

    test('can insert a paragraph marker at the start of text', () => {
      const kit = setup();
      kit.et.cursor({at: [0]});
      kit.et.marker({action: 'ins', type: SliceTypeCon.p});
      const html = kit.toHtml();
      expect(html).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
    });

    test('can insert a paragraph marker at the end of text', () => {
      const kit = setup();
      kit.et.cursor({at: [kit.peritext.strApi().view().length]});
      kit.et.marker({action: 'ins', type: SliceTypeCon.p});
      const html = kit.toHtml();
      expect(html).toBe('<p>abcdefghijklmnopqrstuvwxyz</p><p />');
    });

    test('can insert a nested block split marker', () => {
      const kit = setup();
      kit.et.cursor({at: [15]});
      kit.et.marker({action: 'ins', type: [SliceTypeCon.blockquote, SliceTypeCon.p]});
      const html = kit.toHtml();
      expect(html).toBe('<p>abcdefghijklmno</p><blockquote><p>pqrstuvwxyz</p></blockquote>');
    });

    test('can insert two nested block split marker', () => {
      const kit = setup();
      kit.et.cursor({at: [5]});
      kit.et.marker({action: 'ins', type: [SliceTypeCon.blockquote, SliceTypeCon.p]});
      kit.et.cursor({at: [10]});
      kit.et.marker({action: 'ins', type: [SliceTypeCon.blockquote, SliceTypeCon.p]});
      const html = kit.toHtml();
      expect(html).toBe('<p>abcde</p><blockquote><p>fghi</p><p>jklmnopqrstuvwxyz</p></blockquote>');
    });

    test('can insert two nested block split marker with discriminants', () => {
      const kit = setup();
      kit.et.cursor({at: [5]});
      kit.et.marker({action: 'ins', type: [[SliceTypeCon.blockquote, 0], SliceTypeCon.p]});
      kit.et.cursor({at: [10]});
      kit.et.marker({action: 'ins', type: [[SliceTypeCon.blockquote, 1], SliceTypeCon.p]});
      kit.peritext.refresh();
      const html = kit.toHtml();
      expect(html).toBe(
        '<p>abcde</p><blockquote><p>fghi</p></blockquote><blockquote><p>jklmnopqrstuvwxyz</p></blockquote>',
      );
    });
  });

  describe('"del" action', () => {
    test('delete specific PersistedSlice by reference and by ID', () => {
      const kit = setup();
      kit.et.cursor({at: [5]});
      kit.et.marker({action: 'ins', type: SliceTypeCon.p});
      kit.et.cursor({at: [10]});
      kit.et.marker({action: 'ins', type: [SliceTypeCon.blockquote, SliceTypeCon.p]});
      kit.et.cursor({at: [0]});
      expect(kit.toHtml()).toBe('<p>abcde</p><p>fghi</p><blockquote><p>jklmnopqrstuvwxyz</p></blockquote>');
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.p);
      kit.et.cursor({clear: true});
      kit.et.marker({action: 'del', slice});
      expect(kit.toHtml()).toBe('<p>abcdefghi</p><blockquote><p>jklmnopqrstuvwxyz</p></blockquote>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
      const slice2 = kit.peritext.savedSlices.each().find((slice) => true)!;
      kit.et.marker({action: 'del', slice: slice2.id});
      expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(0);
    });
  });

  describe('"upd" action', () => {
    describe('type', () => {
      test('can append a tags and remove tags', () => {
        const kit = setup();
        kit.et.cursor({at: [8]});
        kit.et.marker({action: 'ins', type: SliceTypeCon.blockquote});
        expect(kit.toHtml()).toBe('<p>abcdefgh</p><blockquote>ijklmnopqrstuvwxyz</blockquote>');
        kit.et.marker({
          action: 'upd',
          target: 'type',
          ops: [['add', '/-', SliceTypeCon.p]],
        });
        expect(kit.toHtml()).toBe('<p>abcdefgh</p><blockquote><p>ijklmnopqrstuvwxyz</p></blockquote>');
        kit.et.marker({
          action: 'upd',
          target: 'type',
          ops: [['add', '/2', [[SliceTypeCon.ul, 0, {type: 'tasks'}], SliceTypeCon.li]]],
        });
        expect(kit.toHtml()).toBe(
          '<p>abcdefgh</p><blockquote><p><ul data-attr=\'{"type":"tasks"}\'><li>ijklmnopqrstuvwxyz</li></ul></p></blockquote>',
        );
        kit.et.marker({
          action: 'upd',
          target: 'type',
          ops: [['remove', [1]]],
        });
        expect(kit.toHtml()).toBe(
          '<p>abcdefgh</p><blockquote><ul data-attr=\'{"type":"tasks"}\'><li>ijklmnopqrstuvwxyz</li></ul></blockquote>',
        );
        kit.et.marker({
          action: 'upd',
          target: 'type',
          ops: [['remove', '/1', 2]],
        });
        expect(kit.toHtml()).toBe('<p>abcdefgh</p><blockquote>ijklmnopqrstuvwxyz</blockquote>');
      });

      test('handles case when last tag is deleted (delets whole marker)', () => {
        const kit = setup();
        kit.et.cursor({at: [8]});
        kit.et.marker({action: 'ins', type: SliceTypeCon.blockquote});
        expect(kit.toHtml()).toBe('<p>abcdefgh</p><blockquote>ijklmnopqrstuvwxyz</blockquote>');
        kit.et.marker({
          action: 'upd',
          target: 'type',
          ops: [['remove', '/0']],
        });
        expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      });
    });

    describe('tag', () => {
      test('can update tag name', () => {
        const kit = setup();
        kit.et.cursor({at: [8]});
        kit.et.marker({action: 'ins', type: SliceTypeCon.blockquote});
        expect(kit.toHtml()).toBe('<p>abcdefgh</p><blockquote>ijklmnopqrstuvwxyz</blockquote>');
        kit.et.marker({
          action: 'upd',
          target: ['tag', 0],
          ops: [['replace', '/0', SliceTypeCon.p]],
        });
        expect(kit.toHtml()).toBe('<p>abcdefgh</p><p>ijklmnopqrstuvwxyz</p>');
      });

      test('can update discriminant', () => {
        const kit = setup();
        kit.et.cursor({at: [8]});
        kit.et.marker({action: 'ins', type: SliceTypeCon.p});
        expect(kit.toHtml()).toBe('<p>abcdefgh</p><p>ijklmnopqrstuvwxyz</p>');
        const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.p);
        expect(slice?.nestedType().tag(0).discriminant()).toBe(0);
        kit.et.cursor({at: [12]});
        kit.et.marker({
          action: 'upd',
          target: ['tag', 0],
          ops: [['replace', '/1', 1]],
        });
        expect(slice?.nestedType().tag(0).discriminant()).toBe(1);
        slice?.nestedType().tag(0).setDiscriminant(2);
        expect(slice?.nestedType().tag(0).discriminant()).toBe(2);
      });
    });

    describe('data', () => {
      test('can add and update tag data', () => {
        const kit = setup();
        kit.et.cursor({at: [8]});
        kit.et.marker({action: 'ins', type: SliceTypeCon.blockquote});
        expect(kit.toHtml()).toBe('<p>abcdefgh</p><blockquote>ijklmnopqrstuvwxyz</blockquote>');
        kit.et.marker({
          action: 'upd',
          target: ['data', 0],
          ops: [
            ['add', '/author', 'Quasimodo'],
            ['add', '/source', 'Journal of Hunchbacks'],
          ],
        });
        expect(kit.toHtml()).toBe(
          '<p>abcdefgh</p><blockquote data-attr=\'{"author":"Quasimodo","source":"Journal of Hunchbacks"}\'>ijklmnopqrstuvwxyz</blockquote>',
        );
        kit.et.marker({
          action: 'upd',
          target: ['data', 0],
          ops: [
            [
              'merge',
              '',
              {
                author: 'Pierre Gringoire',
                source: 'Journal of Hunchbacks',
              },
            ],
          ],
        });
        expect(kit.toHtml()).toBe(
          '<p>abcdefgh</p><blockquote data-attr=\'{"author":"Pierre Gringoire","source":"Journal of Hunchbacks"}\'>ijklmnopqrstuvwxyz</blockquote>',
        );
      });

      test('can update the correct tag data', () => {
        const kit = setup();
        kit.et.cursor({at: [8]});
        kit.et.marker({action: 'ins', type: [['ul', 0, {type: 'tasks'}], ['li', 0 , {done: false}]]});
        expect(kit.toHtml()).toBe('<p>abcdefgh</p><ul data-attr=\'{"type":"tasks"}\'><li data-attr=\'{"done":false}\'>ijklmnopqrstuvwxyz</li></ul>');
        kit.et.marker({
          action: 'upd',
          target: ['data', 0],
          ops: [
            ['add', '/type', 'ordered'],
          ],
        });
        expect(kit.toHtml()).toBe('<p>abcdefgh</p><ul data-attr=\'{"type":"ordered"}\'><li data-attr=\'{"done":false}\'>ijklmnopqrstuvwxyz</li></ul>');
        kit.et.marker({
          action: 'upd',
          target: ['data', 1],
          ops: [
            ['replace', '/done', true],
          ],
        });
        expect(kit.toHtml()).toBe('<p>abcdefgh</p><ul data-attr=\'{"type":"ordered"}\'><li data-attr=\'{"done":true}\'>ijklmnopqrstuvwxyz</li></ul>');
      });
    });
  });

  describe('scenarios', () => {
    test('on [Enter] in <blockquote> adds new paragraph', async () => {
      const kit = setup();
      kit.et.cursor({at: [5]});
      kit.et.marker({action: 'ins', type: [SliceTypeCon.blockquote, SliceTypeCon.p]});
      kit.peritext.refresh();
      const transfer = createTransfer(kit.peritext);
      const html1 = transfer.toHtml(kit.peritext.rangeAll()!);
      expect(html1).toBe('<p>abcde</p><blockquote><p>fghijklmnopqrstuvwxyz</p></blockquote>');
      expect(kit.peritext.blocks.root.children.length).toBe(2);
      expect(kit.peritext.blocks.root.children[1].children.length).toBe(1);
      kit.et.cursor({at: [10]});
      kit.et.marker({action: 'ins'});
      kit.peritext.refresh();
      expect(kit.peritext.blocks.root.children.length).toBe(2);
      expect(kit.peritext.blocks.root.children[1].children.length).toBe(2);
      const html2 = transfer.toHtml(kit.peritext.rangeAll()!);
      expect(html2).toBe('<p>abcde</p><blockquote><p>fghi</p><p>jklmnopqrstuvwxyz</p></blockquote>');
    });

    test('on [Enter] in empty <blockquote> splits the blockquote', async () => {
      const kit = setup();
      kit.et.cursor({at: [5]});
      kit.et.marker({action: 'ins', type: [SliceTypeCon.blockquote, SliceTypeCon.p]});
      kit.peritext.refresh();
      const transfer = createTransfer(kit.peritext);
      const html1 = transfer.toHtml(kit.peritext.rangeAll()!);
      expect(html1).toBe('<p>abcde</p><blockquote><p>fghijklmnopqrstuvwxyz</p></blockquote>');
      kit.et.cursor({at: [10]});
      kit.et.marker({action: 'ins'});
      kit.peritext.refresh();
      const html2 = transfer.toHtml(kit.peritext.rangeAll()!);
      expect(html2).toBe('<p>abcde</p><blockquote><p>fghi</p><p>jklmnopqrstuvwxyz</p></blockquote>');
      kit.et.marker({action: 'ins'});
      kit.peritext.refresh();
      const html3 = transfer.toHtml(kit.peritext.rangeAll()!);
      expect(html3).toBe(
        '<p>abcde</p><blockquote><p>fghi</p></blockquote><blockquote><p>jklmnopqrstuvwxyz</p></blockquote>',
      );
    });

    test('can split <p> in list, list item <li> and create two adjacent lists', async () => {
      const kit = setup();
      kit.et.cursor({at: [3]});
      kit.et.marker({action: 'ins', type: [SliceTypeCon.ul, SliceTypeCon.li, SliceTypeCon.p]});
      kit.peritext.refresh();
      const transfer = createTransfer(kit.peritext);
      const html1 = transfer.toHtml(kit.peritext.rangeAll()!);
      expect(html1).toBe('<p>abc</p><ul><li><p>defghijklmnopqrstuvwxyz</p></li></ul>');
      kit.et.cursor({at: [12]});
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

    test('can consecutively split two nested lists with a blockquote', async () => {
      const kit = setup();
      kit.et.cursor({at: [7]});
      kit.et.marker({
        action: 'ins',
        type: [
          SliceTypeCon.ul,
          SliceTypeCon.li,
          SliceTypeCon.ul,
          SliceTypeCon.li,
          SliceTypeCon.blockquote,
          SliceTypeCon.p,
        ],
      });
      kit.peritext.refresh();
      const transfer = createTransfer(kit.peritext);
      const html1 = transfer.toHtml(kit.peritext.rangeAll()!);
      expect(html1).toBe(
        '<p>abcdefg</p><ul><li><ul><li><blockquote><p>hijklmnopqrstuvwxyz</p></blockquote></li></ul></li></ul>',
      );
      kit.et.cursor({at: [15]});
      const pressEnter = (): string => {
        kit.et.marker({action: 'ins'});
        kit.peritext.refresh();
        const html = transfer.toHtml(kit.peritext.rangeAll()!);
        return html;
      };
      expect(pressEnter()).toBe(
        '<p>abcdefg</p><ul><li><ul><li><blockquote><p>hijklmn</p><p>opqrstuvwxyz</p></blockquote></li></ul></li></ul>',
      );
      expect(pressEnter()).toBe(
        '<p>abcdefg</p><ul><li><ul><li><blockquote><p>hijklmn</p></blockquote><blockquote><p>opqrstuvwxyz</p></blockquote></li></ul></li></ul>',
      );
      expect(pressEnter()).toBe(
        '<p>abcdefg</p><ul><li><ul><li><blockquote><p>hijklmn</p></blockquote></li><li><blockquote><p>opqrstuvwxyz</p></blockquote></li></ul></li></ul>',
      );
      expect(pressEnter()).toBe(
        '<p>abcdefg</p><ul><li><ul><li><blockquote><p>hijklmn</p></blockquote></li></ul><ul><li><blockquote><p>opqrstuvwxyz</p></blockquote></li></ul></li></ul>',
      );
      expect(pressEnter()).toBe(
        '<p>abcdefg</p><ul><li><ul><li><blockquote><p>hijklmn</p></blockquote></li></ul></li><li><ul><li><blockquote><p>opqrstuvwxyz</p></blockquote></li></ul></li></ul>',
      );
      expect(pressEnter()).toBe(
        '<p>abcdefg</p><ul><li><ul><li><blockquote><p>hijklmn</p></blockquote></li></ul></li></ul><ul><li><ul><li><blockquote><p>opqrstuvwxyz</p></blockquote></li></ul></li></ul>',
      );
      expect(pressEnter()).toBe(
        '<p>abcdefg</p><ul><li><ul><li><blockquote><p>hijklmn</p></blockquote></li></ul></li></ul><ul><li><ul><li><blockquote><p /><p>opqrstuvwxyz</p></blockquote></li></ul></li></ul>',
      );
    });
  });
};

describe('"marker" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
