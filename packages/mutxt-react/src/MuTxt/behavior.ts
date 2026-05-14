import {Editor, Element as SlateElement, Node, Path, Range, Transforms} from 'slate';
import {HistoryEditor} from 'slate-history';
import type {
  BlockFormat,
  CustomElement,
  ListElementType,
  MarkFormat,
  SlateTextAlign,
  ToolbarButtonDefinition,
} from './types';
import {removeLink} from './behavior/link';
import {isListType, LIST_TYPES} from './behavior/lists';

export {isListType, LIST_TYPES};

export const ALIGNMENTS: SlateTextAlign[] = ['left', 'center', 'right', 'justify'];
export const MARKS: MarkFormat[] = [
  'bg',
  'bold',
  'code',
  'del',
  'fg',
  'ins',
  'italic',
  'kbd',
  'mark',
  'overline',
  'spoiler',
  'strikethrough',
  'sub',
  'sup',
  'underline',
];

const isElement = (node: unknown): node is CustomElement => SlateElement.isElement(node);
const isFormattableBlock = (node: CustomElement): boolean => !isListType(node.type) && node.type !== 'embed';

export const isMarkActive = (editor: Editor, format: MarkFormat): boolean => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleMark = (editor: Editor, format: MarkFormat): void => {
  if (isMarkActive(editor, format)) Editor.removeMark(editor, format);
  else Editor.addMark(editor, format, true);
};

export const getActiveBlock = (editor: Editor): CustomElement | null => {
  const {selection} = editor;
  if (!selection) return null;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && Editor.isBlock(editor, node),
  });
  return (match as [CustomElement, number[]] | undefined)?.[0] ?? null;
};

export const isBlockActive = (editor: Editor, format: Exclude<BlockFormat, ListElementType>): boolean => {
  const {selection} = editor;
  if (!selection) return false;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && node.type === format,
  });
  return !!match;
};

const isAtEndOfBlock = (editor: Editor, format: Exclude<BlockFormat, ListElementType>): boolean => {
  const {selection} = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;
  const match = Editor.above(editor, {
    at: selection,
    match: (node) => isElement(node) && node.type === format,
    mode: 'lowest',
  });
  if (!match) return false;
  const [, path] = match;
  return Editor.isEnd(editor, selection.anchor, path);
};

export const isListActive = (editor: Editor, format: ListElementType): boolean => {
  const {selection} = editor;
  if (!selection) return false;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && node.type === format,
  });
  return !!match;
};

export const getActiveAlignment = (editor: Editor): SlateTextAlign => {
  const {selection} = editor;
  if (!selection) return 'left';
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
  });
  if (!match) return 'left';
  const [element] = match as [CustomElement, number[]];
  return (element as {align?: SlateTextAlign}).align ?? 'left';
};

export const isAlignmentActive = (editor: Editor, alignment: SlateTextAlign): boolean =>
  getActiveAlignment(editor) === alignment;

const unwrapLists = (editor: Editor): void => {
  Transforms.unwrapNodes(editor, {
    match: (node) => isElement(node) && isListType(node.type),
    split: true,
  });
};

export const getCurrentBlockEntry = (editor: Editor): [CustomElement, Path] | null => {
  const {selection} = editor;
  if (!selection) return null;
  const match = Editor.above(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && Editor.isBlock(editor, node),
    mode: 'lowest',
  });
  return (match as [CustomElement, Path] | undefined) ?? null;
};

const getCurrentListType = (editor: Editor): ListElementType | null => {
  const {selection} = editor;
  if (!selection) return null;
  const match = Editor.above(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && isListType(node.type),
    mode: 'lowest',
  });
  return match ? ((match[0] as CustomElement).type as ListElementType) : null;
};

export const toggleBlock = (editor: Editor, format: BlockFormat): void => {
  const isList = isListType(format);
  const isActive = isList ? isListActive(editor, format) : isBlockActive(editor, format);
  unwrapLists(editor);
  const nextType = isActive ? 'p' : isList ? 'li' : format;
  Transforms.setNodes(editor, {type: nextType} as Partial<CustomElement>, {
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
  });
  if (!isActive && isList) {
    Transforms.wrapNodes(editor, {type: format, children: []} as CustomElement, {
      match: (node) => isElement(node) && node.type === 'li',
    });
  }
  if (format === 'checklist' && !isActive) {
    Transforms.setNodes(editor, {checked: false} as Partial<CustomElement>, {
      match: (node) => isElement(node) && node.type === 'li',
    });
  } else {
    Transforms.unsetNodes(editor, 'checked', {
      match: (node) => isElement(node) && Editor.isBlock(editor, node) && !isListType(node.type),
    });
  }
};

