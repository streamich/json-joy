import * as React from 'react';
import {rule} from 'nano-theme';
import type {RenderElementProps} from 'slate-react';
import type {CodeBlockElement as CodeBlockElementType} from '../../types';

const codeWrapClass = rule({
  pos: 'relative',
  m: '20px 0',
});

const languageChipClass = rule({
  pos: 'absolute',
  t: '10px',
  r: '12px',
  fz: '11px',
  tt: 'uppercase',
  ls: '0.08em',
  pd: '3px 7px',
  bdrad: '999px',
});

export interface CodeBlockElementProps extends RenderElementProps {
  element: CodeBlockElementType;
}

export const CodeBlockElement: React.FC<CodeBlockElementProps> = ({attributes, children, element}) => {
  const language = element.language || 'code';

  return (
    <div {...attributes} className={codeWrapClass} style={{textAlign: element.align}}>
      <div
        contentEditable={false}
        className={languageChipClass}
        style={{background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.72)'}}
      >
        {language}
      </div>
      <pre
        style={{
          margin: 0,
          overflowX: 'auto',
          padding: '18px 18px 16px',
          borderRadius: '18px',
          background:
            'linear-gradient(180deg, rgba(12,18,28,0.98) 0%, rgba(18,28,42,0.98) 100%), radial-gradient(circle at top left, rgba(255,255,255,0.06), transparent 40%)',
          color: 'rgba(235,242,255,0.94)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          fontFamily: '"JetBrains Mono", "Fira Code", Menlo, monospace',
          fontSize: '0.9rem',
          lineHeight: 1.7,
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
};