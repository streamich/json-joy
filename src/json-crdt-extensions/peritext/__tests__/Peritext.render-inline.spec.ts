import {render} from './render';
import {
  type Kit,
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
    editor.saved.insOne('BOLD');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "" {  }
    "012" { BOLD = [ !u ] }
    "3456789" {  }
"
`);
  });

  test('can annotate middle of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(3, 3);
    editor.saved.insOne('BOLD');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "012" {  }
    "345" { BOLD = [ !u ] }
    "6789" {  }
"
`);
  });

  test('can annotate end of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(7, 3);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "0123456" {  }
    "789" { ITALIC = [ !u ] }
    "" {  }
"
`);
  });

  test('can annotate two regions', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(1, 2);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(5, 3);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "0" {  }
    "12" { BOLD = [ !u ] }
    "34" {  }
    "567" { ITALIC = [ !u ] }
    "89" {  }
"
`);
  });

  test('can annotate two adjacent regions', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(0, 2);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(2, 3);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "" {  }
    "01" { BOLD = [ !u ] }
    "" {  }
    "234" { ITALIC = [ !u ] }
    "56789" {  }
"
`);
  });

  test('can annotate two adjacent regions at the end of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(5, 2);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(7, 3);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "01234" {  }
    "56" { BOLD = [ !u ] }
    "" {  }
    "789" { ITALIC = [ !u ] }
    "" {  }
"
`);
  });

  test('can annotate overlapping regions at the beginning of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(0, 2);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(1, 2);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "" {  }
    "0" { BOLD = [ !u ] }
    "1" { BOLD = [ !u ], ITALIC = [ !u ] }
    "2" { ITALIC = [ !u ] }
    "3456789" {  }
"
`);
  });

  test('can annotate overlapping regions in the middle of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(4, 2);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(5, 2);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "0123" {  }
    "4" { BOLD = [ !u ] }
    "5" { BOLD = [ !u ], ITALIC = [ !u ] }
    "6" { ITALIC = [ !u ] }
    "789" {  }
"
`);
  });

  test('can annotate a contained region at the beginning of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(0, 5);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(1, 2);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "" {  }
    "0" { BOLD = [ !u ] }
    "12" { BOLD = [ !u ], ITALIC = [ !u ] }
    "34" { BOLD = [ !u ] }
    "56789" {  }
"
`);
  });

  test('can annotate twice contained region in the middle of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(4, 5);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(5, 3);
    editor.saved.insOne('ITALIC');
    editor.cursor.setAt(6, 1);
    editor.saved.insOne('UNDERLINE');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "0123" {  }
    "4" { BOLD = [ !u ] }
    "5" { BOLD = [ !u ], ITALIC = [ !u ] }
    "6" { BOLD = [ !u ], ITALIC = [ !u ], UNDERLINE = [ !u ] }
    "7" { BOLD = [ !u ], ITALIC = [ !u ] }
    "8" { BOLD = [ !u ] }
    "9" {  }
"
`);
  });

  test('can annotate twice contained region at the end of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(5, 5);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(6, 3);
    editor.saved.insOne('ITALIC');
    editor.cursor.setAt(7, 1);
    editor.saved.insOne('UNDERLINE');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "01234" {  }
    "5" { BOLD = [ !u ] }
    "6" { BOLD = [ !u ], ITALIC = [ !u ] }
    "7" { BOLD = [ !u ], ITALIC = [ !u ], UNDERLINE = [ !u ] }
    "8" { BOLD = [ !u ], ITALIC = [ !u ] }
    "9" { BOLD = [ !u ] }
    "" {  }
"
`);
  });

  test('can annotate three intermingled regions', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(2, 6);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(1, 5);
    editor.saved.insOne('ITALIC');
    editor.cursor.setAt(4, 5);
    editor.saved.insOne('UNDERLINE');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "0" {  }
    "1" { ITALIC = [ !u ] }
    "23" { BOLD = [ !u ], ITALIC = [ !u ] }
    "45" { BOLD = [ !u ], ITALIC = [ !u ], UNDERLINE = [ !u ] }
    "67" { BOLD = [ !u ], UNDERLINE = [ !u ] }
    "8" { UNDERLINE = [ !u ] }
    "9" {  }
"
`);
  });

  test('can insert zero length slice', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(2, 0);
    editor.saved.insOne('CURSOR');
    expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "01" {  }
    "23456789" { CURSOR = [ !u ] }
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
