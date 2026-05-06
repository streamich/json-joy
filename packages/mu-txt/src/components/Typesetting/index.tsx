import * as React from 'react';
import {rule} from 'nano-theme';
import {useT} from 'use-t';
import {fonts} from '@jsonjoy.com/ui/lib/styles';

const blockClass = rule({
  ...fonts.get('sans', 'mid', 0),
  fz: '13.4px',
  lh: '1.6em',
  p: {
    mr: 0,
    pd: '4px 0',
  },
  a: {
    textDecoration: 'underline',
    textDecorationThickness: '1px',
    textUnderlineOffset: '4px',
    textDecorationColor: 'rgb(from currentColor r g b / 0.2)',
    '&:hover': {
      textDecorationColor: 'currentColor',
    },
  },
  code: {
    lh: '1.3em',
  },
  'ol, ul': {
    mr: 0,
    pd: '4px 0 4px 20px',
  },
  li: {
    pd: '4px 0',
  },
  h6: {
    fz: '1.05em',
    fw: 600,
    mr: '16px 0 4px',
  },
  h5: {
    fz: '1.1em',
    fw: 600,
    mr: '16px 0 4px',
  },
  h4: {
    fz: '1.25em',
    fw: 600,
    mr: '16px 0 4px',
  },
  h3: {
    fz: '1.3em',
    fw: 700,
    mr: '16px 0 4px',
    o: 0.88,
    lh: '1.4em',
  },
  h2: {
    fz: '1.5em',
    fw: 700,
    mr: '16px 0 4px',
  },
  h1: {
    fz: '2em',
    fw: 700,
    mr: '16px 0 4px',
  },
});

export interface TypesettingProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Typesetting: React.FC<TypesettingProps> = ({children, ...props}) => {
  const [_t] = useT();

  return (
    <div {...props} className={blockClass + ' ' + (props.className || '')}>
      {children}
    </div>
  );
};
