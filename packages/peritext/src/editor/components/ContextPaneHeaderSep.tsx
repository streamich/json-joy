import * as React from 'react';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';

export const ContextPaneHeaderSep: React.FC = () => {
  const style = useStyles();

  return (
    <div style={{background: style.g(0, 0.05), width: '100%', height: '8px'}}>
      <div
        style={{background: style.col.mapped('bg') + '', borderRadius: '8px 8px 0 0', width: '100%', height: '8px'}}
      />
    </div>
  );
};
