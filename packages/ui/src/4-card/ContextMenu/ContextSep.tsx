import * as React from 'react';
import {useTheme, rule} from 'nano-theme';

const h = React.createElement;

const separatorClass = rule({
  h: '1px',
  mar: '3px 0',
  w: '100%',
});

export interface ContextSepProps {
  line?: boolean;
  grey?: boolean;
  small?: boolean;
  noMargin?: boolean;
}

export const ContextSep: React.FC<ContextSepProps> = ({line, grey, small, noMargin}) => {
  const theme = useTheme();

  const props: any = {
    className: separatorClass,
  };

  if (line) {
    props.style = {
      background: theme.isLight ? theme.g(0.92) : theme.g(0.8),
    };
  }

  if (grey) {
    props.style = {
      height: small ? 3 : 7,
      margin: 0,
      background: theme.isLight ? theme.g(0.985) : theme.g(0.92),
    };
  }

  if (noMargin) {
    props.style.margin = 0;
  }

  return h('div', props);
};
