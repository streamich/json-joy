import * as React from 'react';
import {useIconsGrid} from '../../context';
import {rule} from 'nano-theme';
import Paper from '../../../../../../../4-card/Paper';
import {Flex} from '../../../../../../../3-list-item/Flex';
import {Breadcrumb} from '../../../../../../../3-list-item/Breadcrumbs';

const _blockClass = rule({});

const sizeScale = [12, 16, 20, 24, 32, 48, 64];

export interface IconPreviewProps {
  set: string;
  icon: string;
}

export const IconPreview: React.FC<IconPreviewProps> = ({set, icon}) => {
  const [size, setSize] = React.useState(16);
  const state = useIconsGrid();

  const href = state.href(set, icon);

  const iconElement = (
    // <Paper fill={1} noOutline hoverElevate style={{width: 128, height: 128, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <Flex style={{justifyContent: 'center'}}>
      <Paper
        contrast
        hoverElevate
        style={{width: 280, height: 128, display: 'flex', justifyContent: 'center', alignItems: 'center'}}
      >
        <img src={href} alt={`${set} set ${icon} icon SVG`} width={size} height={size} />
      </Paper>
    </Flex>
  );

  const sizeScaleElement = (
    <Flex style={{columnGap: 8, justifyContent: 'center', padding: '16px 0 24px'}}>
      {sizeScale.map((s) => (
        // <BasicButton key={s} width={'auto'} onClick={() => setSize(s)}>{s}px</BasicButton>
        // <PillButton key={s} width={'auto'} onClick={() => setSize(s)}>{s}px</PillButton>
        <Breadcrumb key={s} compact selected={s === size} onClick={() => setSize(s)}>
          {s}px
        </Breadcrumb>
      ))}
    </Flex>
  );

  return (
    <div>
      {iconElement}
      {sizeScaleElement}
    </div>
  );
};
