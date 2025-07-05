import {Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import * as htmlExport from '../export-html';
import * as htmlImport from '../import-html';
import * as mdExport from '../export-markdown';
import * as mdImport from '../import-markdown';
import {PeritextDataTransfer} from '../PeritextDataTransfer';
import {SliceTypeCon} from '../../slice/constants';

const testSuite = (setupKit: () => Kit) => {
  const setup = () => {
    const kit = setupKit();
    const transfer = new PeritextDataTransfer(kit.peritext, {
      htmlExport,
      htmlImport,
      mdExport,
      mdImport,
    });
    const toHtml = () => {
      kit.peritext.refresh();
      return transfer.toHtml(kit.peritext.rangeAll()!);
    };
    return {...kit, transfer, toHtml};
  };

  test('a single paragraph', () => {
    const {peritext, toHtml} = setup();
    peritext.refresh();
    expect(toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
  });

  test('can discriminate <blockquote> tags', () => {
    const {peritext, editor, toHtml} = setup();
    editor.cursor.setAt(8);
    editor.saved.insMarker([[SliceTypeCon.blockquote, 0], SliceTypeCon.p]);
    editor.cursor.setAt(4);
    editor.saved.insMarker([[SliceTypeCon.blockquote, 1], SliceTypeCon.p]);
    peritext.refresh();
    expect(toHtml()).toBe('<p>abcd</p><blockquote><p>efgh</p></blockquote><blockquote><p>ijklmnopqrstuvwxyz</p></blockquote>');
  });

  test('can discriminate <blockquote> tags - implicit 0 discriminant', () => {
    const {peritext, editor, toHtml} = setup();
    editor.cursor.setAt(8);
    editor.saved.insMarker([[SliceTypeCon.blockquote] as any, SliceTypeCon.p]);
    editor.cursor.setAt(4);
    editor.saved.insMarker([[SliceTypeCon.blockquote, 1], SliceTypeCon.p]);
    peritext.refresh();
    expect(toHtml()).toBe('<p>abcd</p><blockquote><p>efgh</p></blockquote><blockquote><p>ijklmnopqrstuvwxyz</p></blockquote>');
  });

  test('can discriminate <blockquote> tags - implicit 0 discriminant - 2', () => {
    const {peritext, editor, toHtml} = setup();
    editor.cursor.setAt(8);
    editor.saved.insMarker([SliceTypeCon.blockquote, SliceTypeCon.p]);
    editor.cursor.setAt(4);
    editor.saved.insMarker([[SliceTypeCon.blockquote, 1], SliceTypeCon.p]);
    peritext.refresh();
    expect(toHtml()).toBe('<p>abcd</p><blockquote><p>efgh</p></blockquote><blockquote><p>ijklmnopqrstuvwxyz</p></blockquote>');
  });

  test('outputs nested block data', () => {
    const {peritext, editor, toHtml} = setup();
    editor.cursor.setAt(8);
    editor.saved.insMarker([[SliceTypeCon.blockquote, 0, {author: 'Mark Twain'}], [SliceTypeCon.p, 0, {indent: 1}]]);
    peritext.refresh();
    expect(toHtml()).toBe('<p>abcdefgh</p><blockquote data-attr=\'{"author":"Mark Twain"}\'><p data-attr=\'{"indent":1}\'>ijklmnopqrstuvwxyz</p></blockquote>');
  });
};

describe('HTML export', () => {
  runAlphabetKitTestSuite(testSuite);
});
