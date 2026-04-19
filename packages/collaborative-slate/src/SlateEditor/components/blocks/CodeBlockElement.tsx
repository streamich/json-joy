import * as React from 'react';
import {rule} from 'nano-theme';
import {Transforms} from 'slate';
import {ReactEditor, type RenderElementProps, useReadOnly, useSlateStatic} from 'slate-react';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {PopupControlled} from '@jsonjoy.com/ui/lib/4-card/Popup/PopupControlled';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {anchorContext, useAnchorPointHandle} from '@jsonjoy.com/ui/lib/utils/popup/context';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import {EditorContextPopup} from '../chrome/EditorContextPopup';
import type {CodeBlockElement as CodeBlockElementType} from '../../types';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';

const LANGUAGE_OPTIONS = [
  'text',
  'bash',
  'sh',
  'zsh',
  'json',
  'yaml',
  'toml',
  'js',
  'jsx',
  'ts',
  'tsx',
  'html',
  'css',
  'sql',
  'py',
  'go',
  'rust',
  'java',
  'c',
  'cpp',
];

const codeWrapClass = rule({
  pos: 'relative',
  m: '20px 0',
});

const popupAnchor = {center: true, gap: 12, topIf: 180};

const panelClass = rule({
  ov: 'hidden',
  bdrad: '18px',
});

const metaBarClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '12px',
  pd: '10px 14px',
  fw: 'wrap',
});

const metaInputsClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '10px',
  fw: 'wrap',
  w: '100%',
});

const metaPreviewClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '10px',
  fw: 'wrap',
  minW: '0',
});

const metaActionsClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
  marginLeft: 'auto',
});

const metaLabelClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
  fz: '12px',
  minW: '0',
});

const metaChipClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
  pd: '5px 9px',
  bdrad: '999px',
  tt: 'uppercase',
  ls: '0.06em',
  fz: '11px',
});

const codePreClass = rule({
  m: '0',
  ovx: 'auto',
  pd: '16px 18px 18px',
});

const codeClass = rule({
  ff: '"JetBrains Mono", "Fira Code", Menlo, monospace',
  fz: '0.9rem',
  lh: '1.7',
});

const popupFieldRowClass = rule({
  d: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '8px',
  ai: 'center',
});

export interface CodeBlockElementProps extends RenderElementProps {
  element: CodeBlockElementType;
}

