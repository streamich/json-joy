import * as React from 'react';
import {DividerProps} from '@jsonjoy.com/ui/lib/5-block/SplitPane';
import {SlimDivider,} from '@jsonjoy.com/ui/lib/5-block/SplitPane/components/SlimDivider';
import {rule} from 'nano-theme';
import {contentClass, outerClass} from './css';

const handleClass = rule({
  pos: 'relative',
  w: '100%',
  h: '100%',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  bxz: 'border-box',
  pd: '64px 0',
  op: 0,
  [`.${outerClass.trim()}:hover &`]: {
    op: 1,
  },
  [`.${outerClass.trim()}:has(.${contentClass.trim()}:hover) &:not(:hover)`]: {
    op: 0,
  }
});

export const Divider: React.FC<DividerProps> = (props) => {
  return (
    <SlimDivider {...props} wide maxHeight={600} handle={handle => (
      <div className={handleClass}>{handle}</div>
    )} />
  );
};
