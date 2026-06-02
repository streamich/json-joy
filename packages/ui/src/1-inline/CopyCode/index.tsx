import * as React from 'react';
import {Code, type CodeProps} from '../Code';
import {CopyButton} from '../../2-inline-block/CopyButton';

export interface CopyCodeProps extends CodeProps {
  value: string;
  truncate?: boolean;
}

export const CopyCode: React.FC<CopyCodeProps> = ({value, truncate, onMouseDown, style, ...rest}) => {
  const codeStyle = truncate ? {minWidth: 0, maxWidth: '100%', ...(style || {})} : style;
  return (
    <Code
      spacious
      {...rest}
      style={codeStyle}
      onMouseDown={(event) => {
        try {
          const element = event.nativeEvent.target;
          if (!element) return;
          if (window.getSelection && document.createRange) {
            const selection = window.getSelection();
            if (!selection) return;
            event.preventDefault();
            const range = document.createRange();
            range.selectNodeContents(element as any);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } catch {}
        onMouseDown?.(event);
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          gap: 2,
          alignItems: 'center',
          maxWidth: '100%',
          minWidth: 0,
          ...(truncate ? {overflow: 'hidden'} : {}),
        }}
      >
        <span
          style={
            truncate
              ? {
                  display: 'inline-block',
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }
              : undefined
          }
        >
          {value}
        </span>
        <CopyButton rounder={rest.roundest} onCopy={() => value} />
      </span>
    </Code>
  );
};
