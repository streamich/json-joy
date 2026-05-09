import * as React from 'react';
import {useExplorer} from '../../../context';
import {Bytes} from '@jsonjoy.com/ui/lib/1-inline/Bytes';
import {TimeAgo} from '@jsonjoy.com/ui/lib/1-inline/TimeAgo';
import {FileListItem} from '@jsonjoy.com/ui/lib/3-list-item/FileListItem';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {FileOptionsForm} from './FileOptionsForm';
import type {FileMetadataDto} from '../../../state/file';

const GhostFileIcon = makeIcon({set: 'bootstrap', icon: 'file-earmark-font', width: 16, height: 16});
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
          <Popup
            renderContext={({onEsc}) => (
              <ContextMenu
                inset
                onEsc={onEsc}
                menu={{
                  name: file.name,
                  minWidth: 360,
                  children: [
                    {
                      name: 'file-options',
                      raw: () => <FileOptionsForm file={file} />,
                    },
                  ],
                }}
              />
            )}
          >
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
