import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Kit, runAlphabetKitTestSuite, setupAlphabetChunkSplitKit, setupAlphabetKit, setupAlphabetWithDeletesKit, setupAlphabetWithTwoChunksKit, setupAlphabetWrittenInReverse, setupAlphabetWrittenInReverseWithDeletes} from '../../__tests__/setup';
import {Point} from '../../rga/Point';
import {Anchor} from '../../rga/constants';
import {Editor} from '../Editor';

const runTestsWithAlphabetKit = (setup: () => Kit) => {
  describe('one character movements', () => {
    test('move start to end one char at-a-time', () => {
      const {editor} = setup();
      editor.cursor.setAt(0);
      expect(editor.cursor.start.viewPos()).toBe(0);
      expect(editor.cursor.end.viewPos()).toBe(0);
      editor.cursor.end.step(1);
      editor.cursor.set(editor.cursor.end);
      expect(editor.cursor.start.viewPos()).toBe(1);
      expect(editor.cursor.end.viewPos()).toBe(1);
      editor.cursor.end.step(1);
      editor.cursor.set(editor.cursor.end);
      expect(editor.cursor.start.viewPos()).toBe(2);
      expect(editor.cursor.end.viewPos()).toBe(2);
      editor.cursor.end.step(1);
      editor.cursor.set(editor.cursor.end);
      expect(editor.cursor.start.viewPos()).toBe(3);
      expect(editor.cursor.end.viewPos()).toBe(3);
      editor.cursor.end.step(33);
      editor.cursor.set(editor.cursor.end);
      expect(editor.cursor.start.viewPos()).toBe(26);
      expect(editor.cursor.end.viewPos()).toBe(26);
    });

    test('move end to start one char at-a-time', () => {
      const {editor} = setup();
      editor.cursor.set(editor.end()!);
      expect(editor.cursor.start.viewPos()).toBe(26);
      expect(editor.cursor.end.viewPos()).toBe(26);
      editor.cursor.end.step(1);
      editor.cursor.end.step(-1);
      editor.cursor.set(editor.cursor.end);
      expect(editor.cursor.start.viewPos()).toBe(25);
      expect(editor.cursor.end.viewPos()).toBe(25);
      editor.cursor.end.step(1);
      editor.cursor.end.step(-2);
      editor.cursor.set(editor.cursor.end);
      expect(editor.cursor.start.viewPos()).toBe(24);
      expect(editor.cursor.end.viewPos()).toBe(24);
      editor.cursor.end.step(-33);
      editor.cursor.set(editor.cursor.end);
      expect(editor.cursor.start.viewPos()).toBe(0);
      expect(editor.cursor.end.viewPos()).toBe(0);
      editor.cursor.end.step(-1);
      editor.cursor.set(editor.cursor.end);
      expect(editor.cursor.start.viewPos()).toBe(0);
      expect(editor.cursor.end.viewPos()).toBe(0);
      editor.cursor.end.step(-2);
      editor.cursor.set(editor.cursor.end);
      expect(editor.cursor.start.viewPos()).toBe(0);
      expect(editor.cursor.end.viewPos()).toBe(0);
      editor.cursor.end.step(-5);
      editor.cursor.set(editor.cursor.end);
      expect(editor.cursor.start.viewPos()).toBe(0);
      expect(editor.cursor.end.viewPos()).toBe(0);
    });
  });

  describe('.fwd()', () => {
    test('can use string root as initial point', () => {
      const {peritext, editor} = setup();
      const iterator = editor.fwd(peritext.pointAbsStart());
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe(peritext.str.view());
    });
  
    test('can iterate through the entire string', () => {
      const {peritext, editor} = setup();
      const start = peritext.pointStart()!;
      const iterator = editor.fwd(start);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe(peritext.str.view());
    });
  
    test('can iterate through the entire string, starting from ABS start', () => {
      const {peritext, editor} = setup();
      const start = peritext.pointAbsStart()!;
      const iterator = editor.fwd(start);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe(peritext.str.view());
    });
  
    test('can iterate through the entire string, with initial chunk provided', () => {
      const {peritext, editor} = setup();
      const start = peritext.pointStart()!;
      const iterator = editor.fwd(start);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe(peritext.str.view());
    });
  
    test('can iterate starting at an offset', () => {
      const {peritext, editor} = setup();
      const start = peritext.pointAt(2);
      const iterator = editor.fwd(start);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe((peritext.str.view() as string).slice(2));
    });
  
    test('can iterate starting in the middle of second chunk - 2', () => {
      const {peritext, editor} = setup();
      const start = peritext.pointAt(6);
      const iterator = editor.fwd(start);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe((peritext.str.view() as string).slice(6));
    });
  
    test('.isMarker() returns true for block split chars', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker('p');
      peritext.overlay.refresh();
      const start = peritext.pointAt(0);
      const iterator = editor.fwd(start);
      let str = '';
      const bools: boolean[] = [];
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
        bools.push(peritext.overlay.isMarker(res.id()));
      }
      expect(str).toBe(peritext.str.view());
      const res = bools.map((b, i) => b ? (peritext.str.view() as string)[i] : '').filter(Boolean).join('');
      expect(res).toBe('\n');
    });
  });

  describe('.bwd()', () => {
    test('can use string root as initial point', () => {
      const {peritext, editor} = setup();
      const iterator = editor.bwd(peritext.pointAbsEnd());
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe('zyxwvutsrqponmlkjihgfedcba');
    });
  
    test('can iterate through the entire string', () => {
      const {peritext, editor} = setup();
      const end = peritext.pointEnd()!;
      const iterator = editor.bwd(end);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe('zyxwvutsrqponmlkjihgfedcba');
    });
  
    test('can iterate through the entire string, starting from ABS end', () => {
      const {peritext, editor} = setup();
      const end = peritext.pointAbsEnd()!;
      const iterator = editor.bwd(end);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe('zyxwvutsrqponmlkjihgfedcba');
    });
  
    test('can iterate through the entire string, with initial chunk provided', () => {
      const {peritext, editor} = setup();
      const end = peritext.pointEnd()!;
      const iterator = editor.bwd(end);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe('zyxwvutsrqponmlkjihgfedcba');
    });
  
    test('can iterate starting in the middle of first chunk', () => {
      const {peritext, editor} = setup();
      const point = peritext.pointAt(2);
      const iterator = editor.bwd(point);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe('ba');
    });
  
    test('can iterate starting in the middle of first chunk, with initial chunk provided', () => {
      const {peritext, editor} = setup();
      const point = peritext.pointAt(2);
      const iterator = editor.bwd(point);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe('ba');
    });
  
    test('can iterate starting in the middle of second chunk', () => {
      const {peritext, editor} = setup();
      const point = peritext.pointAt(6);
      const iterator = editor.bwd(point);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe('fedcba');
    });
  
    test('can iterate starting in the middle of second chunk, with initial chunk provided', () => {
      const {peritext, editor} = setup();
      const point = peritext.pointAt(6);
      const iterator = editor.bwd(point);
      let str = '';
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe('fedcba');
    });
  
    test('returns true for block split chars', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(14);
      editor.saved.insMarker('p');
      peritext.overlay.refresh();
      const start = peritext.pointAt(17);
      const iterator = editor.bwd(start);
      let str = '';
      const bools: boolean[] = [];
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
        bools.push(peritext.overlay.isMarker(res.id()));
      }
      expect(str).toBe('po\nnmlkjihgfedcba');
      const res = bools.map((b, i) => b ? 'po\nnmlkjihgfedcba'[i] : '').filter(Boolean).join('');
      expect(res).toBe('\n');
    });
  });  
};

