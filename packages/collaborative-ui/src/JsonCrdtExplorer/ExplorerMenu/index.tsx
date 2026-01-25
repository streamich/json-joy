import * as React from 'react';
import {Menu} from 'nice-ui/lib/4-card/Menu';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../context';
import {Split} from 'nice-ui/lib/3-list-item/Split';
import {NiceUiSizes} from 'nice-ui/lib/constants';
import {BasicButtonClose} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonClose';

export type ExplorerMenuProps = Record<string, never>;

export const ExplorerMenu: React.FC<ExplorerMenuProps> = () => {
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);
  const selected = useBehaviorSubject(state.selected$);

  if (!files.length) return null;

  return (
    <Menu
      style={{width: NiceUiSizes.SidebarWidth}}
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
                <BasicButtonClose onClick={() => state.close(file.id)} />
              </div>
            </div>
          </Split>
        ),
        active: file.id === selected,
        onMouseDown: () => state.select(file.id),
      }))}
    />
  );
};
