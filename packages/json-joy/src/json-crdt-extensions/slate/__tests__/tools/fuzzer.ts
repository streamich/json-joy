import {createEditor, Editor, Element, Transforms} from 'slate';
import type {
  SlateDocument,
  SlateDescendantNode,
  SlateElementNode,
  SlateTextNode,
  SlateRange,
  SlatePoint,
} from '../../types';

export type Rng = () => number;

export const createEmptyDocument = (): SlateDocument => [{type: 'paragraph', children: [{text: ''}]}];

export const createRng = (seed: number): Rng => {
  let m_w = seed;
  let m_z = 987654321 ^ seed;
  return () => {
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) | 0;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) | 0;
    let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
  };
};

class FlatNode {
  constructor(
    public readonly path: number[],
    public readonly node: SlateDescendantNode,
  ) {}
}

export const flatten = (doc: SlateDocument): FlatNode[] => {
  const nodes: FlatNode[] = [];
  const walk = (elements: SlateDescendantNode[], path: number[] = []) => {
    const length = elements.length;
    for (let i = 0; i < length; i++) {
      const node = elements[i];
      nodes.push(new FlatNode([...path, i], node));
      if (!('text' in node) && (node as SlateElementNode).children)
        walk((node as SlateElementNode).children, [...path, i]);
    }
  };
  walk(doc);
  return nodes;
};

export const pickRandomNode = (rng: Rng, doc: SlateDocument): FlatNode | undefined => {
  const nodes = flatten(doc);
  return nodes[Math.floor(rng() * nodes.length)];
};

/** Pick random integer between min (inclusive) and max (inclusive). */
const randomInt = (rng: Rng, min: number, max: number): number => {
  return Math.floor(rng() * (max - min + 1)) + min;
};

const randomText = (rng: Rng, length: number): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomInt(rng, 0, chars.length - 1));
  }
  return result;
};

const blockElementTypes: string[] = ['paragraph', 'h1', 'list-item', 'bulleted-list', 'numbered-list'];
const inlineFormattingMarks: string[] = ['bold', 'italic', 'underline', 'code'];

export class SlateFuzzer {
  public readonly rng: Rng;
  public readonly editor: Editor;

  constructor(
    public readonly seed: number = 123456789,
    editor?: Editor,
  ) {
    this.rng = createRng(seed);
    if (editor) {
      this.editor = editor;
    } else {
      this.editor = createEditor();
      this.editor.children = createEmptyDocument();
    }
  }

  private pick<T>(selection: T[]): T {
    return selection[randomInt(this.rng, 0, selection.length - 1)];
  }

  public getDocument(): SlateDocument {
    return this.editor.children as SlateDocument;
  }

  public generateRandomPoint(): SlatePoint | undefined {
    const doc = this.getDocument();
    const flatNodes = flatten(doc).filter((n) => 'text' in n.node);
    const index = randomInt(this.rng, 0, flatNodes.length - 1);
    const node = flatNodes[index] as FlatNode | undefined;
    if (!node) return;
    const maxOffset =
      'text' in node.node
        ? (node.node as SlateTextNode).text.length
        : 'children' in node.node
          ? (node.node as SlateElementNode).children.length
          : 0;
    const offset = randomInt(this.rng, 0, maxOffset);
    return {path: node.path, offset};
  }

  public generateRandomRange(): SlateRange | undefined {
    const anchor = this.generateRandomPoint();
    if (!anchor) return;
    const focus = this.rng() > 0.5 ? (this.generateRandomPoint() ?? anchor) : anchor;
    return {anchor, focus};
  }

  public setRandomSelection(): void {
    const range = this.generateRandomRange();
    if (!range) return;
    Transforms.select(this.editor, range);
  }

  public applyRandomHighLevelOperation() {
    this.setRandomSelection();
    const op = this.pick([
      () => {
        const text = randomText(this.rng, randomInt(this.rng, 1, 5));
        // console.log('insertText', text, this.editor.selection);
        this.editor.insertText(text);
      },
      () => {
        // console.log('delete', this.editor.selection);
        this.editor.delete();
      },
      () => {
        // console.log('splitNodes');
        this.editor.splitNodes();
      },
      () => {
        const mark = this.pick(inlineFormattingMarks);
        // console.log('addMark', mark);
        this.editor.addMark(mark, true);
      },
      () => {
        const mark = this.pick(inlineFormattingMarks);
        // console.log('removeMark', mark);
        this.editor.removeMark(mark);
      },
      () => {
        const type = this.pick(blockElementTypes);
        // console.log('setNodes - block type', type);
        const editor = this.editor;
        Transforms.setNodes(this.editor, {type} as any, {
          // Ensure we only target block-level elements, not text nodes
          match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
        });
      },
    ]);
    op();
  }
}
