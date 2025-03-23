import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import {SliceTypeCon} from '../../slice/constants';
import {create} from '../../transfer/create';

const runTests = (setup: () => Kit) => {
  test('can join two blockquotes', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(3);
    editor.saved.insMarker([SliceTypeCon.blockquote, SliceTypeCon.p]);
    editor.cursor.setAt(7);
    editor.saved.insMarker([[SliceTypeCon.blockquote, 1], SliceTypeCon.p]);
    peritext.refresh();
    const transfer = create(peritext);
    const html1 = transfer.toHtml(peritext.rangeAll()!);
    expect(html1).toBe(
      '<p>abc</p><blockquote><p>def</p></blockquote><blockquote><p>ghijklmnopqrstuvwxyz</p></blockquote>',
    );
    editor.cursor.setAt(10);
    editor.setBlockType(editor.cursor.start, [SliceTypeCon.blockquote, SliceTypeCon.p]);
    peritext.refresh();
    const html2 = transfer.toHtml(peritext.rangeAll()!);
    expect(html2).toBe('<p>abc</p><blockquote><p>def</p><p>ghijklmnopqrstuvwxyz</p></blockquote>');
  });

  test('can split two blockquotes', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(3);
    editor.saved.insMarker([SliceTypeCon.blockquote, SliceTypeCon.p]);
    editor.cursor.setAt(7);
    editor.saved.insMarker([SliceTypeCon.blockquote, SliceTypeCon.p]);
    peritext.refresh();
    const transfer = create(peritext);
    const html1 = transfer.toHtml(peritext.rangeAll()!);
    expect(html1).toBe('<p>abc</p><blockquote><p>def</p><p>ghijklmnopqrstuvwxyz</p></blockquote>');
    const point = peritext.pointAt(10);
    editor.setBlockType(point, [[SliceTypeCon.blockquote, 1], SliceTypeCon.p]);
    peritext.refresh();
    const html2 = transfer.toHtml(peritext.rangeAll()!);
    expect(html2).toBe(
      '<p>abc</p><blockquote><p>def</p></blockquote><blockquote><p>ghijklmnopqrstuvwxyz</p></blockquote>',
    );
  });
};

runAlphabetKitTestSuite(runTests);
