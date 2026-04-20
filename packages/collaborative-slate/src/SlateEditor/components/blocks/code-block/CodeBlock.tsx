import * as React from 'react';
import {rule} from 'nano-theme';
import {type RenderElementProps, useReadOnly} from 'slate-react';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {CopyButton} from '@jsonjoy.com/ui/lib/2-inline-block/CopyButton';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import type {CodeBlockElement as CodeBlockElementType} from '../../../types';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';
import {css} from 'code-colors-react/lib/style';
import {Label} from '@jsonjoy.com/ui/lib/1-inline/Label';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {CodeBlockOptionsPopup} from './CodeBlockOptionsPopup';

const codeWrapClass = rule({
  pos: 'relative',
  mr: '12px 0',
  ff: '"JetBrains Mono", "Fira Code", Menlo, monospace',
});

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

export interface CodeBlockProps extends RenderElementProps {
  element: CodeBlockElementType;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({attributes, children, element}) => {
  const styles = useStyles();
  const readOnly = useReadOnly();

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