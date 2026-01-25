import * as React from 'react';
import {rule} from 'nano-theme';
import Paper from 'nice-ui/lib/4-card/Paper';
import {Scrollbox} from 'nice-ui/lib/4-card/Scrollbox';

export * from './CardHeader';

const css = {
  header: rule({
    pad: '8px 8px 8px 16px',
  }),
  content: rule({
    pad: '0 8px 8px',
  }),
};

export interface CardProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({header, children}) => {
  return (
    <Paper>
      {!!header && <div className={css.header}>{header}</div>}
      {!!children && (
        <Scrollbox style={{maxHeight: 600}}>
          <div className={css.content}>{children}</div>
        </Scrollbox>
      )}
    </Paper>
  );
};
