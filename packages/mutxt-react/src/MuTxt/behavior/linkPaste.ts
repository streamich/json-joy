import {Editor, Range} from 'slate';
import {upsertLink} from './link';

const URL_REGEX = /^https?:\/\/\S+$/i;

const isInRawTextBlock = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection) return false;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node: any) => node?.type === 'code-block' || node?.type === 'pre',
  });
  return !!match;
};

/**
 * When a URL is pasted while a non-empty range is selected, attach the URL
 * as a link to the selected text instead of replacing it.
 */
export const withLinkPaste = <T extends Editor>(editor: T): T => {
  const reactEditor = editor as Editor & {insertData?: (data: DataTransfer) => void};
  const {insertData} = reactEditor;
  if (!insertData) return editor;
  reactEditor.insertData = (data: DataTransfer) => {
    const {selection} = editor;
    if (selection && !Range.isCollapsed(selection) && !isInRawTextBlock(editor)) {
      const text = data.getData('text/plain').trim();
      if (text && URL_REGEX.test(text)) {
        upsertLink(editor, text);
        return;
      }
    }
    insertData(data);
  };
  return editor;
};
