import * as React from 'react';
import {useExplorer} from '../../context';
import {FileListItem} from '@jsonjoy.com/ui/lib/3-list-item/FileListItem';
import {Iconista, makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {BasicButtonDelete} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonDelete';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import type {FileMetadataDto} from '../../state/file';

const DownloadIcon = makeIcon({set: 'auth0', icon: 'download', width: 16, height: 16});
const GhostFileIcon = makeIcon({set: 'bootstrap', icon: 'file-earmark-binary', width: 16, height: 16});
const icon = <GhostFileIcon />;

const formatDate = (timestamp: number): string => {
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
};


export interface SavedFileProps {
  file: FileMetadataDto;
}

export const SavedFile: React.FC<SavedFileProps> = ({ file }) => {
  const state = useExplorer();
  const selected = state.tabs.selected.use();
  const activeIcon = <FileIcon id={file.id} label={'crdt'} size={20} />;
  const isOpen = state.isOpen(file.id);

  return (
    <FileListItem
      key={file.id}
      title={file.name}
      selected={selected?.[0].id === file.id}
      metadata={(
        <>
        {formatDate(file.updatedAt)} · {file.id}
        </>
      )}
      icon={isOpen ? activeIcon : icon}
      iconHover={activeIcon}
      actions={(
        <div style={{display: 'flex', alignItems: 'center'}}>
          <BasicButtonDelete tooltip size={28} rounder noOutline onConfirm={() => state.deleteSaved(file.id)} />
          <Popup renderContext={() => (
            <ContextMenu inset menu={{
              id: file.id,
              name: `file-${file.id}`,
              children: [
                isOpen ? ({
                  name: 'Close',
                  icon: () => <Iconista set="bootstrap" icon="x" width={16} height={16} />,
                  onSelect: () => state.close(file.id)
                } as MenuItem) : ({
                  name: 'Open',
                  icon: () => <Iconista set="vscode" icon="eye" width={16} height={16} />,
                  onSelect: () => state.openSaved(file.id).catch(() => {}),
                } as MenuItem),
                {
                  name: 'Download',
                  icon: () => <DownloadIcon />,
                  onSelect: async () => {
                    state.download(file.id).catch(() => {});
                  }
                },
              ],
            }} />
          )}>
            <BasicButtonMore tooltip size={28} rounder noOutline />
          </Popup>
        </div>
      )}
      onClick={() => state.openSaved(file.id).catch(() => {})}
    />
  );
};
