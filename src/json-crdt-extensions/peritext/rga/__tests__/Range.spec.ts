import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Anchor} from '../constants';

const setup = (insert: (peritext: Peritext) => void = (peritext) => peritext.strApi().ins(0, 'Hello world!')) => {
  const model = Model.withLogicalClock();
  model.api.set({
    text: '',
    slices: [],
  });
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  insert(peritext);
  return {model, peritext};
};

const setupEvenDeleted = () => {
  return setup((peritext) => {
    peritext.strApi().ins(0, '0123456789');
    peritext.strApi().del(0, 1);
    peritext.strApi().del(1, 1);
    peritext.strApi().del(2, 1);
    peritext.strApi().del(3, 1);
    peritext.strApi().del(4, 1);
  });
};

describe('new', () => {
  test('creates a range from two points', () => {
    const {peritext} = setup();
    const range = peritext.rangeAt(1, 2);
    expect(range.text()).toBe('el');
    expect(range.start.pos()).toBe(1);
    expect(range.start.viewPos()).toBe(1);
    expect(range.start.anchor).toBe(Anchor.Before);
    expect(range.end.pos()).toBe(2);
    expect(range.end.viewPos()).toBe(3);
    expect(range.end.anchor).toBe(Anchor.After);
  });
});

describe('.from()', () => {
  test('creates a when two points are in reverse order', () => {
    const {peritext} = setup();
    const rangeTmp = peritext.rangeAt(1, 2);
    const range = peritext.rangeFromPoints(rangeTmp.end, rangeTmp.start);
    expect(range.text()).toBe('el');
    expect(range.start.pos()).toBe(1);
    expect(range.start.viewPos()).toBe(1);
    expect(range.start.anchor).toBe(Anchor.Before);
    expect(range.end.pos()).toBe(2);
    expect(range.end.viewPos()).toBe(3);
    expect(range.end.anchor).toBe(Anchor.After);
  });
});

