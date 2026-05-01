import {ReactEditor} from 'slate-react';
import {s} from 'json-joy/lib/json-crdt';
import {insertFile} from './file';
import type {MuTxtState} from '../state/MuTxtState';

type InsertDataFn = (data: DataTransfer) => void;

/**
 * Patches `editor.insertData` so that pasting one or more images (e.g. a
 * screenshot from the clipboard) inserts `file` void blocks instead of
 * falling through to Slate's default HTML/text paste logic.
 */
export const bindImagePaste = (state: MuTxtState): void => {
  const editor = state.editor as any;
  const prev: InsertDataFn | undefined = editor.insertData;
  editor.insertData = (data: DataTransfer): void => {
    const images = collectImageFiles(data);
    if (images.length) void pasteImages(state, images);
    else prev?.call(editor, data);
  };
};

const collectImageFiles = (data: DataTransfer): File[] => {
  const fromFiles = Array.from(data.files).filter(f => f.type.startsWith('image/'));
  if (fromFiles.length) return fromFiles;
  return Array.from(data.items ?? [])
    .filter(item => item.type.startsWith('image/'))
    .map(item => item.getAsFile())
    .filter((f): f is File => f !== null);
};

const pasteImages = async (state: MuTxtState, files: File[]): Promise<void> => {
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const id = state.things.add({
      '@type': 'file',
      name: file.name || `image-${Date.now()}.png`,
      mimeType: file.type || 'image/png',
      size: file.size,
      data: s.con(bytes),
    } as any);
    if (!state.editor.selection)
      try { ReactEditor.focus(state.editor as ReactEditor); } catch {}
    insertFile(state.editor, id);
    state.sync(true);
  }
};
