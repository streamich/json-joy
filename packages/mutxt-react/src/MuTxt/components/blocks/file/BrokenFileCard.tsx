import * as React from 'react';
import {rule} from 'nano-theme';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import FileListItem from '@jsonjoy.com/ui/lib/3-list-item/FileListItem';

const cardClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '12px',
  pd: '12px 16px',
  bxz: 'border-box',
  us: 'none',
});

const metaClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '2px',
  minW: 0,
  fl: '1 1 auto',
});

const nameClass = rule({
  fz: '14px',
  fw: 600,
  ws: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
});

const subClass = rule({
  fz: '12px',
  lh: 1.4,
  ws: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
});

export interface BrokenFileCardProps {
  thingId: string;
  selected: boolean;
}

export const BrokenFileCard: React.FC<BrokenFileCardProps> = ({thingId, selected}) => {
  const styles = useStyles();
  return (
    <Paper
      noOutline
      round
      style={{
        margin: '4px 0',
        outline: '2px solid ' + (selected ? '#07f' : 'transparent'),
        outlineOffset: 2,
        position: 'relative',
      }}
    >
      <FileListItem
        fill
        spacious
        icon={(
          <FileIcon
            label={'404'}
            ext="txt"
            size={32}
          />
        )}
        title={'Missing file'}
        metadata={`Reference ${thingId} could not be resolved`}
      />
    </Paper>
  );
};