describe('.at()', () => {
  describe('collapsed', () => {
    test('can set caret to absolute start', () => {
      const {peritext} = setup();
      const range = peritext.rangeAt(0);
      expect(range.start.isAbsStart()).toBe(true);
      expect(range.end.isAbsStart()).toBe(true);
      expect(range.start).not.toBe(range.end);
    });

    test('can set caret to various text positions', () => {
      const {peritext} = setup();
      const length = peritext.str.length();
      for (let i = 1; i <= length; i++) {
        const range = peritext.rangeAt(i);
        expect(range.start.viewPos()).toBe(i);
        expect(range.end.viewPos()).toBe(i);
        expect(range.start).not.toBe(range.end);
      }
    });

    test('truncates lower bound', () => {
      const {peritext} = setup();
      const range = peritext.rangeAt(-123);
      expect(range.start.isAbsStart()).toBe(true);
    });

    test('truncates upper bound', () => {
      const {peritext} = setup();
      const range = peritext.rangeAt(123);
      expect(range.start.viewPos()).toBe(peritext.str.length());
    });
  });

  describe('expanded', () => {
    test('can select first character', () => {
      const {peritext} = setup();
      const range = peritext.rangeAt(0, 1);
      expect(range.length()).toBe(1);
      expect(range.text()).toBe('H');
      expect(range.start.anchor).toBe(Anchor.Before);
      expect(range.end.anchor).toBe(Anchor.After);
      expect(range.start.id.time).toBe(range.end.id.time);
    });

    test('can select any combination of characters', () => {
      const {peritext} = setupEvenDeleted();
      const length = peritext.str.length();
      for (let i = 0; i < length; i++) {
        for (let j = 1; j <= length - i; j++) {
          const range = peritext.rangeAt(i, j);
          expect(range.length()).toBe(j);
          expect(range.text()).toBe(
            peritext
              .strApi()
              .view()
              .slice(i, i + j),
          );
          expect(range.start.anchor).toBe(Anchor.Before);
          expect(range.end.anchor).toBe(Anchor.After);
        }
      }
    });

    test('truncates lower bound', () => {
      const {peritext} = setup();
      const range = peritext.rangeAt(-2, 5);
      expect(range.text()).toBe('Hel');
      expect(range.start.isRelStart()).toBe(true);
      expect(range.end.anchor).toBe(Anchor.After);
    });

    test('truncates upper bound', () => {
      const {peritext} = setup();
      const range = peritext.rangeAt(2, peritext.str.length() + 10);
      expect(range.text()).toBe('llo world!');
      expect(range.start.anchor).toBe(Anchor.Before);
      expect(range.end.isRelEnd()).toBe(true);
    });

    test('truncates lower and upper bounds to select all text', () => {
      const {peritext} = setup();
      const range = peritext.rangeAt(-123, 256);
      expect(range.text()).toBe('Hello world!');
      expect(range.start.isRelStart()).toBe(true);
      expect(range.end.isRelEnd()).toBe(true);
    });

    describe('when negative size', () => {
      test('can select range backwards', () => {
        const {peritext} = setup();
        const range = peritext.rangeAt(2, -1);
        expect(range.text()).toBe('e');
        expect(range.start.anchor).toBe(Anchor.Before);
        expect(range.end.anchor).toBe(Anchor.After);
      });

      test('can select range backwards, all combinations', () => {
        const {peritext} = setupEvenDeleted();
        const length = peritext.str.length();
        for (let i = 1; i < length; i++) {
          for (let j = 1; j <= i; j++) {
            const range = peritext.rangeAt(i, -j);
            expect(range.length()).toBe(j);
            expect(range.text()).toBe(
              peritext
                .strApi()
                .view()
                .slice(i - j, i),
            );
            expect(range.start.anchor).toBe(Anchor.Before);
            expect(range.end.anchor).toBe(Anchor.After);
          }
        }
      });

      test('truncates lower bound', () => {
        const {peritext} = setupEvenDeleted();
        const range = peritext.rangeAt(2, -5);
        expect(range.text()).toBe('13');
      });

      test('truncates upper bound', () => {
        const {peritext} = setupEvenDeleted();
        const range = peritext.rangeAt(7, -4);
        expect(range.text()).toBe('79');
      });

      test('truncates upper and lower bounds, can select all text', () => {
        const {peritext} = setupEvenDeleted();
        const range = peritext.rangeAt(10, -20);
        expect(range.text()).toBe('13579');
        expect(range.start.isRelStart()).toBe(true);
        expect(range.end.isRelEnd()).toBe(true);
      });
    });
  });
});

describe('.clone()', () => {
  test('can clone a range', () => {
    const {peritext} = setup();
    const range1 = peritext.rangeAt(2, 3);
    const range2 = range1.range();
    expect(range2).not.toBe(range1);
    expect(range1.text()).toBe(range2.text());
    expect(range2.start).not.toBe(range1.start);
    expect(range2.end).not.toBe(range1.end);
    expect(range2.start.refresh()).toBe(range1.start.refresh());
    expect(range2.end.refresh()).toBe(range1.end.refresh());
    expect(range2.start.cmp(range1.start)).toBe(0);
    expect(range2.end.cmp(range1.end)).toBe(0);
  });
});

