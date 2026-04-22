import * as React from 'react';
import {useExplorer} from '../../../context';
import {SavedFile} from './SavedFile';

export type SavedFileListProps = Record<string, never>;

export const SavedFileList: React.FC<SavedFileListProps> = () => {
  const state = useExplorer();
  const files = state.saved.use();

  if (!files.length) return null;

  return (
    <>
      {files.map((file) => (
        <SavedFile key={file.id} file={file} />
      ))}
    </>
  );
};
