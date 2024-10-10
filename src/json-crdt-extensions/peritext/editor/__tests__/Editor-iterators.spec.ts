import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Editor} from '../Editor';

const setup = (
  insertText = (editor: Editor) => {
    editor.insert('abcd');
    editor.cursor.setAt(2);
    editor.insert('0123');
    editor.cursor.setAt(7);
    editor.insert('4567');
    editor.cursor.setAt(0, 2);
    editor.delBwd();
    editor.cursor.setAt(9, 1);
    editor.delBwd();
    editor.cursor.setAt(4, 1);
    editor.delBwd();
  },
) => {
  const model = Model.create(void 0, 858549494849333);
  model.api.root({
    text: '',
    slices: [],
  });
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  const editor = peritext.editor;
  insertText(editor);
  return {model, peritext, editor};
};

describe('.fwd1()', () => {
  test('can use string root as initial point', () => {
    const {peritext, editor} = setup();
    const iterator = editor.fwd1(peritext.str.id);
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('01234567');
  });

  test('can iterate through the entire string', () => {
    const {peritext, editor} = setup();
    const start = peritext.pointStart()!;
    const iterator = editor.fwd1(start.id);
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('01234567');
  });

  test('can iterate through the entire string, starting from ABS start', () => {
    const {peritext, editor} = setup();
    const start = peritext.pointAbsStart()!;
    const iterator = editor.fwd1(start.id);
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('01234567');
  });

  test('can iterate through the entire string, with initial chunk provided', () => {
    const {peritext, editor} = setup();
    const start = peritext.pointStart()!;
    const iterator = editor.fwd1(start.id, start.chunk());
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('01234567');
  });

  test('can iterate starting in the middle of first chunk', () => {
    const {peritext, editor} = setup();
    const start = peritext.pointAt(2);
    const iterator = editor.fwd1(start.id);
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('234567');
  });

  test('can iterate starting in the middle of first chunk, with initial chunk provided', () => {
    const {peritext, editor} = setup();
    const start = peritext.pointAt(2);
    const iterator = editor.fwd1(start.id, start.chunk());
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('234567');
  });

  test('can iterate starting in the middle of second chunk', () => {
    const {peritext, editor} = setup();
    const start = peritext.pointAt(6);
    const iterator = editor.fwd1(start.id);
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('67');
  });

  test('can iterate starting in the middle of second chunk, with initial chunk provided', () => {
    const {peritext, editor} = setup();
    const start = peritext.pointAt(6);
    const iterator = editor.fwd1(start.id, start.chunk());
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('67');
  });

  test('returns true for block split chars', () => {
    const {peritext, editor} = setup((editor) => {
      editor.insert('ab');
      editor.cursor.setAt(1);
      editor.saved.insMarker('p');
    });
    peritext.overlay.refresh();
    const start = peritext.pointAt(0);
    const iterator = editor.fwd1(start.id, start.chunk());
    let str = '';
    const bools: boolean[] = [];
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
      bools.push(peritext.overlay.isMarker(res.id()));
    }
    expect(str).toBe('a\nb');
    expect(bools).toStrictEqual([false, true, false]);
  });
});

describe('.bwd1()', () => {
  test('can use string root as initial point', () => {
    const {peritext, editor} = setup();
    const iterator = editor.bwd1(peritext.str.id);
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('76543210');
  });

  test('can iterate through the entire string', () => {
    const {peritext, editor} = setup();
    const end = peritext.pointEnd()!;
    const iterator = editor.bwd1(end.id);
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('76543210');
  });

  test('can iterate through the entire string, starting from ABS end', () => {
    const {peritext, editor} = setup();
    const end = peritext.pointAbsEnd()!;
    const iterator = editor.bwd1(end.id);
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('76543210');
  });

  test('can iterate through the entire string, with initial chunk provided', () => {
    const {peritext, editor} = setup();
    const end = peritext.pointEnd()!;
    const iterator = editor.bwd1(end.id, end.chunk());
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('76543210');
  });

  test('can iterate starting in the middle of first chunk', () => {
    const {peritext, editor} = setup();
    const end = peritext.pointAt(2);
    const iterator = editor.bwd1(end.id);
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('210');
  });

  test('can iterate starting in the middle of first chunk, with initial chunk provided', () => {
    const {peritext, editor} = setup();
    const end = peritext.pointAt(2);
    const iterator = editor.bwd1(end.id, end.chunk());
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('210');
  });

  test('can iterate starting in the middle of second chunk', () => {
    const {peritext, editor} = setup();
    const end = peritext.pointAt(6);
    const iterator = editor.bwd1(end.id);
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('6543210');
  });

  test('can iterate starting in the middle of second chunk, with initial chunk provided', () => {
    const {peritext, editor} = setup();
    const end = peritext.pointAt(6);
    const iterator = editor.bwd1(end.id, end.chunk());
    let str = '';
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
    }
    expect(str).toBe('6543210');
  });

  test('returns true for block split chars', () => {
    const {peritext, editor} = setup((editor) => {
      editor.insert('ab');
      editor.cursor.setAt(1);
      editor.saved.insMarker('p');
    });
    peritext.overlay.refresh();
    const start = peritext.pointAt(3);
    const iterator = editor.bwd1(start.id, start.chunk());
    let str = '';
    const bools: boolean[] = [];
    while (1) {
      const res = iterator();
      if (!res) break;
      str += res.view();
      bools.push(peritext.overlay.isMarker(res.id()));
    }
    expect(str).toBe('b\na');
    expect(bools).toStrictEqual([false, true, false]);
  });
});

