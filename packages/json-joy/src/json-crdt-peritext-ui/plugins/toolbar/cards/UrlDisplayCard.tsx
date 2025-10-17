import * as React from 'react';
import {rule} from 'nano-theme';
import {Paper} from 'nice-ui/lib/4-card/Paper';
import {UrlDisplayLayout, type UrlDisplayLayoutProps} from '../components/UrlDisplayLayout';

const blockClass = rule({
  w: '100%',
  minW: '220px',
  bxz: 'border-box',
  pd: '16px',
});

export interface UrlDisplayCardProps extends UrlDisplayLayoutProps {}

export const UrlDisplayCard: React.FC<UrlDisplayCardProps> = (props) => {
  return (
    <Paper className={blockClass} fill={2} noOutline round>
      <UrlDisplayLayout {...props} />
    </Paper>
  );
};
