import * as React from 'react';
import {rule, theme} from 'nano-theme';
import HighlightCode from '../../../1-inline/HighlightCode';

const css = {
  block: rule({
    ...theme.font.mono.mid,
    fz: '12px',
    pad: '0 8px',
    mar: 0,
    pre: {
      mar: 0,
      pad: 0,
    },
  }),
};

export interface BlockTextProps {
  src: string;
  compact?: boolean;
  select?: boolean;
  lang?: string;
}

export const BlockText: React.FC<BlockTextProps> = ({src, compact, select, lang}) => {
  const style: React.CSSProperties = {
    padding: compact ? '0' : undefined,
    fontSize: compact ? '11px' : undefined,
  };

  return (
    <pre
      className={css.block}
      style={style}
      onMouseDown={
        select
          ? (event) => {
              const el = event.nativeEvent.target as HTMLInputElement;
              if (!el) return;
              if (window.getSelection && document.createRange) {
                const selection = window.getSelection();
                if (!selection) return;
                event.preventDefault();
                const range = document.createRange();
                range.selectNodeContents(el);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          : void 0
      }
    >
      {lang ? <HighlightCode code={src} lang={lang}></HighlightCode> : <code>{src}</code>}
    </pre>
  );
};
