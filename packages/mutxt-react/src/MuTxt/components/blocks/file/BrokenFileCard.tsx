import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import FileListItem from '@jsonjoy.com/ui/lib/3-list-item/FileListItem';
import {VoidSelectionOverlay} from '../VoidSelectionOverlay';

export interface BrokenFileCardProps {
  thingId: string;
  selected: boolean;
}

export const BrokenFileCard: React.FC<BrokenFileCardProps> = ({thingId, selected}) => {
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
      <VoidSelectionOverlay selected={selected} />
    </Paper>
  );
};
