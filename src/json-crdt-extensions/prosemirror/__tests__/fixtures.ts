import { Node } from "prosemirror-model";
import { schema } from "prosemirror-test-builder";

export const fuzzer1 = Node.fromJSON(schema, {
  type: "doc",
  content: [
    {
      type: "ordered_list",
      attrs: {
        order: 1,
      },
      content: [
        {
          type: "list_item",
          content: [
            {
              type: "heading",
              attrs: {
                level: 2,
              },
              content: [
                {
                  type: "text",
                  text: "abc",
                },
              ],
            },
            {
            type: "ordered_list",
              attrs: {
                order: 1,
              },
              content: [
                {
                  type: "list_item",
                  content: [
                    {
                      type: "heading",
                      attrs: {
                        level: 2,
                      },
                      content: [
                        {
                          type: "text",
                          text: "abc",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});
