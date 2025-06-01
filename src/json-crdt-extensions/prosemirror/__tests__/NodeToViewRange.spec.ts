import { s } from "../../../json-crdt-patch";
import { ModelWithExt as Model, ext } from "../../ModelWithExt";
import { NodeToViewRange } from "../NodeToViewRange";
import { Node } from "prosemirror-model";
import { schema, doc, blockquote, p, em, strong, eq, h2, h1} from "prosemirror-test-builder";

describe("NodeToViewRange", () => {
  describe("convert()", () => {
    test("single text paragraph", () => {
      const node = doc(p("hello")) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(
        s.obj({
          prose: ext.prosemirror.new(""),
        })
      );
      const prosemirror = model.s.prose.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
    });

    test("single text paragraph with a single inline formatting", () => {
      const node = doc(p('Text: ', strong('bold'), '!')) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
    });

    test("single text paragraph wrapped in inline formatting", () => {
      const node = doc(p(strong('bold'))) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
    });

    test("<strong> inside <em>", () => {
      const node = doc(p(em(strong('bold')))) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
    });

    test("<em> inside <strong>", () => {
      const node = doc(p(strong(em('bold')))) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
    });

    test("two <paragraph>", () => {
      const node = doc(p('paragraph 1'), p('paragraph 2')) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
    });

    test("<paragraph> and <blockquote>", () => {
      const node = doc(p('paragraph 1'), blockquote('blockquote 2')) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
    });

    test("two <paragraph> in <blockquote>", () => {
      const node = doc(
        blockquote(p('paragraph 1'), p('paragraph 2'))) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
    });

    test("two <blockquote> with <paragraph> each", () => {
      const node = doc(
        blockquote(p('paragraph 1')),
        blockquote(p('paragraph 2')), 
      ) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
    });

    test("three <blockquote> with <paragraph> each", () => {
      const node = doc(
        blockquote(p('paragraph 1')),
        blockquote(p('paragraph 2')), 
        blockquote(p('paragraph 3')), 
      ) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
      const node2 = Node.fromJSON(schema, view);
      expect(eq(node, node2)).toBe(true);
    });

    test("empty paragraphs", () => {
      const node = doc(p(), p()) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
      const node2 = Node.fromJSON(schema, view);
      expect(eq(node, node2)).toBe(true);
    });

    test("block element <h2> with attributes", () => {
      const node = doc(h2('hello world')) as Node;
      const viewRange = NodeToViewRange.convert(node);
      // console.log(JSON.stringify(node.toJSON(), null, 2));
      // console.log(JSON.stringify(viewRange, null, 2));
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      // console.log(JSON.stringify(view, null, 2));
      expect(view).toEqual(node.toJSON());
      const node2 = Node.fromJSON(schema, view);
      expect(eq(node, node2)).toBe(true);
    });

    test("discriminant two levels deep", () => {
      const node = doc(
        blockquote(
          blockquote(p('paragraph 1')),
          blockquote(p('paragraph 2')), 
        ),
        blockquote(
          blockquote(p('paragraph 1')),
          blockquote(p('paragraph 2')), 
          blockquote(p('paragraph 3')), 
        ), 
        blockquote(
          blockquote(p('paragraph 1')),
          blockquote(p('paragraph 2')),
        ), 
      ) as Node;
      const viewRange = NodeToViewRange.convert(node);
      // console.log(JSON.stringify(node.toJSON(), null, 2));
      // console.log(JSON.stringify(viewRange, null, 2));
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      // console.log(prosemirror.node.txt + '');
      const view = prosemirror.view();
      // console.log(JSON.stringify(view, null, 2));
      expect(view).toEqual(node.toJSON());
    });

    test("can convert a two-block document", () => {
      const node = doc(
        h1("Hello world"),
        blockquote(
          p(
            "This is a ",
            strong("Prose"),
            strong(em("Mirror")),
            " editor example.",
          )
        )
      ) as Node;
      const viewRange = NodeToViewRange.convert(node);
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      expect(view).toEqual(node.toJSON());
      const node2 = Node.fromJSON(schema, view);
      expect(eq(node, node2)).toBe(true);
    });
  });
});
