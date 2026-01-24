import * as React from 'react';
import {rule, useTheme} from 'nano-theme';

const blockClass = rule({
  h: '1px',
  ov: 'hidden',
});

export interface Props {
  invisible?: boolean;
  hard?: boolean;
  style?: React.CSSProperties;
}

export const Separator: React.FC<Props> = ({invisible, hard, style}) => {
  const theme = useTheme();
  return (
    <div
      className={blockClass}
      style={{
        ...(style || {}),
        background: invisible ? undefined : theme.g(0, (hard ? 2 : 1) * (theme.isLight ? 0.08 : 0.12)),
      }}
    />
  );
};
