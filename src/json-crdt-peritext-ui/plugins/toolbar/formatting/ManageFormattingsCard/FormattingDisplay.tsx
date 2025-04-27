import * as React from 'react';
import {useT} from 'use-t';
import {ContextPane} from 'nice-ui/lib/4-card/ContextMenu';
import {BasicTooltip} from 'nice-ui/lib/4-card/BasicTooltip';
import BasicButton from 'nice-ui/lib/2-inline-block/BasicButton';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {SavedFormatting} from '../../state/formattings';
import {ContextPaneHeader} from '../../../../components/ContextPaneHeader';
import {ContextPaneHeaderSep} from '../../../../components/ContextPaneHeaderSep';
import {FormattingTitle} from '../../components/FormattingTitle';
import {FormattingView} from '../../formatting/view/FormattingView';
import {useToolbarPlugin} from '../../context';
import {Code} from 'nice-ui/lib/1-inline/Code';

export interface FormattingDisplayProps {
  formatting: SavedFormatting;
  onClose?: () => void;
}

export const FormattingDisplay: React.FC<FormattingDisplayProps> = ({formatting, onClose}) => {
  const {surface} = useToolbarPlugin();
  const [t] = useT();

  return (
    <ContextPane style={{minWidth: 'calc(max(300px, min(400px, 80vw)))', maxWidth: 600}}>
      <ContextPaneHeader
        short
        onBackClick={onClose}
        right={(
          <Flex style={{justifyContent: 'flex-end', alignItems: 'center'}}>
            <div style={{fontSize: '13px', lineHeight: '1.3em'}}>
              <Code spacious alt gray nowrap>{t('view')}</Code>
            </div>
            <Space horizontal />
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
            <BasicTooltip renderTooltip={() => t('Edit')}>
              <BasicButton size={32} rounder>
                <Iconista set={'lucide'} icon={'pencil'} width={16} height={16} />
              </BasicButton>
            </BasicTooltip>
          </Flex>
        )}
      >
        <FormattingTitle formatting={formatting} />
      </ContextPaneHeader>
      <ContextPaneHeaderSep />
      {/* <ContextSep /> */}
      <div style={{padding: '4px 16px 16px'}}>
        <FormattingView formatting={formatting} />
      </div>
      {/* <ContextSep /> */}
    </ContextPane>
  );
};
