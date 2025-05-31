import { s } from "../../../json-crdt-patch";
import { ModelWithExt as Model, ext } from "../../ModelWithExt";
import { NodeToViewRange } from "../NodeToViewRange";
import { node1 } from "./fixtures";
import { Node, Schema } from 'prosemirror-model';
import {doc, blockquote, h1, h2, p, em} from "prosemirror-test-builder";
import {ProseMirrorNode} from "../types";

describe("NodeToViewRange", () => {
  describe("convert()", () => {
    test("single text paragraph", () => {
      // const node = doc(p("a", em("b")), p("hello"), blockquote(h1("bye")));
      // console.log(node);
      // console.log(node.toJSON());
      const node = doc(p("hello")) as Node;
      const viewRange = NodeToViewRange.convert(node);
      // console.log(node);
      console.log(node.toJSON());
      console.log(viewRange);
      const model = Model.create(s.obj({
        prose: ext.prosemirror.new(''),
      }));
      console.log(model + '');
      // const prosemirror = model.api.in().asExt(ext.prosemirror);
      const prosemirror = model.s.prose.toExt();
      prosemirror.node.txt.editor.import(0, viewRange);
      const view = prosemirror.view();
      console.log(view);
    });

    test("can convert a two-block document", () => {
      const viewRange = NodeToViewRange.convert(node1);
      // console.log(JSON.stringify(viewRange, null, 2));
      const model = Model.create(
        s.obj({
          text: Model.ext.peritext.new(""),
        })
      );
      // console.log(model + '');
      const peritext = model.api.vec(["text"]).asExt(Model.ext.peritext);
      peritext.txt.editor.import(0, viewRange);
      peritext.txt.refresh();
      const html = peritext.txt.blocks.toJson();
      // console.log(JSON.stringify(html, null, 2));
      expect(html).toEqual([
        "",
        null,
        [
          "doc",
          null,
          ["heading", null, "Hello world"],
          [
            "blockquote",
            null,
            [
              "bullet_list",
              null,
              [
                "list_item",
                null,
                [
                  "paragraph",
                  null,
                  "This is a ",
                  [
                    "strong",
                    {
                      inline: true,
                    },
                    "Prose",
                  ],
                  [
                    "strong",
                    {
                      inline: true,
                    },
                    [
                      "em",
                      {
                        inline: true,
                      },
                      "Mirror",
                    ],
                  ],
                  " ",
                  [
                    "em",
                    {
                      inline: true,
                    },
                    "editor",
                  ],
                  " example.",
                ],
              ],
            ],
          ],
        ],
      ]);
      // console.log(peritext + '');
      const viewRange2 = peritext.txt.editor.export(peritext.txt.rangeAll()!);
      // console.log(JSON.stringify(viewRange2, null, 2));
      expect(viewRange2).toEqual(viewRange);
    });
  });
});
