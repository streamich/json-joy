import * as React from 'react';
import {useT} from 'use-t';
import {useExplorer} from '../../../context';
import {SavedFile} from './SavedFile';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';

export type SavedFileListProps = Record<string, never>;

export const SavedFileList: React.FC<SavedFileListProps> = () => {
  const [t] = useT();
  const state = useExplorer();
  const files = state.saved.use();

  if (!files.length) return null;

  return (
    <>
      <div style={{margin: '-6px 8px 4px 0', textAlign: 'right'}}>
        <MiniTitle contrast>{t('Saved Files')}</MiniTitle>
      </div>
      {files.map((file) => (
        <SavedFile key={file.id} file={file} />
      ))}
    </>
  );
};