describe('.isCollapsed()', () => {
  describe('when range is collapsed', () => {
    test('returns true at the beginning of string', () => {
      const {peritext} = setup();
      const point = peritext.pointAbsStart();
      const range = peritext.range(point, point);
      const isCollapsed = range.isCollapsed();
      expect(isCollapsed).toBe(true);
    });

    test('returns true at the end of string', () => {
      const {peritext} = setup();
      const point = peritext.pointAbsEnd();
      const range = peritext.range(point, point);
      const isCollapsed = range.isCollapsed();
      expect(isCollapsed).toBe(true);
    });

    test('returns true when before first character', () => {
      const {peritext} = setup();
      const point = peritext.pointAt(0, Anchor.Before);
      const range = peritext.range(point, point);
      const isCollapsed = range.isCollapsed();
      expect(isCollapsed).toBe(true);
    });

    test('returns true when after last character', () => {
      const {peritext} = setup();
      const point = peritext.pointAt(peritext.str.length() - 1, Anchor.After);
      const range = peritext.range(point, point);
      const isCollapsed = range.isCollapsed();
      expect(isCollapsed).toBe(true);
    });

    test('returns true when in the middle of plain/undeleted text', () => {
      const {peritext} = setup();
      const point1 = peritext.pointAt(2, Anchor.After);
      const point2 = peritext.pointAt(3, Anchor.Before);
      const range1 = peritext.range(point1, point1);
      const range2 = peritext.range(point2, point2);
      expect(range1.isCollapsed()).toBe(true);
      expect(range2.isCollapsed()).toBe(true);
    });

    describe('when first character is deleted', () => {
      test('returns true at the beginning of string', () => {
        const {peritext} = setupEvenDeleted();
        const point = peritext.pointAbsStart();
        const range = peritext.range(point, point);
        const isCollapsed = range.isCollapsed();
        expect(isCollapsed).toBe(true);
      });

      test('returns true when before first character', () => {
        const {peritext} = setupEvenDeleted();
        const point = peritext.pointAt(0, Anchor.Before);
        const range = peritext.range(point, point);
        const isCollapsed = range.isCollapsed();
        expect(isCollapsed).toBe(true);
      });
    });

    describe('when characters are deleted', () => {
      test('returns true when in the middle of deleted characters', () => {
        const {peritext} = setupEvenDeleted();
        const range = peritext.rangeAt(2, 1);
        expect(range.isCollapsed()).toBe(false);
        peritext.strApi().del(1, 3);
        expect(range.isCollapsed()).toBe(true);
      });

      test('returns true when whole text was deleted', () => {
        const {peritext} = setupEvenDeleted();
        const range = peritext.rangeAt(1, 3);
        expect(range.isCollapsed()).toBe(false);
        peritext.strApi().del(0, 5);
        expect(range.isCollapsed()).toBe(true);
      });

      test('when all text is selected', () => {
        const {peritext} = setupEvenDeleted();
        const range = peritext.range(peritext.pointAbsStart(), peritext.pointAbsEnd());
        expect(range.isCollapsed()).toBe(false);
        peritext.strApi().del(0, 5);
        expect(range.isCollapsed()).toBe(true);
      });
    });
  });
});

describe('.collapseToStart()', () => {
  test('collapses range to start', () => {
    const {peritext} = setup();
    const range = peritext.rangeAt(2, 3);
    range.collapseToStart();
    expect(range.isCollapsed()).toBe(true);
    expect(range.start.rightChar()?.view()).toBe('l');
    expect(range.end.rightChar()?.view()).toBe('l');
  });
});

describe('.collapseToEnd()', () => {
  test('collapses range to end', () => {
    const {peritext} = setup();
    const range = peritext.rangeAt(2, 3);
    range.collapseToEnd();
    expect(range.isCollapsed()).toBe(true);
    expect(range.start.leftChar()?.view()).toBe('o');
    expect(range.end.leftChar()?.view()).toBe('o');
  });
});

describe('.view()', () => {
  test('returns correct view', () => {
    const {peritext} = setup();
    const range = peritext.rangeAt(2, 3);
    expect(range.view()).toEqual([2, 3]);
  });
});

