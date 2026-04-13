import * as React from 'react';
import {Menu} from '@jsonjoy.com/ui/lib/4-card/Menu';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';

export type ExplorerMenuProps = Record<string, never>;

export const ExplorerMenu: React.FC<ExplorerMenuProps> = () => {
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);
  const selected = useBehaviorSubject(state.selected$);
  // const name = files.name.use();

  if (!files.length) return null;

  return (
    <Menu
      items={files.map((file) => ({
        key: file.id,
        menuItem: (
          <Split>
            <div>{file.name.value}</div>
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
        active: file.id === selected,
        onMouseDown: () => state.select(file.id),
      }))}
    />
  );
};
