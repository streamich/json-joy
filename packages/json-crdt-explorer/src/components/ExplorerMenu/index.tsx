import * as React from 'react';
import {Menu} from '@jsonjoy.com/ui/lib/4-card/Menu';
import {useExplorer} from '../../context';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ContextMenu';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';

export type ExplorerMenuProps = Record<string, never>;

export const ExplorerMenu: React.FC<ExplorerMenuProps> = () => {
  const state = useExplorer();
  const files = state.saved.use();
  const selected = state.tabs.selected.use();
  // const name = files.name.use();

  if (!files.length) return null;

  return (
    <>
      <Menu
        items={files.map((file) => ({
          key: file.id,
          menuItem: (
            <Split>
              <div>{file.name}</div>
              <div>
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  style={{margin: '-6px 0', padding: '4px 0 0'}}
                >
                  <BasicButtonClose comp="span" onClick={() => state.close(file.id)} />
                </div>
              </div>
            </Split>
          ),
          active: file.id === selected?.[0].id,
          onMouseDown: () => state.select(file.id),
        }))}
      />
      <ContextMenu pane={{style: {width: '100%'}}} menu={{
        name: 'files',
        children: files.map((file) => ({
          id: file.id,
          name: file.name,
          onSelect: () => state.select(file.id),
          icon: () => <FileIcon id={file.id} label={'crdt'} />
        })),
      }} />
    </>
  );
};