export const setAlignment = (editor: Editor, alignment: SlateTextAlign): void => {
  const current = getActiveAlignment(editor);
  const shouldUnset = alignment === 'left' || current === alignment;

  if (shouldUnset) {
    Transforms.unsetNodes(editor, 'align', {
      match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
    });
    return;
  }

  Transforms.setNodes(editor, {align: alignment} as Partial<CustomElement>, {
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
  });
};

export const eraseMarks = (editor: Editor): void => {
  removeLink(editor);
  for (const mark of MARKS) Editor.removeMark(editor, mark);
};

export const setChecklistItemChecked = (editor: Editor, path: Path, checked: boolean): void => {
  Transforms.setNodes(editor, {checked} as Partial<CustomElement>, {
    at: path,
    match: (node) => isElement(node) && node.type === 'li',
  });
};

export const resetEmptyBlockToP = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;
  const entry = getCurrentBlockEntry(editor);
  if (!entry) return false;
  const [block] = entry;
  if (block.type === 'embed') return false;
  if (Node.string(block) !== '') return false;
  if (block.type === 'p') return false;
  if (block.type === 'li') {
    const listType = getCurrentListType(editor);
    if (!listType) {
      Transforms.setNodes(editor, {type: 'p'} as Partial<CustomElement>, {
        match: (node) => isElement(node) && Editor.isBlock(editor, node) && node.type === 'li',
      });
      return true;
    }
    toggleBlock(editor, listType);
    return true;
  }
  toggleBlock(editor, block.type as Exclude<BlockFormat, ListElementType>);
  return true;
};

export const isInRawTextBlock = (editor: Editor): boolean =>
  isBlockActive(editor, 'code-block') || isBlockActive(editor, 'pre');

export const insertCodeBlockBreak = (editor: Editor): boolean => {
  if (!isInRawTextBlock(editor)) return false;
  Editor.insertText(editor, '\n');
  return true;
};

export const insertCodeBlockExit = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection) return false;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && (node.type === 'code-block' || node.type === 'pre'),
  });
  if (!match) return false;
  const [, path] = match;
  const afterPath = Path.next(path);
  Transforms.insertNodes(editor, {type: 'p', children: [{text: ''}]} as CustomElement, {at: afterPath});
  Transforms.select(editor, afterPath);
  return true;
};

/**
 * If the caret is anywhere inside a `stepper` list, drop a fresh paragraph
 * after the list and move the caret there — an explicit way to "exit" the
 * stepper without having to land on an empty step.
 */
export const exitStepperList = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection) return false;
  const match = Editor.above(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && (node as CustomElement).type === 'stepper',
    mode: 'lowest',
  });
  if (!match) return false;
  const [, path] = match as [CustomElement, Path];
  const afterPath = Path.next(path);
  Transforms.insertNodes(editor, {type: 'p', children: [{text: ''}]} as CustomElement, {at: afterPath});
  Transforms.select(editor, afterPath);
  return true;
};

const isInStepperLi = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection) return false;
  const li = Editor.above(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && (node as CustomElement).type === 'li',
    mode: 'lowest',
  });
  if (!li) return false;
  const stepper = Editor.above(editor, {
    at: li[1],
    match: (node) => isElement(node) && (node as CustomElement).type === 'stepper',
    mode: 'lowest',
  });
  return !!stepper;
};

/**
 * If the caret is at the end of a code-block or pre block and the block's
 * text content already ends with `\n\n`, strip those trailing newlines and
 * exit the block into a new paragraph below.
 */
export const tryExitCodeBlockOnTripleEnter = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;
  const match = Editor.above(editor, {
    at: selection,
    match: (node) => isElement(node) && (node.type === 'code-block' || node.type === 'pre'),
    mode: 'lowest',
  });
  if (!match) return false;
  const [block, path] = match as [CustomElement, Path];
  if (!Editor.isEnd(editor, selection.anchor, path)) return false;
  if (!Node.string(block).endsWith('\n\n')) return false;
  Transforms.delete(editor, {distance: 2, unit: 'character', reverse: true});
  return insertCodeBlockExit(editor);
};

const HEADING_TYPES: ReadonlySet<string> = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'title', 'subtitle']);

/**
 * If the caret is at offset 0 of a block whose previous sibling is an empty
 * `<p>`, remove that empty paragraph.
 */
export const removeEmptyPrevP = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;
  const entry = getCurrentBlockEntry(editor);
  if (!entry) return false;
  const [, path] = entry;
  if (!Editor.isStart(editor, selection.anchor, path)) return false;
  if (!Path.hasPrevious(path)) return false;
  const prevPath = Path.previous(path);
  let prevNode: unknown;
  try {
    prevNode = Node.get(editor, prevPath);
  } catch {
    return false;
  }
  if (!isElement(prevNode)) return false;
  if (prevNode.type !== 'p') return false;
  if (Node.string(prevNode) !== '') return false;
  Transforms.removeNodes(editor, {at: prevPath});
  return true;
};

