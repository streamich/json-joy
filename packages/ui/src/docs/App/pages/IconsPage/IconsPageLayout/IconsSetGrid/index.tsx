import * as React from 'react';
import {useIconsGrid} from '../context';
import {useBehaviorSubject} from '../../../../../../hooks/useBehaviorSubject';
import {IconCard} from '../IconCard';
import {Flex} from '../../../../../../3-list-item/Flex';
import {IconModal} from '../IconModal';

export interface IconsSetGridProps {
  set: string;
}

export const IconsSetGrid: React.FC<IconsSetGridProps> = ({set}) => {
  const state = useIconsGrid();
  const iconsMap = useBehaviorSubject(state.icons$);
  const selected = useBehaviorSubject(state.selected$);

  const icons = iconsMap.get(set);
  if (!icons?.length) return null;

  return (
    <>
      <Flex key={set} style={{flexDirection: 'row-reverse'}}>
        <Flex style={{flexWrap: 'wrap', columnGap: 8, rowGap: 8, justifyContent: 'flex-start', marginRight: -8}}>
          {icons.map((icon) => (
            <IconCard key={icon} set={set} icon={icon} />
          ))}
        </Flex>
      </Flex>
      {!!selected && <IconModal set={selected[0]} icon={selected[1]} />}
    </>
  );
};
