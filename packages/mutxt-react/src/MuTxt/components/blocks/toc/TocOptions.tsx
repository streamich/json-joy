import * as React from 'react';
import {rule} from 'nano-theme';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {Slider} from '@jsonjoy.com/ui/lib/2-inline-block/Slider';
import {Checkbox} from '@jsonjoy.com/ui/lib/2-inline-block/Checkbox';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {FormRow} from '@jsonjoy.com/ui/lib/3-list-item/FormRow';
import {useTocOptionsState} from './state';
import {useT} from 'use-t';

const blockClass = rule({
  bxz: 'border-box',
  d: 'flex',
  fld: 'column',
  gap: '12px',
  maxW: '420px',
});

const stopInputKeyDown = (event: React.KeyboardEvent): void => {
  event.stopPropagation();
};

export const TocOptions: React.FC = () => {
  const [t] = useT();
  const state = useTocOptionsState();
  const caption = state.caption.use();
  const maxLevel = state.maxLevel.use();
  const includeTitle = state.includeTitle.use();
  const numbered = state.numbered.use();

  return (
    <div className={blockClass}>
      <Input
        type="text"
        value={caption}
        label={t('Caption (optional)')}
        placeholder={t('Table of contents')}
        onChange={state.setCaption}
        onKeyDown={stopInputKeyDown}
        onEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          state.apply();
        }}
        onEsc={(event) => {
          event.preventDefault();
          event.stopPropagation();
          state.cancel();
        }}
      />

      <Separator />

      <FormRow
        title={t('Max heading level')}
        descriptionAbove
        description={t('Deepest heading level to include in the contents.')}
      >
        <Slider value={maxLevel} min={1} max={6} step={1} showValue onChange={state.setMaxLevel} />
      </FormRow>

      <Separator />

      <FormRow
        title={t('Include title')}
        description={t('Show the document title at the top of the contents.')}
        right
      >
        <div style={{width: 60, marginTop: -8}}>
          <Checkbox on={includeTitle} onChange={() => state.setIncludeTitle(!includeTitle)} />
        </div>
      </FormRow>

      <Separator />

      <FormRow
        title={t('Numbered')}
        description={t('Prefix each entry with its hierarchical number (1., 1.1., …).')}
        right
      >
        <div style={{width: 60, marginTop: -8}}>
          <Checkbox on={numbered} onChange={() => state.setNumbered(!numbered)} />
        </div>
      </FormRow>
    </div>
  );
};
