import * as React from 'react';
import {useExplorer} from '../../../context';
import {Bytes} from '@jsonjoy.com/ui/lib/1-inline/Bytes';
import {TimeAgo} from '@jsonjoy.com/ui/lib/1-inline/TimeAgo';
import {FileListItem} from '@jsonjoy.com/ui/lib/3-list-item/FileListItem';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {FileOptionsForm2 as FileOptionsForm} from './FileOptionsForm2';
import type {FileMetadataDto} from '../../../state/file';
import GhostFileIcon__svg from 'iconista/lib/react/bootstrap/file-earmark-font';

const GhostFileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <GhostFileIcon__svg width={16} height={16} {...props} />
);
const icon = <GhostFileIcon />;

export interface SavedFileProps {
  file: FileMetadataDto;
}

export const SavedFile: React.FC<SavedFileProps> = ({file}) => {
  const state = useExplorer();
  const selected = state.tabs.selected.use();
  const activeIcon = <FileIcon id={file.id} label={file.name} gradient accent size={20} link={!!file.link} />;
  const openFile = state.fileIfOpen(file.id);
  const isOpen = !!openFile;

  return (
    <FileListItem
      key={file.id}
      title={file.name}
      selected={selected?.[0].id === file.id}
      small={!isOpen}
      muted={!isOpen}
      metadata={
        <>
          <TimeAgo value={file.updatedAt} live={Date.now() - file.updatedAt < 1000 * 60 * 45} />
          {!!openFile && (
            <>
              {' · '}
              <Bytes value={openFile.size} />
            </>
          )}
        </>
      }
      icon={isOpen ? activeIcon : icon}
      iconHover={activeIcon}
      actions={
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Popup renderContext={() => <FileOptionsForm file={file} />}>
            <BasicButtonMore tooltip size={28} rounder noOutline />
          </Popup>
        </div>
      }
      onClick={() => {
        state.openSaved(file.id).catch(() => {});
        state.appGrid.closeLeftIfOverlay();
      }}
    />
  );
};
