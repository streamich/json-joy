import {render} from './render';
import {
  Kit,
  setupNumbersKit,
  setupNumbersWithMultipleChunksAndDeletesKit,
  setupNumbersWithRgaSplitKit,
  setupNumbersWithTombstonesKit,
  setupNumbersWithTwoChunksKit,
} from './setup';

const runTests = (_setup: () => Kit) => {
  const setup = () => {
    const kit = _setup();
    const view = () => {
      kit.peritext.editor.delCursors();
      kit.peritext.refresh();
      return render(kit.peritext.blocks.root);
    };
    return {...kit, view};
  };

  test('renders plain text', () => {
    const {view} = setup();
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "0123456789" {  }
"
`);
  });

  test('can annotate beginning of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(0, 3);
    editor.saved.insOverwrite('BOLD');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "" {  }
    "012" { BOLD = [ 1, 3 ] }
    "3456789" {  }
"
`);
  });

  test('can annotate middle of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(3, 3);
    editor.saved.insOverwrite('BOLD');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "012" {  }
    "345" { BOLD = [ 1, 3 ] }
    "6789" {  }
"
`);
  });

  test('can annotate end of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(7, 3);
    editor.saved.insOverwrite('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "0123456" {  }
    "789" { ITALIC = [ 1, 3 ] }
    "" {  }
"
`);
  });

  test('can annotate two regions', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(1, 2);
    editor.saved.insOverwrite('BOLD');
    editor.cursor.setAt(5, 3);
    editor.saved.insOverwrite('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "0" {  }
    "12" { BOLD = [ 1, 3 ] }
    "34" {  }
    "567" { ITALIC = [ 1, 3 ] }
    "89" {  }
"
`);
  });

  test('can annotate two adjacent regions', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(0, 2);
    editor.saved.insOverwrite('BOLD');
    editor.cursor.setAt(2, 3);
    editor.saved.insOverwrite('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "" {  }
    "01" { BOLD = [ 1, 3 ] }
    "" {  }
    "234" { ITALIC = [ 1, 3 ] }
    "56789" {  }
"
`);
  });

  test('can annotate two adjacent regions at the end of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(5, 2);
    editor.saved.insOverwrite('BOLD');
    editor.cursor.setAt(7, 3);
    editor.saved.insOverwrite('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "01234" {  }
    "56" { BOLD = [ 1, 3 ] }
    "" {  }
    "789" { ITALIC = [ 1, 3 ] }
    "" {  }
"
`);
  });

  test('can annotate overlapping regions at the beginning of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(0, 2);
    editor.saved.insOverwrite('BOLD');
    editor.cursor.setAt(1, 2);
    editor.saved.insOverwrite('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "" {  }
    "0" { BOLD = [ 1, 1 ] }
    "1" { BOLD = [ 1, 2 ], ITALIC = [ 1, 1 ] }
    "2" { ITALIC = [ 1, 2 ] }
    "3456789" {  }
"
`);
  });

  test('can annotate overlapping regions in the middle of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(4, 2);
    editor.saved.insOverwrite('BOLD');
    editor.cursor.setAt(5, 2);
    editor.saved.insOverwrite('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "0123" {  }
    "4" { BOLD = [ 1, 1 ] }
    "5" { BOLD = [ 1, 2 ], ITALIC = [ 1, 1 ] }
    "6" { ITALIC = [ 1, 2 ] }
    "789" {  }
"
`);
  });

  test('can annotate a contained region at the beginning of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(0, 5);
    editor.saved.insOverwrite('BOLD');
    editor.cursor.setAt(1, 2);
    editor.saved.insOverwrite('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "" {  }
    "0" { BOLD = [ 1, 1 ] }
    "12" { BOLD = [ 1, 0 ], ITALIC = [ 1, 3 ] }
    "34" { BOLD = [ 1, 2 ] }
    "56789" {  }
"
`);
  });

  test('can annotate twice contained region in the middle of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(4, 5);
    editor.saved.insOverwrite('BOLD');
    editor.cursor.setAt(5, 3);
    editor.saved.insOverwrite('ITALIC');
    editor.cursor.setAt(6, 1);
    editor.saved.insOverwrite('UNDERLINE');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "0123" {  }
    "4" { BOLD = [ 1, 1 ] }
    "5" { BOLD = [ 1, 0 ], ITALIC = [ 1, 1 ] }
    "6" { BOLD = [ 1, 0 ], ITALIC = [ 1, 0 ], UNDERLINE = [ 1, 3 ] }
    "7" { BOLD = [ 1, 0 ], ITALIC = [ 1, 2 ] }
    "8" { BOLD = [ 1, 2 ] }
    "9" {  }
"
`);
  });

  test('can annotate twice contained region at the end of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(5, 5);
    editor.saved.insOverwrite('BOLD');
    editor.cursor.setAt(6, 3);
    editor.saved.insOverwrite('ITALIC');
    editor.cursor.setAt(7, 1);
    editor.saved.insOverwrite('UNDERLINE');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "01234" {  }
    "5" { BOLD = [ 1, 1 ] }
    "6" { BOLD = [ 1, 0 ], ITALIC = [ 1, 1 ] }
    "7" { BOLD = [ 1, 0 ], ITALIC = [ 1, 0 ], UNDERLINE = [ 1, 3 ] }
    "8" { BOLD = [ 1, 0 ], ITALIC = [ 1, 2 ] }
    "9" { BOLD = [ 1, 2 ] }
    "" {  }
"
`);
  });

  test('can annotate three intermingled regions', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(2, 6);
    editor.saved.insOverwrite('BOLD');
    editor.cursor.setAt(1, 5);
    editor.saved.insOverwrite('ITALIC');
    editor.cursor.setAt(4, 5);
    editor.saved.insOverwrite('UNDERLINE');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "0" {  }
    "1" { ITALIC = [ 1, 1 ] }
    "23" { BOLD = [ 1, 1 ], ITALIC = [ 1, 0 ] }
    "45" { BOLD = [ 1, 0 ], ITALIC = [ 1, 2 ], UNDERLINE = [ 1, 1 ] }
    "67" { BOLD = [ 1, 2 ], UNDERLINE = [ 1, 0 ] }
    "8" { UNDERLINE = [ 1, 2 ] }
    "9" {  }
"
`);
  });

  test('can insert zero length slice', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(2, 0);
    editor.saved.insOverwrite('CURSOR');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "01" {  }
    "23456789" { CURSOR = [ 1, 4 ] }
"
`);
  });
};

describe('numbers "0123456789", no edits', () => {
  runTests(setupNumbersKit);
});

describe('numbers "0123456789", with default schema and tombstones', () => {
  runTests(setupNumbersWithTombstonesKit);
});

describe('numbers "0123456789", two RGA chunks', () => {
  runTests(setupNumbersWithTwoChunksKit);
});

describe('numbers "0123456789", with RGA split', () => {
  runTests(setupNumbersWithRgaSplitKit);
});

describe('numbers "0123456789", with multiple deletes', () => {
  runTests(setupNumbersWithMultipleChunksAndDeletesKit);
});
