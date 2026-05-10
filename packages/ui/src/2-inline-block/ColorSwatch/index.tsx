import * as React from 'react';
import {drule, rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {BasicTooltip, type BasicTooltipProps} from '../../4-card/BasicTooltip';

const buttonClass = drule({
  d: 'inline-flex',
  jc: 'center',
  ai: 'center',
  out: 0,
  bd: 0,
  bxz: 'border-box',
  us: 'none',
  cur: 'pointer',
  pos: 'relative',
  flexShrink: 0,
  fz: '13px',
  fw: 600,
  lh: '1',
  ff: 'inherit',
  pd: 0,
  '&:focus-visible': {
    out: '2px solid currentColor',
    outOffset: '2px',
  },
});

const ringClass = rule({
  pos: 'absolute',
  pointerEvents: 'none',
});

export interface ColorSwatchProps {
  color: string;
  textColor?: string;
  kind?: 'bg' | 'fg' | 'fgbg' | 'plain';
  size?: number;
  active?: boolean;
  letter?: string;
  tooltip?: BasicTooltipProps;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  textColor,
  kind = 'plain',
  size = 32,
  active,
  letter = 'A',
  tooltip,
  disabled,
  onClick,
  onMouseDown,
}) => {
  const styles = useStyles();
  const isFg = kind === 'fg';
  const fillColor = isFg ? styles.g(1, 0.0) : color;
  const glyphColor = isFg ? color : (textColor ?? '#FFFFFF');
  const showLetter = kind === 'fg' || kind === 'fgbg';

  const cls = buttonClass({
    w: size + 'px',
    h: size + 'px',
    bg: fillColor,
    bdrad: '6px',
    bd: `1px solid ${styles.g(0, 0.12)}`,
    op: disabled ? 0.5 : 1,
    '&:hover': disabled ? {} : {bd: `1px solid ${styles.g(0, 0.4)}`},
  });

  const button = (
    <button
      type="button"
      className={cls}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {showLetter ? <span style={{color: glyphColor}}>{letter}</span> : null}
      {active ? (
        <span
          className={ringClass}
          style={{
            inset: -3,
            borderRadius: 8,
            border: `2px solid ${styles.col.accent(0, 'solid-1')}`,
          }}
        />
      ) : null}
    </button>
  );

  if (!tooltip) return button;
  return (
    <BasicTooltip nowrap {...tooltip} show={disabled ? false : tooltip.show}>
      {button}
    </BasicTooltip>
  );
};
