import * as React from 'react';
import {useExplorer} from '../../../context';
import {Bytes} from '@jsonjoy.com/ui/lib/1-inline/Bytes';
import {FileListItem} from '@jsonjoy.com/ui/lib/3-list-item/FileListItem';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {FileOptionsDrawer} from './FileOptionsDrawer';
import type {FileMetadataDto} from '../../../state/file';

const DownloadIcon = makeIcon({set: 'auth0', icon: 'download', width: 16, height: 16});
// const GhostFileIcon = makeIcon({set: 'bootstrap', icon: 'file-earmark-binary', width: 16, height: 16});
const GhostFileIcon = makeIcon({set: 'bootstrap', icon: 'file-earmark-font', width: 16, height: 16});
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

export const SavedFile: React.FC<SavedFileProps> = ({file}) => {
  const state = useExplorer();
  const selected = state.tabs.selected.use();
  const activeIcon = <FileIcon id={file.id} label={file.name} gradient accent size={20} />;
  const openFile = state.fileIfOpen(file.id);
  const isOpen = !!openFile;
  const [optionsOpen, setOptionsOpen] = React.useState(false);

  return (
    <>
      <FileListItem
        key={file.id}
        title={file.name}
        selected={selected?.[0].id === file.id}
        small={!isOpen}
        muted={!isOpen}
        metadata={
          isOpen ? (
            <>
              {formatDate(file.updatedAt)}
              {isOpen && ' · '}
              {!!openFile && <Bytes value={openFile.size} />}
            </>
          ) : undefined
        }
        icon={isOpen ? activeIcon : icon}
        iconHover={activeIcon}
        actions={
          <div style={{display: 'flex', alignItems: 'center'}}>
            <BasicButtonMore tooltip size={28} rounder noOutline onClick={() => setOptionsOpen(true)} />
          </div>
        }
        onClick={() => {
          state.openSaved(file.id).catch(() => {});
          state.appGrid.closeLeftIfOverlay();
        }}
      />
      <FileOptionsDrawer file={file} open={optionsOpen} onClose={() => setOptionsOpen(false)} />
    </>
  );
};
