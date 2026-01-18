import {createEditor, Transforms, type Editor} from 'slate';
import type {SlateDocument, SlateOperation} from '../../types';

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
  public static create(initialValue: SlateDocument = [{type: 'paragraph', children: [{text: ''}]}]): SlateTraceRecorder {
    const editor = createEditor();
    editor.children = clone(initialValue);
    return new SlateTraceRecorder(editor);
  }

  public readonly editor: Editor;
  public readonly start: SlateDocument;
  public readonly operations: SlateOperation[] = [];
  public readonly checkpoints: number[] = [];

  constructor(editor: Editor) {
    this.editor = editor;
    this.start = clone(editor.children as SlateDocument);
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
  public nextOpIdx: number = 0;
  public nextCheckpointIdx: number = 0;

  public static readonly from = (trace: SlateTrace): SlateTraceRunner => new SlateTraceRunner(trace);

  constructor(readonly trace: SlateTrace) {
    this.editor.children = clone(trace.start);
  }

  public readonly next = (): SlateOperation | undefined => {
    const operation = this.trace.operations[this.nextOpIdx++];
    if (!operation) return;
    Transforms.transform(this.editor, operation);
    return operation;
  };

  public runToEnd = (): void => {
    while (this.next());
  };

  public readonly toNextCheckpoint = (): void => {
    const checkpointIdx = this.trace.checkpoints[this.nextCheckpointIdx++];
    if (checkpointIdx === undefined) return;
    while (this.nextOpIdx < checkpointIdx) this.next();
    this.editor.normalize();
  };

  public endReached = (): boolean => {
    return this.nextCheckpointIdx >= this.trace.checkpoints.length;
  };

  public readonly state = (): SlateDocument => this.editor.children as SlateDocument;
}
