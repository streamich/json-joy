import type {ProseMirrorJsonNode, ProseMirrorNode} from "../types";

export const doc1 = {
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": {
        "level": 1
      },
      "content": [
        {
          "type": "text",
          "text": "this is the footer for your site"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "asdfaasdf asdf"
        }
      ]
    }
  ]
} satisfies ProseMirrorJsonNode;

export const doc2 = {
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": {
        "level": 1
      },
      "content": [
        {
          "type": "text",
          "text": "Hello world"
        }
      ]
    },
    {
      "type": "blockquote",
      "content": [
        {
          "type": "bullet_list",
          "attrs": {
            "tight": true
          },
          "content": [
            {
              "type": "list_item",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "This is a "
                    },
                    {
                      "type": "text",
                      "marks": [
                        {
                          "type": "strong"
                        }
                      ],
                      "text": "Prose"
                    },
                    {
                      "type": "text",
                      "marks": [
                        {
                          "type": "em"
                        },
                        {
                          "type": "strong"
                        }
                      ],
                      "text": "Mirror"
                    },
                    {
                      "type": "text",
                      "text": " "
                    },
                    {
                      "type": "text",
                      "marks": [
                        {
                          "type": "em"
                        }
                      ],
                      "text": "editor"
                    },
                    {
                      "type": "text",
                      "text": " example."
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
} satisfies ProseMirrorJsonNode;

export const node1 = {
  "type": {
    "name": "doc"
  },
  "attrs": {},
  "content": {
    "content": [
      {
        "type": {
          "name": "heading"
        },
        "attrs": {
          "level": 1
        },
        "content": {
          "content": [
            {
              "type": {
                "name": "text"
              },
              "attrs": {},
              "content": {
                "content": []
              },
              "marks": [],
              "text": "Hello world"
            }
          ]
        },
        "marks": []
      },
      {
        "type": {
          "name": "blockquote"
        },
        "attrs": {},
        "content": {
          "content": [
            {
              "type": {
                "name": "bullet_list"
              },
              "attrs": {
                "tight": true
              },
              "content": {
                "content": [
                  {
                    "type": {
                      "name": "list_item"
                    },
                    "attrs": {},
                    "content": {
                      "content": [
                        {
                          "type": {
                            "name": "paragraph"
                          },
                          "attrs": {},
                          "content": {
                            "content": [
                              {
                                "type": {
                                  "name": "text"
                                },
                                "attrs": {},
                                "content": {
                                  "content": []
                                },
                                "marks": [],
                                "text": "This is a "
                              },
                              {
                                "type": {
                                  "name": "text"
                                },
                                "attrs": {},
                                "content": {
                                  "content": []
                                },
                                "marks": [
                                  {
                                    "type": {
                                      "name": "strong"
                                    },
                                    "attrs": {}
                                  }
                                ],
                                "text": "Prose"
                              },
                              {
                                "type": {
                                  "name": "text"
                                },
                                "attrs": {},
                                "content": {
                                  "content": []
                                },
                                "marks": [
                                  {
                                    "type": {
                                      "name": "em"
                                    },
                                    "attrs": {}
                                  },
                                  {
                                    "type": {
                                      "name": "strong"
                                    },
                                    "attrs": {}
                                  }
                                ],
                                "text": "Mirror"
                              },
                              {
                                "type": {
                                  "name": "text"
                                },
                                "attrs": {},
                                "content": {
                                  "content": []
                                },
                                "marks": [],
                                "text": " "
                              },
                              {
                                "type": {
                                  "name": "text"
                                },
                                "attrs": {},
                                "content": {
                                  "content": []
                                },
                                "marks": [
                                  {
                                    "type": {
                                      "name": "em"
                                    },
                                    "attrs": {}
                                  }
                                ],
                                "text": "editor"
                              },
                              {
                                "type": {
                                  "name": "text"
                                },
                                "attrs": {},
                                "content": {
                                  "content": []
                                },
                                "marks": [],
                                "text": " example."
                              }
                            ]
                          },
                          "marks": []
                        }
                      ]
                    },
                    "marks": []
                  }
                ]
              },
              "marks": []
            }
          ]
        },
        "marks": []
      }
    ]
  },
  "marks": []
} satisfies ProseMirrorNode;
