import * as React from 'react';
import {drule, rule, useTheme} from 'nano-theme';
import {type RenderElementProps, useReadOnly} from 'slate-react';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {CopyButton} from '@jsonjoy.com/ui/lib/2-inline-block/CopyButton';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';
import {ColorTokens} from 'code-colors-react';
import {Label} from '@jsonjoy.com/ui/lib/1-inline/Label';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {SetTrace} from '@jsonjoy.com/ui';
import {CodeBlockOptionsPopup} from './CodeBlockOptionsPopup';
import * as settings from './settings';
import type {CodeBlockElement as CodeBlockElementType} from '../../../types';

const CODE_LINE_HEIGHT = 1.7;

const SHARED_TEXT_CSS = {
  ff: '"JetBrains Mono", "Fira Code", Menlo, monospace',
  fz: '0.9rem',
  lh: `${CODE_LINE_HEIGHT}em`,
  pd: '16px 18px 18px 14px',
  mr: 0,
  letterSpacing: '0',
  tabSize: 4,
  fontKerning: 'none',
  fontVariantLigatures: 'none',
  fontFeatureSettings: 'normal',
} as const;

const codeWrapClass = rule({
  pos: 'relative',
  mr: '12px 0',
  ff: '"JetBrains Mono", "Fira Code", Menlo, monospace',
  containerType: 'scroll-state',
});

const stickyHeaderClass = rule({
  pos: 'sticky',
  t: 0,
  z: 1,
  containerType: 'scroll-state',
});

const metaBarClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '12px',
  pd: '8px 14px',
  fw: 'wrap',
  us: 'none',
  bdrad: '16px 16px 0 0',
  trs: 'border-bottom-left-radius .3s, border-bottom-right-radius .3s',
  '@container scroll-state(stuck: top)': {
    '&': {
      bdrad: '0 0 16px 16px',
    },
  },
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
  w: '100%',
  ovx: 'auto',
  lh: `${CODE_LINE_HEIGHT}em`,
  d: 'flex',
  ai: 'stretch',
  trs: 'background .3s',
  [`.${codeWrapClass.trim()}:hover &`]: {
    bg: 'var(--code-hover-bg)',
  },
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

const codeClass = drule({
  ...SHARED_TEXT_CSS,
  d: 'block',
  pos: 'relative',
  flex: '1',
  minW: '0',
  '&::selection': {
    bg: 'rgba(0,127,255,0.36)',
    col: 'inherit',
  },
  '&::before': {
    content: '""',
    pos: 'absolute',
    t: '0',
    h: '100%',
    w: '1px',
    bg: 'rgba(127,127,127,0.06)',
    pointerEvents: 'none',
  },
});

const overlayClass = rule({
  ...SHARED_TEXT_CSS,
  pos: 'absolute',
  t: 0,
  l: 0,
  r: 0,
  b: 0,
  pe: 'none',
  us: 'none',
  ov: 'hidden',
  '& *': {
    fontWeight: 'inherit',
    fontStyle: 'inherit',
    padding: 0,
    margin: 0,
    border: 0,
    cursor: 'inherit',
  },
});

