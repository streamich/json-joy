import * as React from 'react';
import {rule} from 'nano-theme';
import {useT} from 'use-t';
import {BasicTooltip} from 'nice-ui/lib/4-card/BasicTooltip';
import BasicButton from 'nice-ui/lib/2-inline-block/BasicButton';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {SavedFormatting} from '../../state/formattings';
import {ContextPaneHeader} from '../../../../components/ContextPaneHeader';
import {ContextPaneHeaderSep} from '../../../../components/ContextPaneHeaderSep';
import {FormattingTitle} from '../FormattingTitle';
import {FormattingView} from '../views/view/FormattingView';
import {useToolbarPlugin} from '../../context';
import {Code} from 'nice-ui/lib/1-inline/Code';
import {FormattingPane} from '../FormattingPane';
import {BasicButtonClose} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {FormattingEdit} from '../views/edit/FormattingEdit';
import {ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {ButtonSeparator} from '../../../../components/ButtonSeparator';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {useSyncStoreOpt} from '../../../../web/react/hooks';

const blockClass = rule({
  maxW: '600px',
});

export interface FormattingEditFormProps {
  formatting: SavedFormatting;
  onDone?: () => void;
}

export const FormattingEditForm: React.FC<FormattingEditFormProps> = ({formatting, onDone}) => {
  const [t] = useT();
  const {toolbar} = useToolbarPlugin();
  useSyncStoreOpt(formatting.conf()?.api);
  const validation = formatting.validate();

  const valid = validation === 'good' || validation === 'fine';

  const handleSubmit = () => {
    onDone?.()
  };

  return (
    <form className={blockClass} onSubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}>
      <div style={{padding: '16px'}}>
        <FormattingEdit formatting={formatting} />
      </div>

      <ContextSep line />
      
      <div style={{padding: '16px'}}>
        <Button
          small
          lite={!valid}
          positive={validation === 'good'}
          block
          disabled={!valid}
          submit
          onClick={handleSubmit}
        >{t('Done')}</Button>
      </div>
    </form>
  );
};