runAlphabetKitTestSuite(runTestsWithAlphabetKit);

const setup = (insert = (editor: Editor) => editor.insert('Hello world!'), sid?: number) => {
  const model = Model.create(void 0, sid);
  model.api.root({
    text: '',
    slices: [],
  });
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  const editor = peritext.editor;
  insert(editor);
  return {model, peritext, editor};
};

describe('.eow()', () => {
  test('can go to the end of a word', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(0);
    const point = editor.eow(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe('Hello');
  });

  test('can skip whitespace between words', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(5);
    const point = editor.eow(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe(' world');
  });

  test('skipping stops before exclamation mark', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(6);
    const point = editor.eow(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe('world');
  });

  test('can skip to the end of string', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(11);
    const point = editor.eow(editor.cursor.end);
    expect(point instanceof Point).toBe(true);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe('!');
  });

  test('can skip various character classes', () => {
    const {editor} = setup((editor) =>
      editor.insert("const {editor} = setup(editor => editor.insert('Hello world!'));"),
    );
    editor.cursor.setAt(0);
    const move = (): string => {
      const point = editor.eow(editor.cursor.end);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(move()).toBe('const');
    expect(move()).toBe('const {editor');
    expect(move()).toBe('const {editor} = setup');
    expect(move()).toBe('const {editor} = setup(editor');
    expect(move()).toBe('const {editor} = setup(editor => editor');
    expect(move()).toBe('const {editor} = setup(editor => editor.insert');
    expect(move()).toBe("const {editor} = setup(editor => editor.insert('Hello");
    expect(move()).toBe("const {editor} = setup(editor => editor.insert('Hello world");
    expect(move()).toBe("const {editor} = setup(editor => editor.insert('Hello world!'));");
  });

  test('can select a character', () => {
    const {editor, peritext} = setup((editor) => editor.insert('x a x'));
    const point1 = peritext.pointAt(2);
    const point2 = editor.eow(point1);
    expect(point1.id.sid).toBe(point2!.id.sid);
    expect(point1.id.time).toBe(point2!.id.time);
    expect(point1.anchor).toBe(Anchor.Before);
    expect(point2.anchor).toBe(Anchor.After);
  });
});

