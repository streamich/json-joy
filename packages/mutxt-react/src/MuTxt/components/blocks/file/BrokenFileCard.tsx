import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import FileListItem from '@jsonjoy.com/ui/lib/3-list-item/FileListItem';

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
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <FileListItem
        fill
        spacious
        icon={<FileIcon label={'404'} ext="txt" size={32} />}
        title={'Missing file'}
        metadata={`Reference ${thingId} could not be resolved`}
      />
      {selected && (
        <div
          contentEditable={false}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: 'rgba(0, 127, 255, 0.18)',
            pointerEvents: 'none',
          }}
        />
      )}
    </Paper>
  );
};
