import {createEditor, Transforms, type Editor} from 'slate';
import type {SlateDocument, SlateOperation} from '../types';

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export interface SlateTrace {
  start: SlateDocument;
  operations: SlateOperation[];

  /**
   * High-level Slate.js operations are often composed of multiple low-level
   * atomic operations. All the atomic operations are stored in the `operations`
   * array, this array records the indices in `operations` where each high-level
   * operation (most likely) begins. It records the index of the next operation
   * when Slate `.normalize()` is called, which usually happens after each
   * high-level operation.
   */
  checkpoints: number[];
}

export class SlateTraceRecorder {
  public readonly editor: Editor;
  public readonly start: SlateDocument;
  public readonly operations: SlateOperation[] = [];
  public readonly checkpoints: number[] = [];

  constructor(initialValue: SlateDocument = [{type: 'paragraph', children: [{text: ''}]}]) {
    this.start = clone(initialValue);
    this.editor = createEditor();
    this.editor.children = initialValue;
    const {apply, normalizeNode} = this.editor;

    // 1. Capture every operation into our permanent log
    this.editor.apply = (op: any) => {
      this.operations.push(clone(op)); // Clone op to prevent reference issues
      apply(op);
    };

    // 2. Mark high-level boundaries
    this.editor.normalizeNode = (entry) => {
      const [, path] = entry;
      if (path.length === 0) {
        // Record where the NEXT batch of operations will begin
        this.checkpoints.push(this.operations.length);
      }
      normalizeNode(entry);
    };
  }

  public getTrace(): SlateTrace {
    return {
      start: this.start,
      operations: this.operations,
      checkpoints: this.checkpoints,
    };
  }
}

export class SlateTraceRunner {
  public readonly editor = createEditor();
  protected index: number = 0;

  public static readonly from = (trace: SlateTrace): SlateTraceRunner => new SlateTraceRunner(trace);

  constructor(readonly trace: SlateTrace) {
    this.editor.children = clone(trace.start);
  }

  public readonly next = (): SlateOperation | undefined => {
    const operation = this.trace.operations[this.index++];
    if (!operation) return;
    Transforms.transform(this.editor, operation);
    return operation;
  };

  public runToEnd = (): void => {
    while (this.next());
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
      newProperties: {anchor: {path: [0, 0], offset: 1}, focus: {path: [0, 0], offset: 1}},
    },
    {type: 'insert_text', path: [0, 0], offset: 1, text: 'a'},
    {type: 'remove_text', path: [0, 0], offset: 2, text: 'e'},
    {
      type: 'set_selection',
      properties: {anchor: {path: [0, 0], offset: 2}, focus: {path: [0, 0], offset: 2}},
      newProperties: {anchor: {path: [0, 0], offset: 6}, focus: {path: [0, 0], offset: 6}},
    },
    {type: 'split_node', path: [0, 0], position: 6, properties: {}},
    {type: 'split_node', path: [0], position: 1, properties: {type: 'paragraph'}},
    {
      type: 'set_selection',
      properties: {anchor: {path: [1, 0], offset: 0}, focus: {path: [1, 0], offset: 0}},
      newProperties: {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 6}},
    },
    {type: 'set_node', path: [0], properties: {}, newProperties: {indent: 2}},
    {
      type: 'set_selection',
      properties: {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 6}},
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
    {type: 'remove_text', path: [1, 2], offset: 0, text: '!'},
    {type: 'remove_node', path: [1, 2], node: {text: '', highlighted: true}},
    {
      type: 'set_selection',
      properties: {anchor: {path: [1, 1], offset: 5}, focus: {path: [1, 1], offset: 5}},
      newProperties: {anchor: {path: [1, 0], offset: 0}, focus: {path: [1, 0], offset: 1}},
    },
    {type: 'remove_text', path: [1, 0], offset: 0, text: ' '},
    {type: 'remove_node', path: [1, 0], node: {text: ''}},
    {
      type: 'set_selection',
      properties: {anchor: {path: [1, 0], offset: 0}, focus: {path: [1, 0], offset: 0}},
      newProperties: {anchor: {path: [0, 0], offset: 1}, focus: {path: [0, 0], offset: 2}},
    },
    {type: 'split_node', path: [0, 0], position: 2, properties: {}},
    {type: 'split_node', path: [0, 0], position: 1, properties: {}},
    {
      type: 'set_selection',
      properties: {focus: {path: [0, 2], offset: 0}},
      newProperties: {focus: {path: [0, 1], offset: 1}},
    },
    {type: 'set_node', path: [0, 1], properties: {}, newProperties: {highlighted: true}},
  ],
  checkpoints: [2, 4, 5, 8, 10, 15, 17, 19, 22, 27],
};
