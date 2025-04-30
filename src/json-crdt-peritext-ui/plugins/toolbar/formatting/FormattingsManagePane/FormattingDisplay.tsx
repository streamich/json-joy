import * as React from 'react';
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
import {ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {ButtonSeparator} from '../../../../components/ButtonSeparator';
import {FormattingEditForm} from './FormattingEditForm';

export interface FormattingDisplayProps {
  formatting: SavedFormatting;
  onClose?: () => void;
}

export const FormattingDisplay: React.FC<FormattingDisplayProps> = ({formatting, onClose}) => {
  const [view, setView] = React.useState<'view' | 'edit'>('view');
  const {surface} = useToolbarPlugin();
  const [t] = useT();

  return (
    <FormattingPane>
      <ContextPaneHeader
        short
        onBackClick={onClose}
        right={view === 'edit' ? (
          <Flex style={{justifyContent: 'flex-end', alignItems: 'center'}}>
            <div style={{fontSize: '13px', lineHeight: '1.3em'}}>
              <Code spacious alt gray nowrap>{t('editing')}</Code>
            </div>
            <Space horizontal />
            <BasicTooltip renderTooltip={() => t('Cancel editing')}>
              <BasicButton size={32} rounder onClick={() => setView('view')}>
                <Iconista set={'lucide'} icon={'pencil-off'} width={16} height={16} />
              </BasicButton>
            </BasicTooltip>
          </Flex>
        ) : (
          <Flex style={{justifyContent: 'flex-end', alignItems: 'center'}}>
            <BasicTooltip renderTooltip={() => t('Delete')}>
              <BasicButton size={32} rounder onClick={() => {
                surface.events.et.format({
                  at: formatting.range,
                  action: 'del',
                });
                onClose?.();
              }}>
                <Iconista set={'lucide'} icon={'trash'} width={16} height={16} />
              </BasicButton>
            </BasicTooltip>
            <Space horizontal size={-2} />
            <ButtonSeparator />
            <Space horizontal size={-2} />
            <BasicTooltip renderTooltip={() => t('Edit')}>
              <BasicButton size={32} rounder onClick={() => setView('edit')}>
                <Iconista set={'lucide'} icon={'pencil'} width={16} height={16} />
              </BasicButton>
            </BasicTooltip>
          </Flex>
        )}
      >
        <FormattingTitle formatting={formatting} />
      </ContextPaneHeader>
      <ContextPaneHeaderSep />
      {view === 'edit' ? (
        <FormattingEditForm formatting={formatting} />
      ) : (
        <>
          <ContextSep />
          <div style={{padding: '4px 16px 16px'}}>
            <FormattingView formatting={formatting} />
          </div>
        </>
      )}
    </FormattingPane>
  );
};
