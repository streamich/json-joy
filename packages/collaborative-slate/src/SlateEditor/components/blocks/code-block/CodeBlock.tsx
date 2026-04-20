import * as React from 'react';
import {rule} from 'nano-theme';
import {Transforms} from 'slate';
import {ReactEditor, type RenderElementProps, useReadOnly, useSlateStatic} from 'slate-react';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {CopyButton} from '@jsonjoy.com/ui/lib/2-inline-block/CopyButton';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {PopupControlled} from '@jsonjoy.com/ui/lib/4-card/Popup/PopupControlled';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {anchorContext, useAnchorPointHandle} from '@jsonjoy.com/ui/lib/utils/popup/context';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import {EditorContextPopup} from '../../chrome/EditorContextPopup';
import type {CodeBlockElement as CodeBlockElementType} from '../../types';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';
import {css} from 'code-colors-react/lib/style';
import {Label} from '@jsonjoy.com/ui/lib/1-inline/Label';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';

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

const codeWrapClass = rule({
  pos: 'relative',
  mr: '12px 0',
  ff: '"JetBrains Mono", "Fira Code", Menlo, monospace',
});

const popupAnchor = {center: true, gap: 12, topIf: 180};

const metaBarClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '12px',
  pd: '8px 14px',
  fw: 'wrap',
  us: 'none',
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
  fz: '12px',
});

const codePreClass = rule({
  mr: '0',
  ovx: 'auto',
  d: 'flex',
  ai: 'stretch',
  trs: 'background .3s',
  [`.${codeWrapClass.trim()}:hover &`]: {
    bg: 'var(--code-hover-bg)',
  },
  ...css(),
});

const gutterClass = rule({
  flexShrink: 0,
  pd: '16px 12px 18px 18px',
  us: 'none',
  pe: 'none',
  ff: '"JetBrains Mono", "Fira Code", Menlo, monospace',
  fz: '0.9rem',
  lh: '1.7',
  op: 0.3,
  whiteSpace: 'pre',
  ta: 'right',
  bdr: '1px solid rgba(127,127,127,0.22)',
});

const codeClass = rule({
  ff: '"JetBrains Mono", "Fira Code", Menlo, monospace',
  fz: '0.9rem',
  lh: '1.7',
  d: 'block',
  pos: 'relative',
  flex: '1',
  minW: '0',
  pd: '16px 18px 18px 14px',
  '&::before': {
    content: '""',
    pos: 'absolute',
    t: '0',
    h: '100%',
    l: '80ch',
    w: '1px',
    bg: 'rgba(127,127,127,0.06)',
    pointerEvents: 'none',
  },
});

const popupFieldRowClass = rule({
  d: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '8px',
  ai: 'center',
});

export interface CodeBlockProps extends RenderElementProps {
  element: CodeBlockElementType;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({attributes, children, element}) => {
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

  const getCodeText = React.useCallback(
    () => element.children.map((c) => c.text).join(''),
    [element.children],
  );

  const metaBarStyle: React.CSSProperties = {
    borderBottom: `1px solid ${styles.g(0, styles.light ? 0.06 : 0.1)}`,
  };

  const lineCount = React.useMemo(() => {
    const text = element.children.map((c) => c.text).join('');
    return (text.match(/\n/g)?.length ?? 0) + 1;
  }, [element.children]);

  const lineNumbers = React.useMemo(
    () => Array.from({length: lineCount}, (_, i) => String(i + 1)).join('\n'),
    [lineCount],
  );

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

  const header = (!readOnly || showReadOnlyMeta) && (
    <div contentEditable={false} className={metaBarClass} style={metaBarStyle}>
      {readOnly ? (
        <div className={metaInputsClass}>
          {!!fileNameValue && <span className={metaLabelClass} style={{opacity: !fileNameValue ? 0.68 : undefined, marginLeft: !fileNameValue ? 0 : lineCount > 10 ? 34 : 26}}>{fileNameValue || 'Code block'}</span>}
          <CopyButton onCopy={getCodeText} width={28} height={28} rounder onMouseDown={preventMouseDown} />
        </div>
      ) : (
        <div className={metaInputsClass} onMouseDown={stopPointerPropagation} onClick={stopPointerPropagation}>
          <div className={metaPreviewClass}>
            <span className={metaLabelClass} style={{opacity: !fileNameValue ? 0.68 : undefined, marginLeft: !fileNameValue ? 0 : lineCount > 10 ? 34 : 26}}>
              {fileNameValue || <Iconista set="bootstrap" icon="file-earmark-code" width={16} height={16} />}
            </span>
          </div>

          <div className={metaActionsClass}>
            {!!languageValue && <Label className={metaChipClass}>{languageValue}</Label>}
            <CopyButton onCopy={getCodeText} width={28} height={28} rounder onMouseDown={preventMouseDown} />
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
                    minWidth={Math.max(Math.min(333, window.innerWidth * 0.38), 320)}
                    onCancel={closePopup}
                    onApply={handleApply}
                  >
                    <Input
                      type="text"
                      value={fileNameDraft}
                      label="File name"
                      placeholder="file.txt"
                      onChange={setFileNameDraft}
                      onKeyDown={handleInputKeyDown}
                      onEnter={handleInputEnter}
                      onEsc={handleInputEscape}
                      onBlur={() => {
                        if (languageDraft.trim() === '') {
                          const extension = fileNameDraft.split('.').pop()?.trim() || '';
                          if (extension && extension !== languageDraft.trim()) {
                            setLanguageDraft(extension);
                          }
                        }
                      }}
                    />

                    <div className={popupFieldRowClass}>
                      <Input
                        type="text"
                        value={languageDraft}
                        label="Language"
                        placeholder="txt"
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
                        <BasicButtonMore
                          type="button"
                          size={32}
                          compact
                          rounder
                          onMouseDown={preventMouseDown}
                        />
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
  );

  return (
    <div {...attributes} className={codeWrapClass} style={{'--code-hover-bg': styles.g(0, 0.02), textAlign: element.align} as React.CSSProperties}>
      <Paper round hover>
        {header}
        <pre className={codePreClass}>
          <div contentEditable={false} className={gutterClass} aria-hidden="true">{lineNumbers}</div>
          <code className={codeClass}>{children}</code>
        </pre>
      </Paper>
    </div>
  );
};