describe('.bow()', () => {
  test('can skip over simple text.', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(editor.txt.str.length());
    const move = (): string => {
      const point = editor.bow(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(move()).toBe('baz');
    expect(move()).toBe('bar baz');
    expect(move()).toBe('foo bar baz');
    expect(move()).toBe('world!\nfoo bar baz');
    expect(move()).toBe('Hello world!\nfoo bar baz');
  });

  test('can skip various character classes', () => {
    const {editor} = setup((editor) =>
      editor.insert("const {editor} = setup(editor => editor.insert('Hello world!'));"),
    );
    editor.cursor.setAt(editor.txt.str.length());
    const move = (): string => {
      const point = editor.bow(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(move()).toBe("world!'));");
    expect(move()).toBe("Hello world!'));");
    expect(move()).toBe("insert('Hello world!'));");
    expect(move()).toBe("editor.insert('Hello world!'));");
    expect(move()).toBe("editor => editor.insert('Hello world!'));");
    expect(move()).toBe("setup(editor => editor.insert('Hello world!'));");
    expect(move()).toBe("editor} = setup(editor => editor.insert('Hello world!'));");
    expect(move()).toBe("const {editor} = setup(editor => editor.insert('Hello world!'));");
  });
});

describe('.eol()', () => {
  test('can skip until end of line', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(0);
    const gotoEol = (): string => {
      const point = editor.eol(editor.cursor.end);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(gotoEol()).toBe('Hello world!');
  });

  test('does not move once already at the end of line', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(0);
    const gotoEol = (): string => {
      const point = editor.eol(editor.cursor.start);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(gotoEol()).toBe('Hello world!');
    expect(gotoEol()).toBe('Hello world!');
    expect(gotoEol()).toBe('Hello world!');
  });

  test('can go to the end of text', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(0);
    const gotoEol = (): string => {
      const point = editor.eol(editor.cursor.end);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(gotoEol()).toBe('Hello world!');
    expect(gotoEol()).toBe('Hello world!');
    editor.cursor.end.step(1);
    expect(editor.cursor.text()).toBe('Hello world!\n');
    expect(gotoEol()).toBe('Hello world!\nfoo bar baz');
    expect(gotoEol()).toBe('Hello world!\nfoo bar baz');
    expect(gotoEol()).toBe('Hello world!\nfoo bar baz');
  });
});

describe('.bol()', () => {
  test('can skip until beginning of line', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(editor.txt.str.length());
    const gotoBol = (): string => {
      const point = editor.bol(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(gotoBol()).toBe('foo bar baz');
  });

  test('does not move once already at the beginning of line', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(editor.txt.str.length());
    const gotoBol = (): string => {
      const point = editor.bol(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(gotoBol()).toBe('foo bar baz');
    expect(gotoBol()).toBe('foo bar baz');
    expect(gotoBol()).toBe('foo bar baz');
  });

  test('can go to the beginning of text', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(editor.txt.str.length());
    const gotoBol = (): string => {
      const point = editor.bol(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(gotoBol()).toBe('foo bar baz');
    expect(gotoBol()).toBe('foo bar baz');
    expect(gotoBol()).toBe('foo bar baz');
    editor.cursor.start.step(-1);
    expect(editor.cursor.text()).toBe('\nfoo bar baz');
    expect(gotoBol()).toBe('Hello world!\nfoo bar baz');
    expect(gotoBol()).toBe('Hello world!\nfoo bar baz');
  });
});

describe('.bob()', () => {
  test('first paragraph returns beginning of text', () => {
    const {editor, peritext} = setup((editor) => {
      editor.insert('abcdef');
      editor.cursor.setAt(3);
      editor.saved.insMarker('p');
    });
    peritext.overlay.refresh();
    expect(editor.bob(peritext.pointAt(0, Anchor.Before))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(0, Anchor.After))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(1, Anchor.Before))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(1, Anchor.After))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(2, Anchor.Before))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(2, Anchor.After))!.viewPos()).toBe(0);
  });

  test('second paragraph returns start of split start point', () => {
    const {editor, peritext} = setup((editor) => {
      editor.insert('abcdef');
      editor.cursor.setAt(3);
      editor.saved.insMarker('p');
    });
    peritext.overlay.refresh();
    expect(editor.bob(peritext.pointAt(3, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(3, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(4, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(4, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(5, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(5, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(6, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(6, Anchor.After))!.viewPos()).toBe(3);
  });
});

describe('.eob()', () => {
  test('finds end of first paragraph', () => {
    const {editor, peritext} = setup((editor) => {
      editor.insert('abcdef');
      editor.cursor.setAt(3);
      editor.saved.insMarker('p');
    });
    peritext.overlay.refresh();
    expect(editor.eob(peritext.pointAt(0, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(0, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(1, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(1, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(2, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(2, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(0, Anchor.Before))!.anchor).toBe(Anchor.After);
    expect(editor.eob(peritext.pointAt(0, Anchor.After))!.anchor).toBe(Anchor.After);
    expect(editor.eob(peritext.pointAt(1, Anchor.Before))!.anchor).toBe(Anchor.After);
    expect(editor.eob(peritext.pointAt(1, Anchor.After))!.anchor).toBe(Anchor.After);
    expect(editor.eob(peritext.pointAt(2, Anchor.Before))!.anchor).toBe(Anchor.After);
    expect(editor.eob(peritext.pointAt(2, Anchor.After))!.anchor).toBe(Anchor.After);
  });

  test('finds end of last paragraph', () => {
    const {editor, peritext} = setup((editor) => {
      editor.insert('abcdef');
      editor.cursor.setAt(3);
      editor.saved.insMarker('p');
    });
    peritext.overlay.refresh();
    expect(editor.eob(peritext.pointAt(3, Anchor.Before))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(3, Anchor.After))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(4, Anchor.Before))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(4, Anchor.After))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(5, Anchor.Before))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(5, Anchor.After))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(6, Anchor.Before))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(6, Anchor.After))!.viewPos()).toBe(7);
  });
});
