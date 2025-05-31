import {s} from '../../../json-crdt-patch';
import {ModelWithExt} from '../../ModelWithExt';
import {NodeToViewRange} from '../convert';
import {node1} from "./fixtures";

describe('toViewRange()', () => {
  test('can convert a two-block document', () => {
    const viewRange = NodeToViewRange.convert(node1);
    // console.log(JSON.stringify(viewRange, null, 2));
    const model = ModelWithExt.create(s.obj({
      text: ModelWithExt.ext.peritext.new(''),
    }));
    // console.log(model + '');
    const peritext = model.api.vec(['text']).asExt(ModelWithExt.ext.peritext);
    peritext.txt.editor.import(0, viewRange);
    peritext.txt.refresh();
    const html = peritext.txt.blocks.toJson();
    console.log(JSON.stringify(html, null, 2));
    expect(html).toEqual([
      "",
      null,
      [
        "doc",
        null,
        [
          "heading",
          null,
          "Hello world"
        ],
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
                    "inline": true
                  },
                  "Prose"
                ],
                [
                  "strong",
                  {
                    "inline": true
                  },
                  [
                    "em",
                    {
                      "inline": true
                    },
                    "Mirror"
                  ]
                ],
                " ",
                [
                  "em",
                  {
                    "inline": true
                  },
                  "editor"
                ],
                " example."
              ]
            ]
          ]
        ]
      ]
    ]);
    // console.log(peritext + '');
    const viewRange2 = peritext.txt.editor.export(peritext.txt.rangeAll()!);
    // console.log(JSON.stringify(viewRange2, null, 2));
    expect(viewRange2).toEqual(viewRange);
  });
});
