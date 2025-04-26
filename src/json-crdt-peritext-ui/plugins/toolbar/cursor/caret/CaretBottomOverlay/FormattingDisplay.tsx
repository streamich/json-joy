import * as React from 'react';
import {ContextPane, ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {SavedFormatting} from '../../../state/formattings';
import {ContextPaneHeader} from '../../../../../components/ContextPaneHeader';
import {ContextPaneHeaderSep} from '../../../../../components/ContextPaneHeaderSep';
import {FormattingTitle} from '../../../components/FormattingTitle';
import {FormattingEdit} from '../../../formatting/edit/FormattingEdit';

export interface FormattingDisplayProps {
  formatting: SavedFormatting;
  onClose?: () => void;
}

export const FormattingDisplay: React.FC<FormattingDisplayProps> = ({formatting, onClose}) => {


  return (
    <ContextPane style={{minWidth: 'calc(max(220px, min(360px, 80vw)))', maxWidth: 600}}>
      <ContextPaneHeader short onBackClick={onClose}>
        <FormattingTitle formatting={formatting} />
      </ContextPaneHeader>
      <ContextPaneHeaderSep />
      {/* <ContextSep /> */}
      <div style={{padding: '4px 16px 16px'}}>
        <FormattingEdit formatting={formatting} />
      </div>
      {/* <ContextSep /> */}
    </ContextPane>
  );
};
