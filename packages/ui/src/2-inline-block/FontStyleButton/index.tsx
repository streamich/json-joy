import * as React from 'react';
import {lightTheme, drule, rule} from 'nano-theme';
import {Ripple} from '../../misc/Ripple';
import {useStyles} from '../../styles/context';

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
  minW: 0,
});

const verticalClass = rule({
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

const childrenClass = rule({
  fz: '.65em',
  pdt: '.4em',
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
  const styles = useStyles();

  const activeBg = styles.col.accent(0, 'bg-2');
  const accentColor = styles.col.get('accent', 'solid-1');
  const className =
    (rest.className ?? '') +
    blockClass({
      col: styles.g(0),
      w: size + 'px',
      h: size + 'px',
      bg: active ? activeBg : styles.g(0, 0.01),
      '&:hover': {
        bg: active ? activeBg : styles.g(0, 0.04),
      },
    });

  const classNameText = displayClass({
    ff:
      kind === 'serif'
        ? lightTheme.font.serif.mid.ff
        : kind === 'sans'
          ? lightTheme.font.sans.mid.ff
          : kind === 'slab'
            ? lightTheme.font.slab.mid.ff
            : lightTheme.font.mono.mid.ff,
    fz: size * 0.4 + 'px',
  });

  return (
    <Ripple ms={1000}>
      <button {...rest} type="button" className={className}>
        <span className={verticalClass}>
          <span className={classNameText} style={{color: active ? accentColor : void 0}}>
            {display}
          </span>
          {size > 32 && (
            <span className={childrenClass} style={{color: active ? accentColor : styles.g(0, 0.7)}}>
              {children ?? (kind === 'serif' ? 'Serif' : kind === 'sans' ? 'Sans' : kind === 'slab' ? 'Slab' : 'Mono')}
            </span>
          )}
        </span>
      </button>
    </Ripple>
  );
};