export const CodeBlockElement: React.FC<CodeBlockElementProps> = ({attributes, children, element}) => {
  const styles = useStyles();
  const editor = useSlateStatic();
  const readOnly = useReadOnly();
  const handle = useAnchorPointHandle(popupAnchor);
  const [open, setOpen] = React.useState(false);
  const [languageDraft, setLanguageDraft] = React.useState(element.language ?? '');
  const [fileNameDraft, setFileNameDraft] = React.useState(element.fileName ?? '');

  React.useEffect(() => {
    setLanguageDraft(element.language ?? '');
  }, [element.language]);

  React.useEffect(() => {
    setFileNameDraft(element.fileName ?? '');
  }, [element.fileName]);

  const applyMetaValue = React.useCallback(
    (field: 'language' | 'fileName', value: string, currentValue?: string) => {
      const nextValue = value.trim();
      const prevValue = currentValue?.trim() ?? '';
      if (nextValue === prevValue) return;

      const path = ReactEditor.findPath(editor, element);
      if (nextValue) {
        Transforms.setNodes(editor, {[field]: nextValue} as Partial<CodeBlockElementType>, {at: path});
      } else {
        Transforms.unsetNodes(editor, field, {at: path});
      }
    },
    [editor, element],
  );

  const resetDrafts = React.useCallback(() => {
    setLanguageDraft(element.language ?? '');
    setFileNameDraft(element.fileName ?? '');
  }, [element.fileName, element.language]);

  const closePopup = React.useCallback(() => {
    setOpen(false);
    resetDrafts();
  }, [resetDrafts]);

  const handleApply = React.useCallback(() => {
    const nextLanguage = languageDraft.trim();
    const nextFileName = fileNameDraft.trim();

    applyMetaValue('language', nextLanguage, element.language);
    applyMetaValue('fileName', nextFileName, element.fileName);
    setLanguageDraft(nextLanguage);
    setFileNameDraft(nextFileName);
    setOpen(false);
  }, [applyMetaValue, element.fileName, element.language, fileNameDraft, languageDraft]);

  const handleToggle = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setOpen((value) => {
        const next = !value;
        resetDrafts();
        return next;
      });
    },
    [resetDrafts],
  );

  const handleInputKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    event.stopPropagation();
  }, []);

  const handleInputEnter = React.useCallback(
    (event: React.KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      handleApply();
    },
    [handleApply],
  );

  const handleInputEscape = React.useCallback(
    (event: React.KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      closePopup();
    },
    [closePopup],
  );

  const stopPointerPropagation = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const metaBarStyle: React.CSSProperties = {
    borderBottom: `1px solid ${styles.g(0, styles.light ? 0.06 : 0.1)}`,
    background: styles.light ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.78)',
    color: '#475569',
  };

  const codeStyle: React.CSSProperties = {
    color: '#162132',
  };

  const languageValue = element.language?.trim() || '';
  const fileNameValue = element.fileName?.trim() || '';
  const showReadOnlyMeta = !!fileNameValue || !!languageValue;

  const languageMenu = React.useMemo<MenuItem>(
    () => ({
      name: 'Language',
      minWidth: 220,
      children: [
        {
          id: 'plain-text',
          name: 'Plain text',
          onSelect: () => setLanguageDraft(''),
          right: !languageDraft.trim() ? () => <span style={{fontSize: 11, opacity: 0.6}}>Current</span> : undefined,
        },
        {id: 'language-sep', name: 'language-sep', sep: true},
        ...LANGUAGE_OPTIONS.map((option) => ({
          id: option,
          name: option,
          onSelect: () => setLanguageDraft(option),
          right:
            languageDraft.trim().toLowerCase() === option
              ? () => <span style={{fontSize: 11, opacity: 0.6}}>Current</span>
              : undefined,
        })),
      ],
    }),
    [languageDraft],
  );

  return (
    <div {...attributes} className={codeWrapClass} style={{textAlign: element.align}}>
      <Paper round hover>
        {(!readOnly || showReadOnlyMeta) && (
          <div contentEditable={false} className={metaBarClass} style={metaBarStyle}>
            {readOnly ? (
              <div className={metaInputsClass}>
                {!!fileNameValue && <span className={metaLabelClass}>{fileNameValue}</span>}
                {!!languageValue && (
                  <span
                    className={metaChipClass}
                    style={{background: styles.g(0, 0.05), color: '#475569', marginLeft: 'auto'}}
                  >
                    {languageValue}
                  </span>
                )}
              </div>
            ) : (
              <div className={metaInputsClass} onMouseDown={stopPointerPropagation} onClick={stopPointerPropagation}>
                <div className={metaPreviewClass}>
                  <span className={metaLabelClass} style={!fileNameValue ? {opacity: 0.68} : undefined}>
                    {fileNameValue || 'Code block'}
                  </span>
                  {!!languageValue && (
                    <span className={metaChipClass} style={{background: styles.g(0, 0.05), color: '#475569'}}>
                      {languageValue}
                    </span>
                  )}
                </div>

                <div className={metaActionsClass}>
                  <anchorContext.Provider value={handle}>
                    <PopupControlled
                      refToggle={handle.ref}
                      open={open}
                      onEsc={closePopup}
                      onClickAway={closePopup}
                      onHeadClick={handleToggle}
                      renderContext={() => (
                        <EditorContextPopup
                          title="Code block details"
                          subtitle="Set a custom file name and a language for syntax highlighting"
                          minWidth={Math.max(Math.min(560, window.innerWidth * 0.38), 320)}
                          onCancel={closePopup}
                          onApply={handleApply}
                        >
                          <Input
                            type="text"
                            value={fileNameDraft}
                            label="File name"
                            placeholder="snippet.ts"
                            focus={open}
                            onChange={setFileNameDraft}
                            onKeyDown={handleInputKeyDown}
                            onEnter={handleInputEnter}
                            onEsc={handleInputEscape}
                          />

                          <div className={popupFieldRowClass}>
                            <Input
                              type="text"
                              value={languageDraft}
                              label="Language"
                              placeholder="tsx"
                              onChange={setLanguageDraft}
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
                              <BasicButton
                                type="button"
                                width={'auto'}
                                height={32}
                                compact
                                border
                                onMouseDown={preventMouseDown}
                              >
                                Common
                              </BasicButton>
                            </Popup>
                          </div>
                        </EditorContextPopup>
                      )}
                    >
                      <BasicButtonMore
                        type="button"
                        width={28}
                        height={28}
                        rounder
                        tooltip="Code block options"
                        onMouseDown={preventMouseDown}
                      />
                    </PopupControlled>
                  </anchorContext.Provider>
                </div>
              </div>
            )}
          </div>
        )}
        <pre className={codePreClass} style={codeStyle}>
          <code className={codeClass}>{children}</code>
        </pre>
      </Paper>
    </div>
  );
};