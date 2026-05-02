import {Editor, Element as SlateElement, Node, Range, type Path} from 'slate';

/**
 * Editor enhancer that fires `getOnSubmit()(titleText)` when the user
 * presses Enter while the caret is at the **end** of a `title` block.
 *
 * The callback is read through a getter on every break so callers can
 * update it on each render (via a ref) without recreating the editor.
 */
export const withTitleSubmit = <T extends Editor>(
  editor: T,
  getOnSubmit: () => ((title: string) => void) | undefined,
): T => {
  const {insertBreak} = editor;
  editor.insertBreak = () => {
    let titleText: string | undefined;
    const onSubmit = getOnSubmit();
    const selection = editor.selection;
    if (onSubmit && selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        at: selection,
        match: (node) => SlateElement.isElement(node) && (node as any).type === 'title',
        mode: 'lowest',
      });
      if (match) {
        const [titleNode, titlePath] = match as [SlateElement, Path];
        if (Editor.isEnd(editor, selection.anchor, titlePath)) {
          titleText = Node.string(titleNode);
        }
      }
    }
    insertBreak();
    if (titleText !== undefined && onSubmit) onSubmit(titleText);
  };
  return editor;
};
