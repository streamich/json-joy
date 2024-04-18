import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Anchor} from '../../constants';

const setup = (insert: (peritext: Peritext) => void = (peritext) => peritext.strApi().ins(0, 'Hello world!')) => {
  const model = Model.withLogicalClock();
  model.api.root({
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

describe('.clone()', () => {
  test('can clone a range', () => {
    const {peritext} = setup();
    const range1 = peritext.rangeAt(2, 3);
    const range2 = range1.clone();
    expect(range2).not.toBe(range1);
    expect(range1.text()).toBe(range2.text());
    expect(range2.start).not.toBe(range1.start);
    expect(range2.end).not.toBe(range1.end);
    expect(range2.start.refresh()).toBe(range1.start.refresh());
    expect(range2.end.refresh()).toBe(range1.end.refresh());
    expect(range2.start.compare(range1.start)).toBe(0);
    expect(range2.end.compare(range1.end)).toBe(0);
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
    expect(range.views()).toEqual([2, 3]);
  });
});

describe('.contains()', () => {
  test('returns true if slice is contained', () => {
    const {peritext} = setup();
    peritext.editor.setCursor(3, 2);
    const slice = peritext.editor.insertOverwriteSlice('b');
    peritext.editor.setCursor(0);
    peritext.refresh();
    expect(peritext.rangeAt(2, 4).contains(slice)).toBe(true);
    expect(peritext.rangeAt(3, 4).contains(slice)).toBe(true);
    expect(peritext.rangeAt(2, 3).contains(slice)).toBe(true);
    expect(peritext.rangeAt(3, 2).contains(slice)).toBe(true);
  });

  test('returns false if slice is not contained', () => {
    const {peritext} = setup();
    peritext.editor.setCursor(3, 2);
    const slice = peritext.editor.insertOverwriteSlice('b');
    peritext.editor.setCursor(0);
    peritext.refresh();
    expect(peritext.rangeAt(3, 1).contains(slice)).toBe(false);
    expect(peritext.rangeAt(2, 1).contains(slice)).toBe(false);
    expect(peritext.rangeAt(2, 2).contains(slice)).toBe(false);
    expect(peritext.rangeAt(1, 1).contains(slice)).toBe(false);
    expect(peritext.rangeAt(4, 5).contains(slice)).toBe(false);
    expect(peritext.rangeAt(8, 1).contains(slice)).toBe(false);
  });
});

describe('.isCollapsed()', () => {
  test('returns true when endpoints point to the same location', () => {
    const {peritext} = setup();
    peritext.editor.setCursor(3);
    expect(peritext.editor.cursor.isCollapsed()).toBe(true);
  });

  test('returns true when when there is no visible content between endpoints', () => {
    const {peritext} = setup();
    const range = peritext.rangeAt(2, 1);
    peritext.editor.setCursor(2, 1);
    peritext.editor.delete();
    expect(range.isCollapsed()).toBe(true);
  });
});

describe('.expand()', () => {
  const runExpandTests = (setup2: typeof setup) => {
    test('can expand anchors to include adjacent elements', () => {
      const {peritext} = setup2();
      const editor = peritext.editor;
      editor.setCursor(1, 1);
      expect(editor.cursor.start.pos()).toBe(1);
      expect(editor.cursor.start.anchor).toBe(Anchor.Before);
      expect(editor.cursor.end.pos()).toBe(1);
      expect(editor.cursor.end.anchor).toBe(Anchor.After);
      editor.cursor.expand();
      expect(editor.cursor.start.pos()).toBe(0);
      expect(editor.cursor.start.anchor).toBe(Anchor.After);
      expect(editor.cursor.end.pos()).toBe(2);
      expect(editor.cursor.end.anchor).toBe(Anchor.Before);
      // console.log(peritext + '')
    });

    test('can expand anchors to contain include adjacent tombstones', () => {
      const {peritext} = setup2();
      const tombstone1 = peritext.rangeAt(1, 1);
      tombstone1.expand();
      const tombstone2 = peritext.rangeAt(3, 1);
      tombstone2.expand();
      peritext.editor.cursor.setRange(tombstone1);
      peritext.editor.delete();
      peritext.editor.cursor.setRange(tombstone2);
      peritext.editor.delete();
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
        editor.setCursor(0);
        editor.insert('d');
        editor.setCursor(0);
        editor.insert('l');
        editor.setCursor(0);
        editor.insert('r');
        editor.setCursor(0);
        editor.insert('o');
        editor.setCursor(0);
        editor.insert('w');
        editor.setCursor(0);
        editor.insert(' ');
        editor.setCursor(0);
        editor.insert('o');
        editor.setCursor(0);
        editor.insert('l');
        editor.setCursor(0);
        editor.insert('l');
        editor.setCursor(0);
        editor.insert('e');
        editor.setCursor(0);
        editor.insert('H');
      }),
    );
  });
});
