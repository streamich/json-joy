// biome-ignore lint: lint/style/useImportType
import * as React from 'react';
import {useT} from 'use-t';
import {BasicTooltip} from 'nice-ui/lib/4-card/BasicTooltip';
import BasicButton from 'nice-ui/lib/2-inline-block/BasicButton';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {Space} from 'nice-ui/lib/3-list-item/Space';
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
import {SoftLockedDeleteButton} from '../../components/SoftLockedDeleteButton';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {useFormattingPane} from './context';
import type {SavedFormatting} from '../../state/formattings';

export interface FormattingDisplayProps {
  formatting: SavedFormatting;
  onClose?: () => void;
}

export const FormattingDisplay: React.FC<FormattingDisplayProps> = ({formatting, onClose}) => {
  const state = useFormattingPane();
  const editFormatting = useBehaviorSubject(state.editing$);
  const view = useBehaviorSubject(state.view$);
  const {surface} = useToolbarPlugin();
  const [t] = useT();

  const doEdit = view === 'edit' && !!editFormatting;

  return (
    <FormattingPane>
      <ContextPaneHeader
        short
        onBackClick={onClose}
        right={
          doEdit ? (
            <Flex style={{justifyContent: 'flex-end', alignItems: 'center'}}>
              <div style={{fontSize: '13px', lineHeight: '1.3em'}}>
                <Code spacious alt gray nowrap>
                  {t('editing')}
                </Code>
              </div>
              <Space horizontal />
              <BasicTooltip renderTooltip={() => t('Stop editing')}>
                <BasicButton size={32} rounder onClick={state.switchToViewPanel}>
                  <Iconista set={'lucide'} icon={'pencil-off'} width={16} height={16} />
                </BasicButton>
              </BasicTooltip>
            </Flex>
          ) : (
            <Flex style={{justifyContent: 'flex-end', alignItems: 'center'}}>
              <SoftLockedDeleteButton
                onDelete={() => {
                  surface.events.et.format({
                    slice: formatting.range,
                    action: 'del',
                  });
                  onClose?.();
                }}
              />
              <Space horizontal size={-2} />
              <ButtonSeparator />
              <Space horizontal size={-2} />
              <BasicTooltip renderTooltip={() => t('Edit')}>
                <BasicButton size={32} rounder onClick={state.switchToEditPanel}>
                  <Iconista set={'lucide'} icon={'pencil'} width={16} height={16} />
                </BasicButton>
              </BasicTooltip>
            </Flex>
          )
        }
      >
        <FormattingTitle formatting={formatting} />
      </ContextPaneHeader>
      <ContextPaneHeaderSep />
      {doEdit ? (
        <FormattingEditForm formatting={editFormatting} onSave={state.returnFromEditPanelAndSave} />
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
