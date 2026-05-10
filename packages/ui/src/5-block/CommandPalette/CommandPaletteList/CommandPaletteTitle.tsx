import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';

const blockClass = drule({
  ...lightTheme.font.ui3,
  fz: '12px',
  d: 'block',
  pad: '8px 24px',
  mar: 0,
  textTransform: 'uppercase',
  letterSpacing: '1px',
});

export interface CommandPaletteTitleProps {
  contrast?: boolean;
  children?: React.ReactNode;
}

export const CommandPaletteTitle: React.FC<CommandPaletteTitleProps> = ({contrast, children}) => {
  const styles = useStyles();

  return (
    <h5 className={blockClass({col: styles.g(0.4)})} style={{color: contrast ? styles.g(0) : undefined}}>
      {children}
    </h5>
  );
};
