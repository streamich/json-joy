import * as React from 'react';
import {ContextPane, ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {SliceFormatting} from '../../../state/formattings';
import {ContextPaneHeader} from '../../../../../components/ContextPaneHeader';
import {ContextPaneHeaderSep} from '../../../../../components/ContextPaneHeaderSep';
import {FormattingTitle} from '../../../components/FormattingTitle';

export interface FormattingDisplayProps {
  formatting: SliceFormatting;
  onClose?: () => void;
}

export const FormattingDisplay: React.FC<FormattingDisplayProps> = ({formatting, onClose}) => {


  return (
    <ContextPane style={{minWidth: 'calc(max(220px, min(360px, 80vw)))'}}>
      <ContextPaneHeader short onBackClick={onClose}>
        <FormattingTitle formatting={formatting} />
      </ContextPaneHeader>
      <ContextPaneHeaderSep />
      <ContextSep />
      This is formatting....
      <ContextSep />
    </ContextPane>
  );
};
