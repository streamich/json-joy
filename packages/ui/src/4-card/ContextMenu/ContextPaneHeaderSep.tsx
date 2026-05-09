import * as React from 'react';
import {useStyles} from '../../styles/context';
import {useTheme} from 'nano-theme';

export const ContextPaneHeaderSep: React.FC = () => {
  const theme = useTheme();
  const style = useStyles();

  return (
    <div style={{background: style.g(0, 0.05), width: '100%', height: 8, marginBottom: -8}}>
      <div
        style={{
          background: theme.isLight ? theme.bg : theme.g(0.94),
          borderRadius: '8px 8px 0 0',
          width: '100%',
          height: '8px',
        }}
      />
    </div>
  );
};
