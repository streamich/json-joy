import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
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

const popupFieldRowClass = rule({
  d: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '8px',
  ai: 'center',
});

export interface CodeBlockOptionsProps {
  fileName: string;
  language: string;
  onFileNameChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

export const CodeBlockOptions: React.FC<CodeBlockOptionsProps> = ({
  fileName,
  language,
  onFileNameChange,
  onLanguageChange,
  onApply,
  onCancel,
}) => {
  const handleInputKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    event.stopPropagation();
  }, []);

  const handleInputEnter = React.useCallback(
    (event: React.KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onApply();
    },
    [onApply],
  );

  const handleInputEscape = React.useCallback(
    (event: React.KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
    },
    [onCancel],
  );

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleFileNameBlur = React.useCallback(() => {
    if (language.trim() !== '') return;
    const extension = fileName.split('.').pop()?.trim() || '';
    if (extension && extension !== language.trim()) onLanguageChange(extension);
  }, [fileName, language, onLanguageChange]);

  const languageMenu = React.useMemo<MenuItem>(
    () => ({
      name: 'Language',
      minWidth: 220,
      children: [
        {
          id: 'plain-text',
          name: 'Plain text',
          onSelect: () => onLanguageChange(''),
          right: !language.trim() ? () => <span style={{fontSize: 11, opacity: 0.6}}>Current</span> : undefined,
        },
        {id: 'language-sep', name: 'language-sep', sep: true},
        ...LANGUAGE_OPTIONS.map((option) => ({
          id: option,
          name: option,
          display: () => <code>.{option}</code>,
          onSelect: () => onLanguageChange(option),
          right:
            language.trim().toLowerCase() === option
              ? () => <span style={{fontSize: 11, opacity: 0.6}}>Current</span>
              : undefined,
        })),
      ],
    }),
    [language, onLanguageChange],
  );

  return (
    <>
      <Input
        type="text"
        value={fileName}
        label="File name"
        placeholder="file.txt"
        onChange={onFileNameChange}
        onKeyDown={handleInputKeyDown}
        onEnter={handleInputEnter}
        onEsc={handleInputEscape}
        onBlur={handleFileNameBlur}
      />

      <div className={popupFieldRowClass}>
        <Input
          type="text"
          value={language}
          label="Language"
          placeholder="txt"
          onChange={onLanguageChange}
          onKeyDown={handleInputKeyDown}
          onEnter={handleInputEnter}
          onEsc={handleInputEscape}
        />

        <Popup
          renderContext={() => (
            <MoveToViewport vertical>
              <ContextMenu inset menu={languageMenu} />
            </MoveToViewport>
          )}
        >
          <BasicButtonMore
            type="button"
            size={32}
            compact
            rounder
            onMouseDown={preventMouseDown}
          />
        </Popup>
      </div>
    </>
  );
};