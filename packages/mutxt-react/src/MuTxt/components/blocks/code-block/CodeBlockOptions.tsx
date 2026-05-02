import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Checkbox} from '@jsonjoy.com/ui/lib/2-inline-block/Checkbox';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {Slider} from '@jsonjoy.com/ui/lib/2-inline-block/Slider';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {FormRow} from '@jsonjoy.com/ui/lib/3-list-item/FormRow';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import {useCodeBlockOptionsState} from './state';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';

const LANGUAGE_OPTIONS = [
  'bash',
  'c',
  'cpp',
  'css',
  'go',
  'html',
  'java',
  'js',
  'json',
  'jsx',
  'py',
  'rust',
  'sh',
  'sql',
  'text',
  'toml',
  'ts',
  'tsx',
  'yaml',
  'zsh',
];

const blockClass = rule({
  bxz: 'border-box',
  d: 'flex',
  fld: 'column',
  gap: '12px',
  maxW: '400px',
});

const popupFieldRowClass = rule({
  d: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '8px',
  ai: 'center',
});

const stopInputKeyDown = (event: React.KeyboardEvent): void => {
  event.stopPropagation();
};

const preventPopupMouseDown = (event: React.MouseEvent): void => {
  event.preventDefault();
  event.stopPropagation();
};

export const CodeBlockOptions: React.FC = () => {
  const state = useCodeBlockOptionsState();
  const fileName = state.fileName.use();
  const language = state.language.use();
  const wrapColumn = state.wrapColumn.use();
  const showLineNumbers = state.showLineNumbers.use();

  const languageMenu: MenuItem = {
    name: 'Language',
    minWidth: 220,
    children: [
      {
        id: 'plain-text',
        name: 'Plain text',
        onSelect: () => state.setLanguage(''),
        right: !language.trim() ? () => <span style={{fontSize: 11, opacity: 0.6}}>Current</span> : undefined,
      },
      {id: 'language-sep', name: 'language-sep', sep: true},
      ...LANGUAGE_OPTIONS.map((option) => ({
        id: option,
        name: option,
        display: () => <code>.{option}</code>,
        onSelect: () => state.setLanguage(option),
        right:
          language.trim().toLowerCase() === option
            ? () => <span style={{fontSize: 11, opacity: 0.6}}>Current</span>
            : undefined,
      })),
    ],
  };

  return (
    <div className={blockClass}>
      <Input
        type="text"
        value={fileName}
        label="File name"
        placeholder="file.txt"
        focus
        onChange={state.setFileName}
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
        onBlur={state.inferLanguageFromFileName}
      />

      <div className={popupFieldRowClass}>
        <Input
          type="text"
          value={language}
          label="Language"
          placeholder="txt"
          onChange={state.setLanguage}
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
        <Popup
          renderContext={() => (
            <MoveToViewport vertical>
              <ContextMenu inset menu={languageMenu} />
            </MoveToViewport>
          )}
        >
          <BasicButtonMore type="button" size={32} compact rounder onMouseDown={preventPopupMouseDown} />
        </Popup>
      </div>

      <Space size={-6} />
      <Separator />

      <FormRow title="Wrap guide" descriptionAbove description="Adjust the wrapping guide column position.">
        <Slider value={wrapColumn} min={10} max={140} step={1} showValue onChange={state.setWrapColumn} />
      </FormRow>

      <Separator />

      <FormRow
        title="Show line numbers"
        description="Show or hide the line number gutter on the left side of the code block."
        right
      >
        <div style={{width: 60, marginTop: -8}}>
          <Checkbox on={showLineNumbers} onChange={state.toggleShowLineNumbers} />
        </div>
      </FormRow>
    </div>
  );
};