/**
 * Backspace at offset 0 of a non-empty heading, blockquote, callout, or list
 * item converts that block to a paragraph instead of merging with the
 * previous block. Empty blocks are handled by `resetEmptyBlockToP`.
 */
export const resetBlockToPAtStart = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;
  const entry = getCurrentBlockEntry(editor);
  if (!entry) return false;
  const [block, path] = entry;
  if (Node.string(block) === '') return false;
  if (!Editor.isStart(editor, selection.anchor, path)) return false;
  const isResettable =
    HEADING_TYPES.has(block.type) || block.type === 'blockquote' || block.type === 'callout' || block.type === 'li';
  if (!isResettable) return false;
  if (block.type === 'li') {
    const listType = getCurrentListType(editor);
    if (!listType) {
      Transforms.setNodes(editor, {type: 'p'} as Partial<CustomElement>, {
        match: (node) => isElement(node) && Editor.isBlock(editor, node) && node.type === 'li',
      });
      return true;
    }
    toggleBlock(editor, listType);
    return true;
  }
  toggleBlock(editor, block.type as Exclude<BlockFormat, ListElementType>);
  return true;
};

export const withCodeBlockBreaks = <T extends Editor>(editor: T): T => {
  const {insertBreak} = editor;
  editor.insertBreak = () => {
    if (tryExitCodeBlockOnTripleEnter(editor)) return;
    if (insertCodeBlockBreak(editor)) return;
    if (resetEmptyBlockToP(editor)) return;
    const activeBlock = getActiveBlock(editor);
    const inHeading = activeBlock && HEADING_TYPES.has(activeBlock.type);
    const inHeadingOrBlockquoteOrCallout = activeBlock && ['blockquote', 'callout'].includes(activeBlock.type);
    const atEndOfTitle = isAtEndOfBlock(editor, 'title');
    let convertPreviousSibling = false;
    if (inHeading || inHeadingOrBlockquoteOrCallout) {
      const entry = getCurrentBlockEntry(editor);
      const sel = editor.selection;
      if (entry && sel && Range.isCollapsed(sel)) {
        convertPreviousSibling = Editor.isStart(editor, sel.anchor, entry[1]);
      }
    }
    insertBreak();
    if (inHeading || inHeadingOrBlockquoteOrCallout) {
      const nextType: CustomElement['type'] = atEndOfTitle ? 'subtitle' : 'p';
      if (convertPreviousSibling) {
        const cursorEntry = getCurrentBlockEntry(editor);
        if (cursorEntry && Path.hasPrevious(cursorEntry[1])) {
          Transforms.setNodes(editor, {type: nextType} as Partial<CustomElement>, {
            at: Path.previous(cursorEntry[1]),
          });
        }
      } else {
        Transforms.setNodes(editor, {type: nextType} as Partial<CustomElement>);
      }
    }
  };

  // Inside a code-block or pre block, paste raw text.
  const reactEditor = editor as Editor & {insertData?: (data: DataTransfer) => void};
  const {insertData} = reactEditor;
  if (insertData) {
    reactEditor.insertData = (data: DataTransfer) => {
      if (isInRawTextBlock(editor)) {
        const text = data.getData('text/plain');
        if (text) {
          Editor.insertText(editor, text);
          return;
        }
      }
      insertData(data);
    };
  }
  return editor;
};

export const canUndo = (editor: Editor): boolean =>
  HistoryEditor.isHistoryEditor(editor) && editor.history.undos.length > 0;

export const canRedo = (editor: Editor): boolean =>
  HistoryEditor.isHistoryEditor(editor) && editor.history.redos.length > 0;

export const undo = (editor: Editor): void => {
  if (HistoryEditor.isHistoryEditor(editor)) editor.undo();
};

export const redo = (editor: Editor): void => {
  if (HistoryEditor.isHistoryEditor(editor)) editor.redo();
};

export const MARK_BUTTONS: ToolbarButtonDefinition<MarkFormat>[] = [
  {key: 'bold', title: 'Bold', iconSet: 'radix', icon: 'font-bold', shortcut: 'Cmd+B', format: 'bold'},
  {key: 'italic', title: 'Italic', iconSet: 'lucide', icon: 'italic', shortcut: 'Cmd+I', format: 'italic'},
  {key: 'underline', title: 'Underline', iconSet: 'tabler', icon: 'underline', shortcut: 'Cmd+U', format: 'underline'},
  {key: 'code', title: 'Inline code', iconSet: 'tabler', icon: 'code', shortcut: 'Cmd+E', format: 'code'},
];

export const ACTION_BUTTONS: ToolbarButtonDefinition[] = [
  {key: 'undo', title: 'Undo', iconSet: 'lucide', icon: 'undo', shortcut: 'Cmd+Z'},
  {key: 'redo', title: 'Redo', iconSet: 'lucide', icon: 'redo', shortcut: 'Cmd+Shift+Z'},
];
