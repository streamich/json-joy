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
    expect(view()).toMatchSnapshot();
  });

  test('can annotate beginning of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(0, 3);
    editor.saved.insOne('BOLD');
    expect(view()).toMatchSnapshot();
  });

  test('can annotate middle of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(3, 3);
    editor.saved.insOne('BOLD');
    expect(view()).toMatchSnapshot();
  });

  test('can annotate end of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(7, 3);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchSnapshot();
  });

  test('can annotate two regions', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(1, 2);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(5, 3);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchSnapshot();
  });

  test('can annotate two adjacent regions', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(0, 2);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(2, 3);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchSnapshot();
  });

  test('can annotate two adjacent regions at the end of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(5, 2);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(7, 3);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchSnapshot();
  });

  test('can annotate overlapping regions at the beginning of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(0, 2);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(1, 2);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchSnapshot();
  });

  test('can annotate overlapping regions in the middle of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(4, 2);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(5, 2);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchSnapshot();
  });

  test('can annotate a contained region at the beginning of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(0, 5);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(1, 2);
    editor.saved.insOne('ITALIC');
    expect(view()).toMatchSnapshot();
  });

  test('can annotate twice contained region in the middle of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(4, 5);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(5, 3);
    editor.saved.insOne('ITALIC');
    editor.cursor.setAt(6, 1);
    editor.saved.insOne('UNDERLINE');
    expect(view()).toMatchSnapshot();
  });

  test('can annotate twice contained region at the end of text', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(5, 5);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(6, 3);
    editor.saved.insOne('ITALIC');
    editor.cursor.setAt(7, 1);
    editor.saved.insOne('UNDERLINE');
    expect(view()).toMatchSnapshot();
  });

  test('can annotate three intermingled regions', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(2, 6);
    editor.saved.insOne('BOLD');
    editor.cursor.setAt(1, 5);
    editor.saved.insOne('ITALIC');
    editor.cursor.setAt(4, 5);
    editor.saved.insOne('UNDERLINE');
    expect(view()).toMatchSnapshot();
  });

  test('can insert zero length slice', () => {
    const {editor, view} = setup();
    editor.cursor.setAt(2, 0);
    editor.saved.insOne('CURSOR');
    expect(view()).toMatchSnapshot();
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
