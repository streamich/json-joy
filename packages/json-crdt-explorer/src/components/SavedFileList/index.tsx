import * as React from 'react';
import {useExplorer} from '../../context';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {FileListItem} from '@jsonjoy.com/ui/lib/3-list-item/FileListItem';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';

const icon = <Iconista set="bootstrap" icon="file-earmark-binary" width={16} height={16} />;

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) {
    return 'Just now';
  }
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  return date.toLocaleDateString();
}

export type SavedFileListProps = Record<string, never>;

export const SavedFileList: React.FC<SavedFileListProps> = () => {
  const state = useExplorer();
  const files = state.saved.use();
  const selected = state.tabs.selected.use();

  if (!files.length) return null;

  return (
    <>
      {files.map((file) => (
        <FileListItem
          key={file.id}
          title={file.name}
          selected={selected?.[0].id === file.id}
          metadata={(
            <>
            {formatDate(file.updatedAt)} · {file.id}
            </>
          )}
          icon={icon}
          actions={(
            <div style={{display: 'flex', alignItems: 'center'}}>
              <BasicButtonClose size={28} rounder noOutline title="Close" />
              <BasicButtonMore size={28} rounder noOutline title="More actions" />
            </div>
          )}
          onClick={() => state.openSaved(file.id).catch(() => {})}
        />
      ))}
    </>
  );
};