export interface CodeBlockProps extends RenderElementProps {
  element: CodeBlockElementType;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({attributes, children, element}) => {
  const styles = useStyles();
  const theme = useTheme();
  const readOnly = useReadOnly();

  const stopPointerPropagation = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const codeText = React.useMemo(() => element.children.map(({text}) => text).join(''), [element.children]);

  const getCodeText = React.useCallback(() => codeText, [codeText]);

  const metaBarStyle: React.CSSProperties = {
    borderBottom: `1px solid ${styles.g(0, styles.light ? 0.06 : 0.1)}`,
    background: theme.bg,
  };

  const lineCount = React.useMemo(() => {
    return (codeText.match(/\n/g)?.length ?? 0) + 1;
  }, [codeText]);

  const lineNumbers = React.useMemo(
    () => Array.from({length: lineCount}, (_, i) => String(i + 1)).join('\n'),
    [lineCount],
  );

  const languageValue = element.language?.trim() || '';
  const fileNameValue = element.fileName?.trim() || '';
  const showReadOnlyMeta = !!fileNameValue || !!languageValue;
  const wrapColumn = settings.getCodeBlockWrapColumn(element.wrap);
  const showLineNumbers = settings.getCodeBlockShowLineNumbers(element.showLineNumbers);
  const metaLabelMarginLeft = showLineNumbers ? (lineCount > 10 ? 34 : 26) : 0;
  const codeClassName = codeClass({
    textDecorationColor: styles.g(0),
    '&::before': {
      l: `${wrapColumn}ch`,
    },
  });

  const codeStyle: React.CSSProperties = {
    paddingLeft: showLineNumbers ? '14px' : '18px',
    caretColor: styles.g(0),
    color: languageValue ? 'rgba(127,127,127,.1)' : void 0,
  };

  const codeOverlayStyle: React.CSSProperties = {
    paddingLeft: showLineNumbers ? '14px' : '18px',
  };

  const codeContent = (
    <pre className={codePreClass}>
      {showLineNumbers ? (
        <div contentEditable={false} className={gutterClass} aria-hidden="true">
          {lineNumbers}
        </div>
      ) : null}
      <code className={codeClassName} style={codeStyle}>
        {!!languageValue && (
          <pre className={overlayClass} style={codeOverlayStyle} aria-hidden="true" contentEditable={false}>
            <ColorTokens as="span" code={codeText} lang={languageValue} />
          </pre>
        )}
        <SetTrace name="isInCodeBlock" value={true}>
          {children}
        </SetTrace>
      </code>
    </pre>
  );

  const header = (!readOnly || showReadOnlyMeta) && (
    <div contentEditable={false} className={stickyHeaderClass}>
      <div className={metaBarClass} style={metaBarStyle}>
        {readOnly ? (
          <div className={metaInputsClass}>
            {!!fileNameValue && (
              <span
                className={metaLabelClass}
                style={{
                  opacity: !fileNameValue ? 0.68 : undefined,
                  marginLeft: !fileNameValue ? 0 : metaLabelMarginLeft,
                }}
              >
                {fileNameValue || 'Code block'}
              </span>
            )}
            <CopyButton onCopy={getCodeText} width={28} height={28} rounder onMouseDown={preventMouseDown} />
          </div>
        ) : (
          // biome-ignore lint/a11y/useKeyWithClickEvents: click handler only stops propagation; keyboard interaction lives on inner inputs
          <div className={metaInputsClass} onMouseDown={stopPointerPropagation} onClick={stopPointerPropagation}>
            <div className={metaPreviewClass}>
              <span
                className={metaLabelClass}
                style={{
                  opacity: !fileNameValue ? 0.68 : undefined,
                  marginLeft: !fileNameValue ? 0 : metaLabelMarginLeft,
                }}
              >
                {fileNameValue || <Iconista set="bootstrap" icon="file-earmark-code" width={16} height={16} />}
              </span>
            </div>

            <div className={metaActionsClass}>
              {!!languageValue && <Label className={metaChipClass}>{languageValue}</Label>}
              <CopyButton onCopy={getCodeText} width={28} height={28} rounder onMouseDown={preventMouseDown} />
              <Popup renderContext={() => <CodeBlockOptionsPopup element={element} />}>
                <BasicButtonMore
                  type="button"
                  width={28}
                  height={28}
                  rounder
                  tooltip="Code block options"
                  onMouseDown={preventMouseDown}
                />
              </Popup>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      {...attributes}
      className={codeWrapClass}
      style={{'--code-hover-bg': styles.g(0, 0.02), textAlign: element.align} as React.CSSProperties}
    >
      <Paper round hover>
        {header}
        {codeContent}
      </Paper>
    </div>
  );
};
