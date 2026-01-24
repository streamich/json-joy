import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  w: '100%',
  d: 'flex',
});

const itemClass = rule({
  op: 0.8,
  '&:hover': {
    op: 1,
  },
});

export interface AvatarStackProps {
  gap?: number;
  noHoverEffect?: boolean;
  children?: React.ReactNode | undefined;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({gap = 0, noHoverEffect: noHover, children}) => {
  const list = React.Children.map(children, (el, index) =>
    !el ? null : (
      <div key={index} className={noHover ? undefined : itemClass} style={{marginLeft: gap}}>
        {el}
      </div>
    ),
  );

  if (!list) return null;

  return (
    <div className={blockClass} style={{marginLeft: -gap}}>
      {list.filter(Boolean)}
    </div>
  );
};
