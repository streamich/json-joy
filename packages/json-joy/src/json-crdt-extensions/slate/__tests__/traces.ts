import {createEditor, Transforms} from 'slate';
import type {SlateDocument, SlateOperation} from '../types';

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export interface SlateTrace {
  start: SlateDocument;
  operations: SlateOperation[];
}

export class RunTrace {
  public readonly editor = createEditor();
  protected index: number = 0;

  public static readonly from = (trace: SlateTrace): RunTrace => new RunTrace(trace);

  constructor(readonly trace: SlateTrace) {
    this.editor.children = clone(trace.start);
  }

  public readonly next = (): SlateOperation | undefined => {
    const operation = this.trace.operations[this.index++];
    if (!operation) return;
    Transforms.transform(this.editor, operation);
    return operation;
  };

  public readonly state = (): SlateDocument => this.editor.children as SlateDocument;
}

export const variousOperations: SlateTrace = {
  start: [{type: 'paragraph', children: [{text: ''}]}],
  operations: [
    {
      type: 'set_selection',
      properties: null,
      newProperties: {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 0}},
    },
    {type: 'insert_text', path: [0, 0], offset: 0, text: 'Hello, world!'},
    {
      type: 'set_selection',
      properties: {anchor: {path: [0, 0], offset: 13}, focus: {path: [0, 0], offset: 13}},
      newProperties: {anchor: {path: [0, 0], offset: 5}, focus: {path: [0, 0], offset: 5}},
    },
    {type: 'insert_text', path: [0, 0], offset: 5, text: 'a'},
    {
      type: 'set_selection',
      properties: {anchor: {path: [0, 0], offset: 6}, focus: {path: [0, 0], offset: 6}},
      newProperties: {anchor: {path: [0, 0], offset: 7}, focus: {path: [0, 0], offset: 7}},
    },
    {type: 'split_node', path: [0, 0], position: 7, properties: {}},
    {type: 'split_node', path: [0], position: 1, properties: {type: 'paragraph'}},
    {
      type: 'set_selection',
      properties: {anchor: {path: [1, 0], offset: 0}, focus: {path: [1, 0], offset: 0}},
      newProperties: {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 7}},
    },
    {type: 'set_node', path: [0], properties: {}, newProperties: {indent: 2}},
    {
      type: 'set_selection',
      properties: {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 7}},
      newProperties: {anchor: {path: [1, 0], offset: 1}, focus: {path: [1, 0], offset: 6}},
    },
    {type: 'split_node', path: [1, 0], position: 6, properties: {}},
    {type: 'split_node', path: [1, 0], position: 1, properties: {}},
    {
      type: 'set_selection',
      properties: {focus: {path: [1, 2], offset: 0}},
      newProperties: {focus: {path: [1, 1], offset: 5}},
    },
    {type: 'set_node', path: [1, 1], properties: {}, newProperties: {bold: true}},
    {
      type: 'set_selection',
      properties: {anchor: {path: [1, 1], offset: 0}, focus: {path: [1, 1], offset: 5}},
      newProperties: {anchor: {path: [1, 2], offset: 0}, focus: {path: [1, 2], offset: 1}},
    },
    {type: 'set_node', path: [1, 2], properties: {}, newProperties: {highlighted: true}},
    {type: 'set_node', path: [1, 2], properties: {}, newProperties: {underline: true}},
    {type: 'remove_text', path: [1, 2], offset: 0, text: '!'},
    {type: 'remove_node', path: [1, 2], node: {text: '', highlighted: true}},
  ],
};
