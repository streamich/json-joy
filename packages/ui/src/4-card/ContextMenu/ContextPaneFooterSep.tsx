import * as React from 'react';
import {useStyles} from '../../styles/context';

/**
 * Mirror of {@link ContextPaneHeaderSep} for the bottom edge of a pane.
 */
export const ContextPaneFooterSep: React.FC = () => {
  const styles = useStyles();

  return (
    <div style={{background: styles.g(0, 0.05), width: '100%', height: 8, marginTop: -8}}>
      <div
        style={{
          background: styles.light ? styles.bg + '' : styles.g(0.94),
          borderRadius: '0 0 8px 8px',
          width: '100%',
          height: '8px',
        }}
      />
    </div>
  );
};
