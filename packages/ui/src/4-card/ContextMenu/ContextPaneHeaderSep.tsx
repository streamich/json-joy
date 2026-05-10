import * as React from 'react';
import {useStyles} from '../../styles/context';

export const ContextPaneHeaderSep: React.FC = () => {
  const styles = useStyles();

  return (
    <div style={{background: styles.g(0, 0.05), width: '100%', height: 8, marginBottom: -8}}>
      <div
        style={{
          background: styles.light ? styles.bg + '' : styles.g(0.94),
          borderRadius: '8px 8px 0 0',
          width: '100%',
          height: '8px',
        }}
      />
    </div>
  );
};
