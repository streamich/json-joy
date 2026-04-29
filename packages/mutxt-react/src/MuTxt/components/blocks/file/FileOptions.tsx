import * as React from 'react';
import {rule} from 'nano-theme';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {useFileOptionsState} from './state';
import {useT} from 'use-t';

const blockClass = rule({
  bxz: 'border-box',
  d: 'flex',
  fld: 'column',
  gap: '12px',
  maxW: '500px',
});

const stopInputKeyDown = (event: React.KeyboardEvent): void => {
  event.stopPropagation();
};

export const FileOptions: React.FC = () => {
  const [t] = useT();
  const state = useFileOptionsState();
  const caption = state.caption.use();
  const displayName = state.displayName.use();

  return (
    <div className={blockClass}>
      <Input
        type="text"
        value={displayName}
        label={t('File name')}
        placeholder={t('Original filename')}
        onChange={state.setDisplayName}
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
      <Input
        type="text"
        value={caption}
        label={t('Caption (optional)')}
        placeholder={t('Description shown below the file')}
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
    </div>
  );
};