describe('.contains()', () => {
  test('returns true if slice is contained', () => {
    const {peritext} = setup();
    peritext.editor.cursor.setAt(3, 2);
    const [slice] = peritext.editor.saved.insOne('b');
    peritext.editor.cursor.setAt(0);
    peritext.refresh();
    expect(peritext.rangeAt(2, 4).contains(slice)).toBe(true);
    expect(peritext.rangeAt(3, 4).contains(slice)).toBe(true);
    expect(peritext.rangeAt(2, 3).contains(slice)).toBe(true);
    expect(peritext.rangeAt(3, 2).contains(slice)).toBe(true);
  });

  test('returns false if slice is not contained', () => {
    const {peritext} = setup();
    peritext.editor.cursor.setAt(3, 2);
    const [slice] = peritext.editor.saved.insOne('b');
    peritext.editor.cursor.setAt(0);
    peritext.refresh();
    expect(peritext.rangeAt(3, 1).contains(slice)).toBe(false);
    expect(peritext.rangeAt(2, 1).contains(slice)).toBe(false);
    expect(peritext.rangeAt(2, 2).contains(slice)).toBe(false);
    expect(peritext.rangeAt(1, 1).contains(slice)).toBe(false);
    expect(peritext.rangeAt(4, 5).contains(slice)).toBe(false);
    expect(peritext.rangeAt(8, 1).contains(slice)).toBe(false);
  });
});

describe('.containsPoint()', () => {
  test('returns true if slice is contained', () => {
    const {peritext} = setup();
    const point = peritext.pointAt(2, Anchor.After);
    const range1 = peritext.rangeAt(2, 2);
    const range2 = peritext.rangeAt(3, 2);
    expect(range1.containsPoint(point)).toBe(true);
    expect(range2.containsPoint(point)).toBe(false);
    range2.start.refAfter();
    expect(range2.containsPoint(point)).toBe(true);
    const range3 = peritext.rangeAt(1, 2);
    expect(range3.containsPoint(point)).toBe(true);
  });
});

describe('.isCollapsed()', () => {
  test('returns true when endpoints point to the same location', () => {
    const {peritext} = setup();
    peritext.editor.cursor.setAt(3);
    expect(peritext.editor.cursor.isCollapsed()).toBe(true);
  });

  test('returns true when when there is no visible content between endpoints', () => {
    const {peritext} = setup();
    const range = peritext.rangeAt(2, 1);
    peritext.editor.cursor.setAt(2, 1);
    peritext.editor.del();
    expect(range.isCollapsed()).toBe(true);
  });
});

describe('.expand()', () => {
  const runExpandTests = (setup2: typeof setup) => {
    test('can expand anchors to include adjacent elements', () => {
      const {peritext} = setup2();
      const editor = peritext.editor;
      editor.cursor.setAt(1, 1);
      expect(editor.cursor.start.pos()).toBe(1);
      expect(editor.cursor.start.anchor).toBe(Anchor.Before);
      expect(editor.cursor.end.pos()).toBe(1);
      expect(editor.cursor.end.anchor).toBe(Anchor.After);
      editor.cursor.expand();
      expect(editor.cursor.start.pos()).toBe(0);
      expect(editor.cursor.start.anchor).toBe(Anchor.After);
      expect(editor.cursor.end.pos()).toBe(2);
      expect(editor.cursor.end.anchor).toBe(Anchor.Before);
    });

    test('can expand anchors to contain include adjacent tombstones', () => {
      const {peritext} = setup2();
      const tombstone1 = peritext.rangeAt(1, 1);
      tombstone1.expand();
      const tombstone2 = peritext.rangeAt(3, 1);
      tombstone2.expand();
      peritext.editor.cursor.setRange(tombstone1);
      peritext.editor.del();
      peritext.editor.cursor.setRange(tombstone2);
      peritext.editor.del();
      const range = peritext.rangeAt(1, 1);
      range.expand();
      expect(range.start.pos()).toBe(tombstone1.start.pos());
      expect(range.start.anchor).toBe(tombstone1.start.anchor);
      expect(range.end.pos()).toBe(tombstone2.end.pos());
      expect(range.end.anchor).toBe(tombstone2.end.anchor);
    });
  };

  describe('single text chunk', () => {
    runExpandTests(setup);
  });

  describe('each car is own chunk', () => {
    runExpandTests(() =>
      setup((peritext) => {
        const editor = peritext.editor;
        editor.insert('!');
        editor.cursor.setAt(0);
        editor.insert('d');
        editor.cursor.setAt(0);
        editor.insert('l');
        editor.cursor.setAt(0);
        editor.insert('r');
        editor.cursor.setAt(0);
        editor.insert('o');
        editor.cursor.setAt(0);
        editor.insert('w');
        editor.cursor.setAt(0);
        editor.insert(' ');
        editor.cursor.setAt(0);
        editor.insert('o');
        editor.cursor.setAt(0);
        editor.insert('l');
        editor.cursor.setAt(0);
        editor.insert('l');
        editor.cursor.setAt(0);
        editor.insert('e');
        editor.cursor.setAt(0);
        editor.insert('H');
      }),
    );
  });
});

