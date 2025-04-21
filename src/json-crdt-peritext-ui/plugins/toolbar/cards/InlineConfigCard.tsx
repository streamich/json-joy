import * as React from 'react';
import {ContextPane} from 'nice-ui/lib/4-card/ContextMenu/ContextPane';
import {NewLinkConfig} from '../config/NewLinkConfig';
import type {SliceConfigState} from '../state/types';

export interface InlineConfigCardProps {
  config: SliceConfigState<any>;
  onSave: () => void;
}

export const InlineConfigCard: React.FC<InlineConfigCardProps> = ({config, onSave}) => {
  return (
    <ContextPane style={{display: 'block', minWidth: 'calc(min(600px, max(50vw, 260px)))'}}>
      <NewLinkConfig config={config} onSave={onSave} />
    </ContextPane>
  );
};
