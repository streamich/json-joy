import * as React from 'react';
import {ContextPane} from 'nice-ui/lib/4-card/ContextMenu/ContextPane';
import {NewLinkConfig} from '../config/NewLinkConfig';
import {useToolbarPlugin} from '../context';
import type {NewFormatting} from '../state/formattings';

export interface InlineConfigCardProps {
  formatting: NewFormatting;
  onSave: () => void;
}

export const InlineConfigCard: React.FC<InlineConfigCardProps> = ({formatting, onSave}) => {
  const {toolbar} = useToolbarPlugin();

  return (
    <div onKeyDown={(e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        toolbar.newSlice.next(void 0);
      }
    }}>
      <ContextPane style={{display: 'block', minWidth: 'calc(min(600px, max(50vw, 260px)))'}}>
        <NewLinkConfig formatting={formatting} onSave={onSave} />
      </ContextPane>
    </div>
  );
};
