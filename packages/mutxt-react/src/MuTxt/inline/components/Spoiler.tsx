import * as React from 'react';
import {rule, drule, useTheme} from 'nano-theme';

const blockClass = drule({
  bg: '#222',
  col: 'transparent',
});

const radius = 'calc(min(3px,.15em))';

const startClass = rule({
  borderTopLeftRadius: radius,
  borderBottomLeftRadius: radius,
});

const endClass = rule({
  borderTopRightRadius: radius,
  borderBottomRightRadius: radius,
});

export interface SpoilerProps {
  children: React.ReactNode;
}

export const Spoiler: React.FC<SpoilerProps> = (props) => {
  const {children} = props;
  const theme = useTheme();

  let isRevealed = false;

  const className =
    blockClass({
      bg: isRevealed ? theme.g(0.2, 0.1) : '#222',
      col: isRevealed ? 'inherit' : 'transparent',
      '& *': {
        col: isRevealed ? 'inherit' : 'transparent',
      },
    }) + startClass + endClass;

  return <span className={className}>{children}</span>;
};
