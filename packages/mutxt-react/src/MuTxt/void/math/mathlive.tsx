import * as React from 'react';
import {rule} from 'nano-theme';

import 'mathlive';
import 'mathlive/fonts.css';
import 'mathlive/static.css';

const equationSelectedClass = rule({
  '&::part(render)': {
    bg: 'var(--selection-color-blurred)',
    bdrad: '2px',
  },
});

const equationFocusedClass = rule({
  '&::part(render)': {
    bg: 'var(--selection-color)',
    bdrad: '2px',
  },
});

export type MathDisplayMode = 'textstyle' | 'displaystyle';

export interface MathSpanProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  tex: string;
  mode?: MathDisplayMode;
  focused?: boolean;
  selected?: boolean;
  dark?: boolean;
}

export const MathSpan: React.FC<MathSpanProps> = ({
  tex,
  mode = 'textstyle',
  focused,
  selected,
  dark,
  style,
  ...props
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);

  if (ref.current && ref.current.textContent !== tex) {
    ref.current.textContent = tex;
    try {
      (ref.current as any).render?.();
    } catch {}
  }

  const themedStyle: React.CSSProperties = {
    color: 'inherit',
    colorScheme: dark ? 'dark' : 'light',
    ...style,
  };

  return React.createElement(
    'math-span',
    {
      ...props,
      ref,
      mode,
      style: themedStyle,
      className: selected ? (focused ? equationFocusedClass : equationSelectedClass) : '',
    },
    tex,
  );
};
