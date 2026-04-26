import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicButtonDelete} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonDelete';
import {CopyButton} from '@jsonjoy.com/ui/lib/2-inline-block/CopyButton';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {EditorContextPopup} from '../../../chrome/EditorContextPopup';
import {useLinkButton} from './context';

const inputRowClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '10px',
});

const actionRowClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '8px',
});

const actionButtonsClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '6px',
});

const preventMouseDown = (event: React.MouseEvent): void => {
  event.preventDefault();
};

export const LinkToolbarPopup: React.FC = () => {
  const state = useLinkButton();
  const activeLink = state.activeLink.use();
  const draft = state.draft.use();
  const open = state.open.use();
  const normalizedDraft = state.normalizedDraft.use();

  const title = activeLink ? 'Edit link' : 'Add link';
  const subtitle = activeLink
    ? 'Update the current link target, copy it, open it, or remove it.'
    : 'Enter a URL to wrap the current selection.';

  const actionRow = activeLink ? (
    <div className={actionRowClass}>
      <div className={actionButtonsClass}>
        <CopyButton
          type="button"
          width={32}
          height={32}
          rounder
          onMouseDown={preventMouseDown}
          onCopy={() => activeLink.href}
          tooltip={{nowrap: true, renderTooltip: () => 'Copy link'}}
        />
        <BasicTooltip nowrap renderTooltip={() => 'Open link'}>
          <BasicButton
            type="button"
            width={32}
            height={32}
            rounder
            onMouseDown={preventMouseDown}
            to={activeLink.href}
          >
            <Iconista set={'lucide' as any} icon={'external-link' as any} width={16} height={16} />
          </BasicButton>
        </BasicTooltip>
        <BasicTooltip nowrap renderTooltip={() => 'Remove link'}>
          <BasicButtonDelete
            type="button"
            width={32}
            height={32}
            rounder
            onMouseDown={preventMouseDown}
            onConfirm={state.remove}
          />
        </BasicTooltip>
      </div>
    </div>
  ) : undefined;

  return (
    <EditorContextPopup
      title={title}
      subtitle={subtitle}
      headerRight={actionRow}
      minWidth={Math.max(Math.min(560, window.innerWidth * 0.4), 320)}
      applyDisabled={!normalizedDraft}
      onCancel={state.close}
      onApply={state.apply}
    >
      <div className={inputRowClass}>
        <Input
          type="text"
          label="Link"
          value={draft}
          placeholder="https://example.com"
          focus
          select={open}
          onChange={state.setDraft}
          onEnter={(event) => {
            event.preventDefault();
            state.apply();
          }}
          onEsc={(event) => {
            event.preventDefault();
            state.close();
          }}
        />
      </div>
    </EditorContextPopup>
  );
};