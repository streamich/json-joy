import * as React from 'react';
import {ContextPane} from 'nice-ui/lib/4-card/ContextMenu/ContextPane';
import {NewLinkConfig} from '../config/NewLinkConfig';
import {useToolbarPlugin} from '../context';
import type {SliceConfigState} from '../state/types';

export interface InlineConfigCardProps {
  config: SliceConfigState<any>;
  onSave: () => void;
}

export const InlineConfigCard: React.FC<InlineConfigCardProps> = ({config, onSave}) => {
  const {toolbar} = useToolbarPlugin();

  return (
    <div onKeyDown={(e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        toolbar.newSliceConfig.next(void 0);
      }
    }}>
      <ContextPane style={{display: 'block', minWidth: 'calc(min(600px, max(50vw, 260px)))'}}>
        <NewLinkConfig config={config} onSave={onSave} />
      </ContextPane>
    </div>
  );
};
