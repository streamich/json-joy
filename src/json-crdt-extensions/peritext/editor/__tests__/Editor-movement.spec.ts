import { Model } from "../../../../json-crdt/model";
import { Peritext } from "../../Peritext";
import {
  type Kit,
  runAlphabetKitTestSuite,
  setupHelloWorldKit,
  setupHelloWorldWithFewEditsKit,
} from "../../__tests__/setup";
import { Point } from "../../rga/Point";
import { Anchor } from "../../rga/constants";
import { CursorAnchor } from "../../slice/constants";
import type { Editor } from "../Editor";
import type { TextRangeUnit } from "../types";

const runTestsWithAlphabetKit = (setup: () => Kit) => {
  describe("one character movements", () => {
    test("move start to end one char at-a-time", () => {
      const { editor } = setup();
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

    test("move end to start one char at-a-time", () => {
      const { editor } = setup();
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

  describe(".fwd()", () => {
    test("can use string root as initial point", () => {
      const { peritext, editor } = setup();
      const iterator = editor.fwd(peritext.pointAbsStart());
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe(peritext.str.view());
    });

    test("can iterate through the entire string", () => {
      const { peritext, editor } = setup();
      const start = peritext.pointStart()!;
      const iterator = editor.fwd(start);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe(peritext.str.view());
    });

    test("can iterate through the entire string, starting from ABS start", () => {
      const { peritext, editor } = setup();
      const start = peritext.pointAbsStart()!;
      const iterator = editor.fwd(start);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe(peritext.str.view());
    });

    test("can iterate through the entire string, with initial chunk provided", () => {
      const { peritext, editor } = setup();
      const start = peritext.pointStart()!;
      const iterator = editor.fwd(start);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe(peritext.str.view());
    });

    test("can iterate starting at an offset", () => {
      const { peritext, editor } = setup();
      const start = peritext.pointAt(2);
      const iterator = editor.fwd(start);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe((peritext.str.view() as string).slice(2));
    });

    test("can iterate starting in the middle of second chunk - 2", () => {
      const { peritext, editor } = setup();
      const start = peritext.pointAt(6);
      const iterator = editor.fwd(start);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe((peritext.str.view() as string).slice(6));
    });

    test(".isMarker() returns true for block split chars", () => {
      const { peritext, editor } = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker("p");
      peritext.overlay.refresh();
      const start = peritext.pointAt(0);
      const iterator = editor.fwd(start);
      let str = "";
      const bools: boolean[] = [];
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
        bools.push(peritext.overlay.isMarker(res.id()));
      }
      expect(str).toBe(peritext.str.view());
      const res = bools
        .map((b, i) => (b ? (peritext.str.view() as string)[i] : ""))
        .filter(Boolean)
        .join("");
      expect(res).toBe("\n");
    });
  });

  describe(".bwd()", () => {
    test("can use string root as initial point", () => {
      const { peritext, editor } = setup();
      const iterator = editor.bwd(peritext.pointAbsEnd());
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe("zyxwvutsrqponmlkjihgfedcba");
    });

    test("can iterate through the entire string", () => {
      const { peritext, editor } = setup();
      const end = peritext.pointEnd()!;
      const iterator = editor.bwd(end);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe("zyxwvutsrqponmlkjihgfedcba");
    });

    test("can iterate through the entire string, starting from ABS end", () => {
      const { peritext, editor } = setup();
      const end = peritext.pointAbsEnd()!;
      const iterator = editor.bwd(end);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe("zyxwvutsrqponmlkjihgfedcba");
    });

    test("can iterate through the entire string, with initial chunk provided", () => {
      const { peritext, editor } = setup();
      const end = peritext.pointEnd()!;
      const iterator = editor.bwd(end);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe("zyxwvutsrqponmlkjihgfedcba");
    });

    test("can iterate starting in the middle of first chunk", () => {
      const { peritext, editor } = setup();
      const point = peritext.pointAt(2);
      const iterator = editor.bwd(point);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe("ba");
    });

    test("can iterate starting in the middle of first chunk, with initial chunk provided", () => {
      const { peritext, editor } = setup();
      const point = peritext.pointAt(2);
      const iterator = editor.bwd(point);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe("ba");
    });

    test("can iterate starting in the middle of second chunk", () => {
      const { peritext, editor } = setup();
      const point = peritext.pointAt(6);
      const iterator = editor.bwd(point);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe("fedcba");
    });

    test("can iterate starting in the middle of second chunk, with initial chunk provided", () => {
      const { peritext, editor } = setup();
      const point = peritext.pointAt(6);
      const iterator = editor.bwd(point);
      let str = "";
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
      }
      expect(str).toBe("fedcba");
    });

    test("returns true for block split chars", () => {
      const { peritext, editor } = setup();
      editor.cursor.setAt(14);
      editor.saved.insMarker("p");
      peritext.overlay.refresh();
      const start = peritext.pointAt(17);
      const iterator = editor.bwd(start);
      let str = "";
      const bools: boolean[] = [];
      // biome-ignore lint: constant condition is expected
      while (1) {
        const res = iterator();
        if (!res) break;
        str += res.view();
        bools.push(peritext.overlay.isMarker(res.id()));
      }
      expect(str).toBe("po\nnmlkjihgfedcba");
      const res = bools
        .map((b, i) => (b ? "po\nnmlkjihgfedcba"[i] : ""))
        .filter(Boolean)
        .join("");
      expect(res).toBe("\n");
    });
  });
};

runAlphabetKitTestSuite(runTestsWithAlphabetKit);

const setup = (
  insert = (editor: Editor) => {
    editor.insert("Hello world!");
  },
  sid?: number
) => {
  const model = Model.create(void 0, sid);
  model.api.root({
    text: "",
    slices: [],
    data: {},
  });
  const peritext = new Peritext(
    model,
    model.api.str(["text"]).node,
    model.api.arr(["slices"]).node,
    model.api.obj(["data"]),
  );
  const editor = peritext.editor;
  insert(editor);
  return { model, peritext, editor };
};

describe(".eow()", () => {
  test("can go to the end of a word", () => {
    const { editor } = setup((editor) => editor.insert("Hello world!"));
    editor.cursor.setAt(0);
    const point = editor.eow(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe("Hello");
  });

  test("can skip whitespace between words", () => {
    const { editor } = setup((editor) => editor.insert("Hello world!"));
    editor.cursor.setAt(5);
    const point = editor.eow(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe(" world");
  });

  test("skipping stops before exclamation mark", () => {
    const { editor } = setup((editor) => editor.insert("Hello world!"));
    editor.cursor.setAt(6);
    const point = editor.eow(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe("world");
  });

  test("can skip to the end of string", () => {
    const { editor } = setup((editor) => editor.insert("Hello world!"));
    editor.cursor.setAt(11);
    const point = editor.eow(editor.cursor.end);
    expect(point instanceof Point).toBe(true);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe("!");
  });

  test("can skip various character classes", () => {
    const { editor } = setup((editor) =>
      editor.insert(
        "const {editor} = setup(editor => editor.insert('Hello world!'));"
      )
    );
    editor.cursor.setAt(0);
    const move = (): string => {
      const point = editor.eow(editor.cursor.end);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(move()).toBe("const");
    expect(move()).toBe("const {editor");
    expect(move()).toBe("const {editor} = setup");
    expect(move()).toBe("const {editor} = setup(editor");
    expect(move()).toBe("const {editor} = setup(editor => editor");
    expect(move()).toBe("const {editor} = setup(editor => editor.insert");
    expect(move()).toBe(
      "const {editor} = setup(editor => editor.insert('Hello"
    );
    expect(move()).toBe(
      "const {editor} = setup(editor => editor.insert('Hello world"
    );
    expect(move()).toBe(
      "const {editor} = setup(editor => editor.insert('Hello world!'));"
    );
  });

  test("can select a character", () => {
    const { editor, peritext } = setup((editor) => editor.insert("x a x"));
    const point1 = peritext.pointAt(2);
    const point2 = editor.eow(point1);
    expect(point1.id.sid).toBe(point2!.id.sid);
    expect(point1.id.time).toBe(point2!.id.time);
    expect(point1.anchor).toBe(Anchor.Before);
    expect(point2.anchor).toBe(Anchor.After);
  });
});

describe(".bow()", () => {
  test("can skip over simple text.", () => {
    const { editor } = setup((editor) =>
      editor.insert("Hello world!\nfoo bar baz")
    );
    editor.cursor.setAt(editor.txt.str.length());
    const move = (): string => {
      const point = editor.bow(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(move()).toBe("baz");
    expect(move()).toBe("bar baz");
    expect(move()).toBe("foo bar baz");
    expect(move()).toBe("world!\nfoo bar baz");
    expect(move()).toBe("Hello world!\nfoo bar baz");
  });

  test("can skip various character classes", () => {
    const { editor } = setup((editor) =>
      editor.insert(
        "const {editor} = setup(editor => editor.insert('Hello world!'));"
      )
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
    expect(move()).toBe(
      "editor} = setup(editor => editor.insert('Hello world!'));"
    );
    expect(move()).toBe(
      "const {editor} = setup(editor => editor.insert('Hello world!'));"
    );
  });
});

describe(".eol()", () => {
  test("can skip until end of line", () => {
    const { editor } = setup((editor) =>
      editor.insert("Hello world!\nfoo bar baz")
    );
    editor.cursor.setAt(0);
    const gotoEol = (): string => {
      const point = editor.eol(editor.cursor.end);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(gotoEol()).toBe("Hello world!");
  });

  test("does not move once already at the end of line", () => {
    const { editor } = setup((editor) =>
      editor.insert("Hello world!\nfoo bar baz")
    );
    editor.cursor.setAt(0);
    const gotoEol = (): string => {
      const point = editor.eol(editor.cursor.start);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(gotoEol()).toBe("Hello world!");
    expect(gotoEol()).toBe("Hello world!");
    expect(gotoEol()).toBe("Hello world!");
  });

  test("can go to the end of text", () => {
    const { editor } = setup((editor) =>
      editor.insert("Hello world!\nfoo bar baz")
    );
    editor.cursor.setAt(0);
    const gotoEol = (): string => {
      const point = editor.eol(editor.cursor.end);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(gotoEol()).toBe("Hello world!");
    editor.cursor.end.step(1);
    expect(editor.cursor.text()).toBe("Hello world!\n");
    expect(gotoEol()).toBe("Hello world!\nfoo bar baz");
  });
});

describe(".bol()", () => {
  test("can skip until beginning of line", () => {
    const { editor } = setup((editor) =>
      editor.insert("Hello world!\nfoo bar baz")
    );
    editor.cursor.setAt(editor.txt.str.length());
    const gotoBol = (): string => {
      const point = editor.bol(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(gotoBol()).toBe("foo bar baz");
  });

  test("does not move once already at the beginning of line", () => {
    const { editor } = setup((editor) =>
      editor.insert("Hello world!\nfoo bar baz")
    );
    editor.cursor.setAt(editor.txt.str.length());
    const gotoBol = (): string => {
      const point = editor.bol(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(gotoBol()).toBe("foo bar baz");
    const point = editor.bol(editor.cursor.start);
    const point2 = editor.bol(point);
    expect(point.isRelStart()).toBe(true);
    expect(point2.isRelStart()).toBe(true);
  });

  test("can go to the beginning of text", () => {
    const { editor } = setup((editor) =>
      editor.insert("Hello world!\nfoo bar baz")
    );
    editor.cursor.setAt(editor.txt.str.length());
    const gotoBol = (): string => {
      const point = editor.bol(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(gotoBol()).toBe("foo bar baz");
    const point = editor.bol(editor.cursor.start);
    const point2 = editor.bol(point);
    expect(point.isRelStart()).toBe(true);
    expect(point2.isRelStart()).toBe(true);
    editor.cursor.start.step(-1);
    expect(editor.cursor.text()).toBe("\nfoo bar baz");
    const point3 = editor.bol(editor.cursor.start);
    const point4 = editor.bol(point);
    expect(point3.isRelStart()).toBe(true);
    expect(point4.isRelStart()).toBe(true);
  });
});

describe(".bob()", () => {
  test("first paragraph returns beginning of text", () => {
    const { editor, peritext } = setup((editor) => {
      editor.insert("abcdef");
      editor.cursor.setAt(3);
      editor.saved.insMarker("p");
    });
    peritext.overlay.refresh();
    expect(editor.bob(peritext.pointAt(0, Anchor.Before))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(0, Anchor.After))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(1, Anchor.Before))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(1, Anchor.After))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(2, Anchor.Before))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(2, Anchor.After))!.viewPos()).toBe(0);
  });

  test("second paragraph returns start of split start point", () => {
    const { editor, peritext } = setup((editor) => {
      editor.insert("abcdef");
      editor.cursor.setAt(3);
      editor.saved.insMarker("p");
    });
    peritext.overlay.refresh();
    expect(editor.bob(peritext.pointAt(3, Anchor.Before))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(3, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(4, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(4, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(5, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(5, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(6, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(6, Anchor.After))!.viewPos()).toBe(3);
  });
});

describe(".eob()", () => {
  test("finds end of first paragraph", () => {
    const { editor, peritext } = setup((editor) => {
      editor.insert("abcdef");
      editor.cursor.setAt(3);
      editor.saved.insMarker("p");
    });
    peritext.overlay.refresh();
    expect(editor.eob(peritext.pointAt(0, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(0, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(1, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(1, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(2, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(2, Anchor.After))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(0, Anchor.Before))!.anchor).toBe(
      Anchor.After
    );
    expect(editor.eob(peritext.pointAt(0, Anchor.After))!.anchor).toBe(
      Anchor.After
    );
    expect(editor.eob(peritext.pointAt(1, Anchor.Before))!.anchor).toBe(
      Anchor.After
    );
    expect(editor.eob(peritext.pointAt(1, Anchor.After))!.anchor).toBe(
      Anchor.After
    );
    expect(editor.eob(peritext.pointAt(2, Anchor.Before))!.anchor).toBe(
      Anchor.After
    );
    expect(editor.eob(peritext.pointAt(2, Anchor.After))!.anchor).toBe(
      Anchor.After
    );
  });

  test("finds end of last paragraph", () => {
    const { editor, peritext } = setup((editor) => {
      editor.insert("abcdef");
      editor.cursor.setAt(3);
      editor.saved.insMarker("p");
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

const runParagraphTests = (setup: () => Kit) => {
  const setupParagraphs = () => {
    const kit = setup();
    kit.editor.cursor.setAt(6);
    kit.editor.del();
    kit.editor.saved.insMarker("p");
    kit.editor.cursor.setAt(2);
    kit.editor.insert(" ");
    kit.editor.cursor.setAt(9);
    kit.editor.insert("dka and wo");
    kit.editor.delCursors();
    kit.peritext.refresh();
    return kit;
  };

  describe(".skip()", () => {
    test("can skip to the end and start of a word", () => {
      const { peritext, editor } = setupParagraphs();
      editor.cursor.setAt(18);
      peritext.overlay.refresh();
      const point1 = editor.skip(editor.cursor.start, -1, "word");
      const point2 = editor.skip(editor.cursor.start, 1, "word");
      expect(point1.rightChar()?.view()).toBe("w");
      expect(point2.leftChar()?.view()).toBe("d");
    });

    test("can skip two words backwards", () => {
      const { peritext, editor } = setupParagraphs();
      editor.cursor.setAt(18);
      peritext.overlay.refresh();
      const point = editor.skip(editor.cursor.start, -2, "word");
      expect(point.rightChar()?.view()).toBe("a");
    });

    test("can skip to the beginning of line", () => {
      const { peritext, editor } = setupParagraphs();
      editor.cursor.setAt(18);
      peritext.overlay.refresh();
      const point = editor.skip(editor.cursor.start, -1, "line");
      expect(point.leftChar()?.view()).toBe("\n");
    });

    test("can skip to the beginning of block", () => {
      const { peritext, editor } = setupParagraphs();
      editor.cursor.setAt(18);
      peritext.overlay.refresh();
      const point = editor.skip(editor.cursor.start, -1, "block");
      expect(point.leftChar()?.view()).toBe("o");
    });

    test(".eob() does not move forward when at ABS end", () => {
      const { peritext, editor } = setupParagraphs();
      const point = peritext.pointAbsEnd()!;
      const point2 = editor.skip(point, 1, "block");
      expect(point.isAbsEnd()).toBe(true);
      expect(point2.isAbsEnd()).toBe(true);
    });

    test("can move forward by block skipping", () => {
      const { peritext, editor } = setupParagraphs();
      const point = peritext.pointAbsStart();
      const point2 = editor.skip(point, 1, "block");
      const point3 = editor.skip(point2, 1, "block");
      const point4 = editor.skip(point3, 1, "block");
      const point5 = editor.skip(point4, 1, "block");
      expect(point2!.leftChar()?.view()).toBe("o");
      expect(point3!.leftChar()?.view()).toBe("d");
      expect(point4!.leftChar()?.view()).toBe("d");
      expect(point5!.leftChar()?.view()).toBe("d");
      expect(point5.isAbsEnd()).toBe(true);
    });

    test("can move backward by block skipping", () => {
      const { peritext, editor } = setupParagraphs();
      const point = peritext.pointAbsEnd();
      const point2 = editor.skip(point, -1, "block");
      const point3 = editor.skip(point2, -1, "block");
      const point4 = editor.skip(point3, -1, "block");
      const point5 = editor.skip(point4, -1, "block");
      expect(point2!.rightChar()?.view()).toBe("\n");
      expect(point3!.rightChar()?.view()).toBe("h");
      expect(point4!.rightChar()?.view()).toBe("h");
      expect(point5!.rightChar()?.view()).toBe("h");
      expect(point5.isAbsStart()).toBe(true);
    });

    test("can iterate through the whole document forwards using various skip methods", () => {
      const { peritext, editor } = setupParagraphs();
      const units: Record<TextRangeUnit, number> = {
        point: 0,
        char: 0,
        word: 0,
        line: 0,
        block: 0,
        all: 0,
      } as Record<TextRangeUnit, number>;
      for (const u of Object.keys(units)) {
        const unit = u as TextRangeUnit;
        let point = peritext.pointAbsStart();
        // biome-ignore lint: constant condition is expected
        while (1) {
          point = editor.skip(point, 1, unit);
          if (!point || point.isRelEnd() || point.isAbsEnd()) break;
          units[unit]++;
        }
      }
      expect(units.point > units.char).toBe(true);
      expect(units.char > units.word).toBe(true);
      expect(units.word > units.line).toBe(true);
      expect(units.line >= units.block).toBe(true);
      expect(units.block > units.all).toBe(true);
    });

    test("can iterate through the whole document backwards using various skip methods", () => {
      const { peritext, editor } = setupParagraphs();
      const units: Record<TextRangeUnit, number> = {
        point: 0,
        char: 0,
        word: 0,
        line: 0,
        block: 0,
        all: 0,
      } as Record<TextRangeUnit, number>;
      for (const u of Object.keys(units)) {
        const unit = u as TextRangeUnit;
        let point = peritext.pointAbsEnd();
        // biome-ignore lint: constant condition is expected
        while (1) {
          point = editor.skip(point, -1, unit);
          if (!point || point.isRelStart() || point.isAbsStart()) break;
          units[unit]++;
        }
      }
      expect(units.point > units.char).toBe(true);
      expect(units.char > units.word).toBe(true);
      expect(units.word > units.line).toBe(true);
      expect(units.line >= units.block).toBe(true);
      expect(units.block > units.all).toBe(true);
    });
  });

  describe(".move()", () => {
    test("moves both ends of two selections two characters forward", () => {
      const { peritext, editor } = setupParagraphs();
      editor.addCursor(peritext.rangeAt(2, 2));
      editor.addCursor(peritext.rangeAt(8, 3));
      const getTexts = (): string[] => {
        const texts: string[] = [];
        editor.forCursor((cursor) => {
          texts.push(cursor.text());
        });
        return texts;
      };
      expect(getTexts()).toEqual([" l", "odk"]);
      peritext.refresh();
      editor.move(2, "char", 2, false);
      peritext.refresh();
      expect(getTexts()).toEqual(["lo", "ka "]);
    });

    test("can move anchor of the current selection", () => {
      const { peritext, editor } = setupParagraphs();
      editor.cursor.setAt(2, 2);
      peritext.refresh();
      editor.move(-1, "char", 1, false);
      peritext.refresh();
      expect(editor.cursor.text()).toBe("e l");
      expect(editor.cursor.anchorSide).toBe(CursorAnchor.Start);
      editor.move(5, "char", 1, false);
      peritext.refresh();
      expect(editor.cursor.text()).toBe("lo");
      expect(editor.cursor.anchorSide).toBe(CursorAnchor.End);
    });

    test("can move focus of the current selection", () => {
      const { peritext, editor } = setupParagraphs();
      editor.cursor.setAt(2, 2);
      peritext.refresh();
      expect(editor.cursor.text()).toBe(" l");
      editor.move(1, "char", 0, false);
      peritext.refresh();
      expect(editor.cursor.text()).toBe(" ll");
      editor.move(-5, "char", 0, false);
      peritext.refresh();
      expect(editor.cursor.text()).toBe("he");
    });
  });
};

describe('basic "hello world"', () => {
  runParagraphTests(setupHelloWorldKit);
});

describe('"hello world" with edits', () => {
  runParagraphTests(setupHelloWorldWithFewEditsKit);
});
