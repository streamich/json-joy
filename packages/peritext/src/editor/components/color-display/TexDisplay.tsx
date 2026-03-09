import * as React from 'react';
import {rule} from 'nano-theme';
import {fonts} from '@jsonjoy.com/ui/lib/styles';

const textClass = rule({
  ...fonts.get('mono', 'bold', 0),
  d: 'inline-block',
  fw: 'bold',
  maxW: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export interface TextDisplayProps {
  /** Select on click. */
  select?: boolean;
  children: React.ReactNode;
}

export const TextDisplay: React.FC<TextDisplayProps> = ({select, children}) => {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Non-a11y onClick is fine here
    <span
      className={textClass}
      onClick={
        select
          ? (e) => {
              const range = document.createRange();
              range.selectNodeContents(e.currentTarget);
              const sel = window.getSelection();
              if (!sel) return;
              sel.removeAllRanges();
              sel.addRange(range);
              e.preventDefault();
              e.stopPropagation();
            }
          : undefined
      }
    >
      {children}
    </span>
  );
};

export interface MutedProps {
  inert?: boolean;
  children: React.ReactNode;
}

export const Muted: React.FC<MutedProps> = ({inert, children}) => {
  const style: React.CSSProperties = {
    opacity: 0.6,
  };

  if (inert) style.userSelect = 'none';

  return <span style={style}>{children}</span>;
};
