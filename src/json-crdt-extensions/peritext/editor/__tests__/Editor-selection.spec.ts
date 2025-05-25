import { Model } from "../../../../json-crdt/model";
import { Peritext } from "../../Peritext";
import { Anchor } from "../../rga/constants";
import { CursorAnchor } from "../../slice/constants";
import type { Editor } from "../Editor";

const setup = (
  insert = (editor: Editor<string>) => {
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

describe(".selectAll()", () => {
  test("can select whole document", () => {
    const { editor } = setup();
    editor.selectAll();
    expect(editor.cursor.text()).toBe("Hello world!");
    expect(editor.cursor.start.viewPos()).toBe(0);
    expect(editor.cursor.end.viewPos()).toBe(12);
  });
});

describe(".rangeWord()", () => {
  test("can select a word", () => {
    const { editor, peritext } = setup((editor) => {
      editor.insert(
        "const {editor} = setup(editor => editor.insert('Hello world!'));"
      );
    });
    peritext.overlay.refresh();
    const range = editor.rangeWord(peritext.pointAt(2));
    expect(range?.text()).toBe("const");
    const range2 = editor.rangeWord(peritext.pointAt(9));
    expect(range2?.text()).toBe("editor");
    const range3 = editor.rangeWord(peritext.pointAt(20));
    expect(range3?.text()).toBe("setup");
  });

  test("can select punctuation", () => {
    const { editor, peritext } = setup((editor) => {
      editor.insert(
        "const {editor} = setup(editor => editor.insert('Hello world!'));"
      );
    });
    peritext.overlay.refresh();
    const range = editor.rangeWord(peritext.pointAt(6));
    expect(range?.text()).toBe("{");
    const range1 = editor.rangeWord(peritext.pointAt(30));
    expect(range1?.text()).toBe("=>");
  });

  test("can select punctuation at the end of text", () => {
    const { editor, peritext } = setup((editor) => {
      editor.insert(
        "const {editor} = setup(editor => editor.insert('Hello world!'));"
      );
    });
    peritext.overlay.refresh();
    const range = editor.rangeWord(peritext.pointAt(peritext.str.length() - 1));
    expect(range?.text()).toBe("!'));");
    const range2 = editor.rangeWord(
      peritext.pointAt(peritext.str.length() - 3)
    );
    expect(range2?.text()).toBe("!'));");
  });

  test("can select whitespace", () => {
    const { editor, peritext } = setup((editor) => {
      editor.insert(
        "const {editor} = setup(editor => editor.insert('Hello world!'));"
      );
    });
    peritext.overlay.refresh();
    const range = editor.rangeWord(peritext.pointAt(5));
    expect(range?.text()).toBe(" ");
  });
});

describe(".range()", () => {
  describe('.range(..., "word")', () => {
    test("can select a word", () => {
      const { editor, peritext } = setup((editor) => {
        editor.insert(
          "const {editor} = setup(editor => editor.insert('Hello world!'));"
        );
      });
      peritext.overlay.refresh();
      const range = editor.range(peritext.pointAt(2), "word");
      expect(range?.text()).toBe("const");
      const range2 = editor.range(peritext.pointAt(9), "word");
      expect(range2?.text()).toBe("editor");
      const range3 = editor.range(peritext.pointAt(20), "word");
      expect(range3?.text()).toBe("setup");
    });

    test("can select punctuation", () => {
      const { editor, peritext } = setup((editor) => {
        editor.insert(
          "const {editor} = setup(editor => editor.insert('Hello world!'));"
        );
      });
      peritext.refresh();
      const point = peritext.pointAt(6);
      const range = editor.range(point, "word");
      expect(range?.text()).toBe("{");
      const range1 = editor.range(peritext.pointAt(30), "word");
      expect(range1?.text()).toBe("=>");
    });

    test("can select punctuation at the end of text", () => {
      const { editor, peritext } = setup((editor) => {
        editor.insert(
          "const {editor} = setup(editor => editor.insert('Hello world!'));"
        );
      });
      peritext.overlay.refresh();
      const range = editor.range(
        peritext.pointAt(peritext.str.length() - 1),
        "word"
      );
      expect(range?.text()).toBe("!'));");
      const range2 = editor.range(
        peritext.pointAt(peritext.str.length() - 3),
        "word"
      );
      expect(range2?.text()).toBe("!'));");
    });

    test("can select whitespace", () => {
      const { editor, peritext } = setup((editor) => {
        editor.insert(
          "const {editor} = setup(editor => editor.insert('Hello world!'));"
        );
      });
      peritext.overlay.refresh();
      const range = editor.range(peritext.pointAt(5), "word");
      expect(range?.text()).toBe(" ");
    });
  });

  describe('.range(..., "block")', () => {
    test("can select paragraphs", () => {
      const { editor, peritext } = setup((editor) => {
        editor.insert("foobarbaz");
      });
      editor.cursor.setAt(6);
      editor.saved.insMarker(["p"]);
      editor.cursor.setAt(3);
      editor.saved.insMarker("p");
      peritext.refresh();
      const range1 = editor.range(peritext.pointAt(0), "block");
      expect(range1?.text()).toBe("foo");
      const range2 = editor.range(peritext.pointAt(5), "block");
      expect(range2?.text()).toBe("\nbar");
      const range3 = editor.range(peritext.pointAt(8), "block");
      expect(range3?.text()).toBe("\nbaz");
      const range4 = editor.range(
        peritext.pointAt(peritext.str.length() - 1),
        "block"
      );
      expect(range4?.text()).toBe("\nbaz");
      const range5 = editor.range(
        peritext.pointAt(peritext.str.length() - 1, Anchor.After),
        "block"
      );
      expect(range5?.text()).toBe("\nbaz");
    });
  });
});

describe(".selectAt()", () => {
  describe("can select a word at specific point", () => {
    test("can select a word", () => {
      const { editor } = setup((editor) => {
        editor.insert("abc def ghi");
      });
      editor.selectAt(5, "word");
      expect(editor.cursor.text()).toBe("def");
    });

    test("can select a line", () => {
      const { editor } = setup((editor) => {
        editor.insert("abc\ndef\nghi");
      });
      editor.selectAt(5, "line");
      expect(editor.cursor.text()).toBe("def");
    });

    test("can select a block", () => {
      const { editor, peritext } = setup((editor) => {
        editor.insert("abcdefghi");
        editor.cursor.setAt(6);
        editor.saved.insMarker(["p"]);
        editor.cursor.setAt(3);
        editor.saved.insMarker(["p"]);
      });
      peritext.refresh();
      editor.selectAt(5, "line");
      expect(editor.cursor.text()).toBe("def");
      peritext.refresh();
      editor.selectAt(5, "block");
      expect(editor.cursor.text()).toBe("\ndef");
    });
  });
});

describe(".setEndpoint()", () => {
  test("can set focus edge", () => {
    const { editor, peritext } = setup((editor) => {
      editor.insert(
        "const {editor} = setup(editor => editor.insert('Hello world!'));"
      );
    });
    const range = editor.rangeWord(peritext.pointAt(9))!;
    editor.cursor.setRange(range);
    expect(editor.cursor.text()).toBe("editor");
    expect(editor.cursor.anchorSide).toBe(CursorAnchor.Start);
    const focus1 = peritext.pointAt(20);
    editor.cursor.setEndpoint(focus1);
    expect(editor.cursor.text()).toBe("editor} = set");
    expect(editor.cursor.anchorSide).toBe(CursorAnchor.Start);
    const focus2 = peritext.pointAt(3);
    editor.cursor.setEndpoint(focus2);
    expect(editor.cursor.text()).toBe("st {");
    expect(editor.cursor.anchorSide).toBe(CursorAnchor.End);
    const focus3 = peritext.pointAt(9);
    editor.cursor.setEndpoint(focus3);
    expect(editor.cursor.text()).toBe("ed");
    expect(editor.cursor.anchorSide).toBe(CursorAnchor.Start);
    const focus4 = peritext.pointAt(7);
    editor.cursor.setEndpoint(focus4);
    expect(editor.cursor.text()).toBe("");
  });

  test("can set anchor edge", () => {
    const { editor, peritext } = setup((editor) => {
      editor.insert(
        "const {editor} = setup(editor => editor.insert('Hello world!'));"
      );
    });
    const range = editor.rangeWord(peritext.pointAt(9))!;
    editor.cursor.setRange(range);
    expect(editor.cursor.text()).toBe("editor");
    expect(editor.cursor.anchorSide).toBe(CursorAnchor.Start);
    const focus1 = peritext.pointAt(20);
    editor.cursor.setEndpoint(focus1, 1);
    expect(editor.cursor.text()).toBe("} = set");
    expect(editor.cursor.anchorSide).toBe(CursorAnchor.End);
    const focus2 = peritext.pointAt(3);
    editor.cursor.setEndpoint(focus2, 1);
    expect(editor.cursor.text()).toBe("st {editor");
    expect(editor.cursor.anchorSide).toBe(CursorAnchor.Start);
    const focus3 = peritext.pointAt(9);
    editor.cursor.setEndpoint(focus3, 1);
    expect(editor.cursor.text()).toBe("itor");
    expect(editor.cursor.anchorSide).toBe(CursorAnchor.Start);
    const focus4 = peritext.pointAt(7);
    editor.cursor.setEndpoint(focus4);
    expect(editor.cursor.text()).toBe("ed");
    expect(editor.cursor.anchorSide).toBe(CursorAnchor.End);
  });

  test("can extend selection to next word", () => {
    const { editor, peritext } = setup((editor) => {
      editor.insert(
        "const {editor} = setup(editor => editor.insert('Hello world!'));"
      );
    });
    const range = editor.rangeWord(peritext.pointAt(9))!;
    editor.cursor.setRange(range);
    expect(editor.cursor.text()).toBe("editor");
    expect(editor.cursor.anchorSide).toBe(CursorAnchor.Start);
    const focus = editor.cursor.focus();
    const point1 = editor.eow(focus);
    editor.cursor.setEndpoint(point1);
    expect(editor.cursor.text()).toBe("editor} = setup");
    expect(editor.cursor.anchorSide).toBe(CursorAnchor.Start);
  });
});