describe('.shrink()', () => {
  const runShrinkTests = (setup2: typeof setup) => {
    test('can shrink endpoints to include adjacent elements', () => {
      const {peritext} = setup2();
      const editor = peritext.editor;
      editor.cursor.setAt(1, 1);
      expect(editor.cursor.start.pos()).toBe(1);
      expect(editor.cursor.start.anchor).toBe(Anchor.Before);
      expect(editor.cursor.end.pos()).toBe(1);
      expect(editor.cursor.end.anchor).toBe(Anchor.After);
      editor.cursor.shrink();
      expect(editor.cursor.start.pos()).toBe(1);
      expect(editor.cursor.start.anchor).toBe(Anchor.Before);
      expect(editor.cursor.end.pos()).toBe(1);
      expect(editor.cursor.end.anchor).toBe(Anchor.After);
      editor.cursor.expand();
      editor.cursor.shrink();
      expect(editor.cursor.start.pos()).toBe(1);
      expect(editor.cursor.start.anchor).toBe(Anchor.Before);
      expect(editor.cursor.end.pos()).toBe(1);
      expect(editor.cursor.end.anchor).toBe(Anchor.After);
    });

    test('can shrink endpoints past adjacent tombstones', () => {
      const {peritext} = setup2();
      const tombstone1 = peritext.rangeAt(1, 1);
      tombstone1.expand();
      const tombstone2 = peritext.rangeAt(3, 1);
      tombstone2.expand();
      peritext.editor.cursor.setRange(tombstone1);
      peritext.editor.del();
      peritext.editor.cursor.setRange(tombstone2);
      peritext.editor.del();
      const range = peritext.rangeAt(1, 1);
      expect(range.start.pos()).toBe(1);
      expect(range.start.anchor).toBe(Anchor.Before);
      expect(range.end.pos()).toBe(1);
      expect(range.end.anchor).toBe(Anchor.After);
      range.expand();
      expect(range.start.pos()).toBe(tombstone1.start.pos());
      expect(range.start.anchor).toBe(tombstone1.start.anchor);
      expect(range.end.pos()).toBe(tombstone2.end.pos());
      expect(range.end.anchor).toBe(tombstone2.end.anchor);
      range.shrink();
      expect(range.start.pos()).toBe(1);
      expect(range.start.anchor).toBe(Anchor.Before);
      expect(range.end.pos()).toBe(1);
      expect(range.end.anchor).toBe(Anchor.After);
    });
  };

  describe('single text chunk', () => {
    runShrinkTests(setup);
  });

  describe('each car is own chunk', () => {
    runShrinkTests(() =>
      setup((peritext) => {
        const editor = peritext.editor;
        editor.insert('!');
        editor.cursor.setAt(0);
        editor.insert('d');
        editor.cursor.setAt(0);
        editor.insert('l');
        editor.cursor.setAt(0);
        editor.insert('r');
        editor.cursor.setAt(0);
        editor.insert('o');
        editor.cursor.setAt(0);
        editor.insert('w');
        editor.cursor.setAt(0);
        editor.insert(' ');
        editor.cursor.setAt(0);
        editor.insert('o');
        editor.cursor.setAt(0);
        editor.insert('l');
        editor.cursor.setAt(0);
        editor.insert('l');
        editor.cursor.setAt(0);
        editor.insert('e');
        editor.cursor.setAt(0);
        editor.insert('H');
      }),
    );
  });
});
