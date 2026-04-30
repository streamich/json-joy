import * as React from 'react';
import {DividerProps} from '@jsonjoy.com/ui/lib/5-block/SplitPane';
import {SlimDivider,} from '@jsonjoy.com/ui/lib/5-block/SplitPane/components/SlimDivider';
import {rule} from 'nano-theme';

const handleClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'center',
  w: '100%',
  h: '100%',
  bxz: 'border-box',
  pd: '64px 0',
});

export const Divider: React.FC<DividerProps> = (props) => {
  return (
    <SlimDivider {...props} wide maxHeight={600} handle={handle => (
      <div className={handleClass}>{handle}</div>
    )} />
  );
};
