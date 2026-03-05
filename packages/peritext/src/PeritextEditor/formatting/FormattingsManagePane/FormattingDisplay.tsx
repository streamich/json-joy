import * as React from 'react';
import {useT} from 'use-t';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {FormattingTitle} from '../FormattingTitle';
import {FormattingView} from '../views/view/FormattingView';
import {useToolbarPlugin} from '../../context';
import {FormattingPane} from '../FormattingPane';
import {ContextMenu, ContextPane, ContextSep} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {FormattingEditForm} from './FormattingEditForm';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useFormattingPane} from './context';
import {ContextPaneHeader} from '../../components/ContextPaneHeader';
import {ContextPaneHeaderSep} from '../../components/ContextPaneHeaderSep';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import type {SavedFormatting} from '../../state/formattings';

const PencilIcon = makeIcon({set: 'lucide', icon: 'pencil'});
const TrashIcon = makeIcon({set: 'lucide', icon: 'trash'});
const OptionsIcon = makeIcon({set: 'tabler', icon: 'dots-vertical'});

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

  const right = (
    doEdit ? (
      <Flex style={{justifyContent: 'flex-end', alignItems: 'center'}}>
        <BasicButton fill width={'auto'} onClick={state.returnFromEditPanelAndSave}>{t('Save')}</BasicButton>
        <Space horizontal />
        <BasicTooltip renderTooltip={() => t('Stop editing')}>
          <BasicButtonClose onClick={state.switchToViewPanel} />
        </BasicTooltip>
      </Flex>
    ) : (
      <Flex style={{justifyContent: 'flex-end', alignItems: 'center'}}>
        <Popup renderContext={() => (
          <ContextMenu inset menu={{
            name: t('Options'),
            children: [
              {
                name: t('Edit'),
                icon: () => <PencilIcon width={16} height={16} />,
                onSelect: state.switchToEditPanel,
              },
              {
                name: t('Delete'),
                danger: true,
                icon: () => <TrashIcon width={16} height={16} />,
                onSelect: () => {
                  surface.events.et.format({
                    at: formatting.range,
                    action: 'del',
                  });
                  onClose?.();
                },
              },
            ],
          }} />
        )}>
          <BasicTooltip renderTooltip={() => t('Options')}>
            <BasicButton>
              <OptionsIcon width={16} height={16} />
            </BasicButton>
          </BasicTooltip>
        </Popup>        
      </Flex>
    )
  );

  return (
    <FormattingPane>
      <ContextPaneHeader
        short
        onBackClick={onClose}
        right={right}
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
