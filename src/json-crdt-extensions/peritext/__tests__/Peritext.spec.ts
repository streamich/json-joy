import { Model } from "../../../json-crdt/model";
import { Peritext } from "../Peritext";
import { Anchor } from "../rga/constants";
import {
  type Kit,
  setupHelloWorldKit,
  setupHelloWorldWithFewEditsKit,
} from "./setup";

const run = (setup: () => Kit) => {
  test("can run .refresh() on empty state", () => {
    const model = Model.withLogicalClock();
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
    peritext.refresh();
  });

  test("can insert a slice", () => {
    const { peritext, model } = setup();
    peritext.editor.cursor.setAt(4, 5);
    peritext.editor.saved.insMarker("bold", { bold: true });
    model.api.apply();
    const slices = model.s.text.toExt().slices().view();
    expect(slices).toMatchObject([
      [
        expect.any(Number),
        expect.any(Object),
        expect.any(Number),
        "bold",
        { bold: true },
      ],
    ]);
  });

  describe("cursor", () => {
    test("by default cursor is a collapsed caret", () => {
      const { peritext } = setup();
      const text = peritext.editor.cursor.text();
      expect(text).toBe("");
    });

    test("can select a local range and get text representation of it", () => {
      const { peritext } = setup();
      peritext.editor.cursor.setAt(0, 5);
      const text = peritext.editor.cursor.text();
      expect(text).toBe("hello");
    });

    test("can select first character", () => {
      const { peritext } = setup();
      peritext.editor.cursor.setAt(0, 1);
      const text = peritext.editor.cursor.text();
      expect(text).toBe("h");
    });

    test("can select second character", () => {
      const { peritext } = setup();
      peritext.editor.cursor.setAt(1, 1);
      const text = peritext.editor.cursor.text();
      expect(text).toBe("e");
    });

    test("can select character one before last", () => {
      const { peritext, model } = setup();
      const text1 = (model.view() as any).text as string;
      peritext.editor.cursor.setAt(text1.length - 2, 1);
      const text2 = peritext.editor.cursor.text();
      expect(text2).toBe("l");
    });

    test("can select last character", () => {
      const { peritext, model } = setup();
      const text1 = (model.view() as any).text as string;
      peritext.editor.cursor.setAt(text1.length - 1, 1);
      const text2 = peritext.editor.cursor.text();
      expect(text2).toBe("d");
    });

    test("can select the whole text", () => {
      const { peritext, model } = setup();
      const text1 = (model.view() as any).text as string;
      peritext.editor.cursor.setAt(0, text1.length);
      const text2 = peritext.editor.cursor.text();
      expect(text2).toBe(text1);
    });

    test("can set an empty (caret) selection", () => {
      const { peritext } = setup();
      peritext.editor.cursor.setAt(1);
      peritext.editor.insert("!");
      expect(peritext.str.view()).toBe("h!ello world");
      peritext.editor.cursor.setAt(1);
      peritext.editor.insert("?");
      expect(peritext.str.view()).toBe("h?!ello world");
      peritext.editor.cursor.setAt(1);
      peritext.editor.insert("+");
      expect(peritext.str.view()).toBe("h+?!ello world");
      peritext.editor.cursor.setAt(2);
      peritext.editor.insert("GG");
      expect(peritext.str.view()).toBe("h+GG?!ello world");
    });

    test("can set an empty (caret) selection at the end of the string", () => {
      const { peritext } = setup();
      peritext.editor.cursor.setAt(peritext.str.length());
      peritext.editor.insert("!");
      expect(peritext.str.view()).toBe("hello world!");
      peritext.editor.insert("?");
      expect(peritext.str.view()).toBe("hello world!?");
      peritext.editor.cursor.setAt(peritext.str.length() - 1);
      peritext.editor.insert("+");
      expect(peritext.str.view()).toBe("hello world!+?");
    });
  });

  describe(".collapseSelection()", () => {
    test("does nothing when selection is already collapsed", () => {
      const { peritext, model } = setup();
      const { editor } = peritext;
      expect(editor.cursor.isCollapsed()).toBe(true);
      editor.collapseCursors();
      expect(editor.cursor.isCollapsed()).toBe(true);
      expect((model.view() as any).text).toBe("hello world");
    });

    test("removes text that was selected", () => {
      const { peritext, model } = setup();
      const { editor } = peritext;
      editor.cursor.setAt(2, 3);
      expect(editor.cursor.isCollapsed()).toBe(false);
      editor.collapseCursors();
      expect(editor.cursor.isCollapsed()).toBe(true);
      expect((model.view() as any).text).toBe("he world");
    });

    test("can collapse at the beginning of string twice", () => {
      const { peritext, model } = setup();
      const { editor } = peritext;
      peritext.editor.cursor.setAt(0, 1);
      expect(editor.cursor.isCollapsed()).toBe(false);
      editor.collapseCursors();
      expect(editor.cursor.isCollapsed()).toBe(true);
      expect((model.view() as any).text).toBe("ello world");
      editor.cursor.setAt(0, 1);
      expect(editor.cursor.isCollapsed()).toBe(false);
      editor.collapseCursors();
      expect(editor.cursor.isCollapsed()).toBe(true);
      expect((model.view() as any).text).toBe("llo world");
    });

    test("can collapse at the end of string twice", () => {
      const { peritext, model } = setup();
      const { editor } = peritext;
      editor.cursor.setAt(peritext.str.length() - 1, 1);
      expect(editor.cursor.isCollapsed()).toBe(false);
      editor.collapseCursors();
      expect(editor.cursor.isCollapsed()).toBe(true);
      expect((model.view() as any).text).toBe("hello worl");
      peritext.editor.cursor.setAt(peritext.str.length() - 1, 1);
      expect(editor.cursor.isCollapsed()).toBe(false);
      editor.collapseCursors();
      expect(editor.cursor.isCollapsed()).toBe(true);
      expect((model.view() as any).text).toBe("hello wor");
    });

    test("can collapse the whole string", () => {
      const { peritext, model } = setup();
      const { editor } = peritext;
      editor.cursor.setAt(0, peritext.str.length());
      expect(editor.cursor.isCollapsed()).toBe(false);
      editor.collapseCursors();
      expect(editor.cursor.isCollapsed()).toBe(true);
      expect((model.view() as any).text).toBe("");
      editor.insert("abc");
      expect((model.view() as any).text).toBe("abc");
    });
  });

  describe(".nextId()", () => {
    test("returns next char ID when cursor at string start", () => {
      const { peritext, model } = setup();
      const { editor } = peritext;
      expect(editor.cursor.start.id).toStrictEqual(peritext.str.id);
      const nextId = editor.cursor.start.nextId()!;
      editor.cursor.setAfter(nextId);
      editor.insert("!");
      expect((model.view() as any).text).toBe("h!ello world");
    });

    test("can walk all the way to string end", () => {
      const { peritext, model } = setup();
      const { editor } = peritext;
      expect(editor.cursor.start.id).toStrictEqual(peritext.str.id);
      const nextId = editor.cursor.start.nextId()!;
      editor.cursor.setAfter(nextId);
      editor.insert("!");
      expect((model.view() as any).text).toBe("h!ello world");
      editor.insert("?");
      expect((model.view() as any).text).toBe("h!?ello world");
      editor.cursor.setAfter(editor.cursor.start.nextId()!);
      editor.insert(".");
      expect((model.view() as any).text).toBe("h!?e.llo world");
      editor.cursor.setAfter(editor.cursor.start.nextId()!);
      editor.cursor.setAfter(editor.cursor.start.nextId()!);
      editor.cursor.setAfter(editor.cursor.start.nextId()!);
      editor.cursor.setAfter(editor.cursor.start.nextId()!);
      editor.cursor.setAfter(editor.cursor.start.nextId()!);
      editor.insert("#");
      expect((model.view() as any).text).toBe("h!?e.llo w#orld");
      editor.cursor.setAfter(editor.cursor.start.nextId()!);
      editor.cursor.setAfter(editor.cursor.start.nextId()!);
      editor.cursor.setAfter(editor.cursor.start.nextId()!);
      editor.cursor.setAfter(editor.cursor.start.nextId()!);
      editor.insert("+");
      expect((model.view() as any).text).toBe("h!?e.llo w#orld+");
    });
  });

  describe(".insert()", () => {
    test("can insert at caret position", () => {
      const { peritext, model } = setup();
      const { editor } = peritext;
      editor.insert("H");
      expect((model.view() as any).text).toBe("Hhello world");
    });

    test("can insert text in when cursor is range", () => {
      const { peritext, model } = setup();
      const { editor } = peritext;
      const firstCharId = peritext.str.find(0)!;
      editor.cursor.set(
        peritext.point(firstCharId, Anchor.Before),
        peritext.point(firstCharId, Anchor.After)
      );
      editor.insert("H");
      expect((model.view() as any).text).toBe("Hello world");
    });
  });

  describe("deletions", () => {
    test("does nothing when deleting at the start of a string", () => {
      const { peritext } = setup();
      const { editor } = peritext;
      editor.del();
      expect(peritext.str.view()).toBe("hello world");
    });

    test("can delete one character at the beginning of a string", () => {
      const { peritext } = setup();
      const { editor } = peritext;
      editor.cursor.setAt(1);
      editor.del();
      expect(peritext.str.view()).toBe("ello world");
      editor.del();
      expect(peritext.str.view()).toBe("ello world");
      editor.del();
      expect(peritext.str.view()).toBe("ello world");
    });

    test("can delete two characters at the beginning of a string", () => {
      const { peritext } = setup();
      const { editor } = peritext;
      editor.cursor.setAt(2);
      editor.del();
      expect(peritext.str.view()).toBe("hllo world");
      editor.del();
      expect(peritext.str.view()).toBe("llo world");
      editor.del();
      expect(peritext.str.view()).toBe("llo world");
    });

    test("can delete a range selection", () => {
      const { peritext } = setup();
      const { editor } = peritext;
      editor.cursor.setAt(2, 3);
      editor.del();
      expect(peritext.str.view()).toBe("he world");
      editor.del();
      expect(peritext.str.view()).toBe("h world");
      editor.del();
      expect(peritext.str.view()).toBe(" world");
      editor.del();
      expect(peritext.str.view()).toBe(" world");
    });
  });
};

describe('no edits "hello world"', () => {
  run(setupHelloWorldKit);
});

describe('some edits "hello world"', () => {
  run(setupHelloWorldWithFewEditsKit);
});
