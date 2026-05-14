import * as React from 'react';
import {useT} from 'use-t';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {FmtTitle} from '../FmtTitle';
import {FormattingView} from '../../views/view/FormattingView';
import {useEditor} from '../../../state/context';
import {FmtPane} from '../FmtPane';
import {ContextMenu, ContextSep} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {FormattingEditForm} from './FormattingEditForm';
import {useFormattingPane} from './context';
import {ContextPaneHeader} from '../../../components/ContextPaneHeader';
import {ContextPaneHeaderSep} from '../../../components/ContextPaneHeaderSep';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {useSyncStore} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';
import type {SavedFmt} from '../../../state/formattings';
import PencilIcon__svg from 'iconista/lib/react/lucide/pencil';
import TrashIcon__svg from 'iconista/lib/react/lucide/trash';
import OptionsIcon__svg from 'iconista/lib/react/tabler/dots-vertical';

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PencilIcon__svg {...props} />;
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TrashIcon__svg {...props} />;
const OptionsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <OptionsIcon__svg {...props} />;

export interface FormattingDisplayProps {
  formatting: SavedFmt;
  onClose?: () => void;
}

export const FormattingDisplay: React.FC<FormattingDisplayProps> = ({formatting, onClose}) => {
  const state = useFormattingPane();
  const editFormatting = useSyncStore(state.editing);
  const view = useSyncStore(state.view);
  const {surface} = useEditor();
  const [t] = useT();

  const doEdit = view === 'edit' && !!editFormatting;

  const right = doEdit ? (
    <Flex style={{justifyContent: 'flex-end', alignItems: 'center'}}>
      <BasicButton fill width={'auto'} onClick={state.onSave}>
        {t('Save')}
      </BasicButton>
      <Space horizontal />
      <BasicTooltip renderTooltip={() => t('Stop editing')}>
        <BasicButtonClose onClick={state.switchToViewPanel} />
      </BasicTooltip>
    </Flex>
  ) : (
    <Flex style={{justifyContent: 'flex-end', alignItems: 'center'}}>
      <Popup
        renderContext={() => (
          <ContextMenu
            inset
            menu={{
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
                      slice: formatting.range,
                      action: 'del',
                    });
                    onClose?.();
                  },
                },
              ],
            }}
          />
        )}
      >
        <BasicTooltip renderTooltip={() => t('Options')}>
          <BasicButton>
            <OptionsIcon width={16} height={16} />
          </BasicButton>
        </BasicTooltip>
      </Popup>
    </Flex>
  );

  return (
    <FmtPane onEsc={() => onClose?.()}>
      <ContextPaneHeader short onBackClick={onClose} right={right}>
        <FmtTitle
          formatting={formatting}
          onClick={() => {
            if (state.view.value === 'view') state.switchToEditPanel();
          }}
        />
      </ContextPaneHeader>
      <ContextPaneHeaderSep />
      {doEdit ? (
        <FormattingEditForm formatting={editFormatting} onSave={state.onSave} />
      ) : formatting.behavior.View ? (
        <>
          <ContextSep />
          <div style={{padding: '4px 16px 16px'}}>
            <FormattingView formatting={formatting} onEdit={() => state.switchToEditPanel()} />
          </div>
        </>
      ) : (
        <FormattingEditForm formatting={formatting} onSave={onClose || (() => {})} />
      )}
    </FmtPane>
  );
};
