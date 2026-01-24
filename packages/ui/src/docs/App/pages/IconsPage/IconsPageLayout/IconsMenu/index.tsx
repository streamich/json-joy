import * as React from 'react';
import {Menu} from '../../../../../../4-card/Menu';
import {useIconsGrid} from '../context';
import {useBehaviorSubject} from '../../../../../../hooks/useBehaviorSubject';
import {Split} from '../../../../../../3-list-item/Split';
import {Code} from '../../../../../../1-inline/Code';
import {Sidetip} from '../../../../../../1-inline/Sidetip';

export interface IconsMenuProps {
  steps: string[];
}

export const IconsMenu: React.FC<IconsMenuProps> = ({steps}) => {
  const state = useIconsGrid();
  const sets = useBehaviorSubject(state.sets$);
  const icons = useBehaviorSubject(state.icons$);

  const setsFiltered = sets.filter((set) => !!icons.get(set)?.length);
  if (!setsFiltered.length) return null;

  return (
    <div>
      <Menu
        items={[
          {
            key: 'all',
            to: '/icons/all',
            menuItem: 'Show all',
            active: !steps[0] || (steps[0] === 'all' && steps.length === 1),
          },
          {
            key: 'browse',
            to: '/icons/browse',
            menuItem: 'Browse',
            active: steps[0] === 'browse' && steps.length === 1,
            activeChild: steps[0] === 'browse',
            children: setsFiltered.map((set) => ({
              key: set,
              to: `/icons/browse/${set}`,
              menuItem: (
                <Split style={{alignItems: 'center'}}>
                  <Code gray>{set}</Code>
                  <Sidetip small>{icons.get(set)?.length}</Sidetip>
                </Split>
              ),
              active: steps[0] === 'browse' && steps[1] === set,
            })),
          },
        ]}
      />
    </div>
  );
};
