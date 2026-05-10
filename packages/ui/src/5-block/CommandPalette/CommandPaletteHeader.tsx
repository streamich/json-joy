import * as React from 'react';
import {lightTheme, rule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const height = 32;

const blockClass = rule({
  ...lightTheme.font.ui2.mid,
  d: 'flex',
  fl: `0 0 ${height}px`,
  ai: 'center',
  fd: 'row-reverse',
  h: `${height}px`,
  fz: '12px',
  pd: '0 24px',
  bxz: 'border-box',
});

export interface CommandPaletteHeaderProps {
  bg?: boolean;
  left?: boolean;
  children: React.ReactNode;
}

export const CommandPaletteHeader: React.FC<CommandPaletteHeaderProps> = ({bg, left, children}) => {
  const styles = useStyles();

  return (
    <div
      className={blockClass}
      style={{
        color: styles.g(0.4),
        background: bg ? styles.g(0, 0.04) : undefined,
        flexDirection: left ? 'row' : undefined,
      }}
    >
      {children}
    </div>
  );
};
