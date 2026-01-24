import * as React from 'react';
import {drule, useTheme} from 'nano-theme';
import {Ripple} from '../../misc/Ripple';

const blockClass = drule({
  d: 'inline-flex',
  jc: 'space-around',
  ai: 'center',
  bdrad: '16%',
  cur: 'default',
  lh: '1.5em',
  out: 0,
  bd: 0,
  bxz: 'border-box',
  us: 'none',
});

const verticalClass = drule({
  d: 'inline-flex',
  fld: 'column',
  jc: 'space-around',
  ai: 'center',
});

const displayClass = drule({
  d: 'inline-flex',
  jc: 'space-around',
  ai: 'center',
  cur: 'default',
  pdt: '.25em',
});

const childrenClass = drule({
  fz: '.65em',
  pdt: '.35em',
  op: 0.5,
});

export interface FontStyleButtonProps extends React.AllHTMLAttributes<any> {
  kind: 'serif' | 'sans' | 'slab' | 'mono';
  size?: number;
  display?: string;
  active?: boolean;
  children?: React.ReactNode;
}

export const FontStyleButton: React.FC<FontStyleButtonProps> = ({
  kind,
  size = 64,
  display = 'Ag',
  active,
  children,
  ...rest
}) => {
  const theme = useTheme();

  const className =
    (rest.className ?? '') +
    blockClass({
      w: size + 'px',
      h: size + 'px',
      bg: theme.g(0, active ? 0.02 : 0.01),
      '&:hover': {
        bg: theme.g(0, 0.04),
      },
    });

  const classNameText = displayClass({
    ff:
      kind === 'serif'
        ? theme.font.serif.mid.ff
        : kind === 'sans'
          ? theme.font.sans.mid.ff
          : kind === 'slab'
            ? theme.font.slab.mid.ff
            : theme.font.mono.mid.ff,
    fz: size * 0.4 + 'px',
  });

  return (
    <Ripple ms={1000}>
      <button {...rest} type="button" className={className}>
        <span className={verticalClass()}>
          <span className={classNameText} style={{color: active ? theme.color.sem.accent[0] : void 0}}>
            {display}
          </span>
          {size > 32 && (
            <span className={childrenClass()}>
              {children ?? (kind === 'serif' ? 'Serif' : kind === 'sans' ? 'Sans' : kind === 'slab' ? 'Slab' : 'Mono')}
            </span>
          )}
        </span>
      </button>
    </Ripple>
  );
};
