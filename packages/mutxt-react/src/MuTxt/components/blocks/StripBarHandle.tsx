import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';

export const stripBarHandleTriggerClass = 'mutxt-strip-handle';
export const stripBarHandleFillClass = 'mutxt-strip-handle-fill';

const triggerClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'flex-start',
  w: '48px',
  h: '14px',
  pad: 0,
  bd: 'none',
  bg: 'transparent',
  cur: 'default',
  opacity: 0,
  pointerEvents: 'none',
  color: 'var(--mutxt-handle-color, currentColor)',
  trs: 'opacity .12s ease, color .12s ease, transform .12s ease',
  '&:active': {
    transform: 'scale(.97)',
  },
  '&:hover': {
    color: 'var(--mutxt-handle-color-hover, var(--mutxt-handle-color, currentColor))',
  },
  [`&:hover .${stripBarHandleFillClass}`]: {
    h: '5px',
  },
});

const fillClass = rule({
  d: 'block',
  w: '40%',
  h: '3px',
  bdrad: '2px',
  bg: 'currentColor',
  trs: 'background-color .12s ease, width .25s ease, height .12s ease',
});

export interface StripBarHandleProps {
  /** Tooltip text shown when the user hovers the handle. */
  tooltip?: React.ReactNode;
  /** Accessibility label for the underlying button. */
  ariaLabel?: string;
  /** Fired on click. */
  onActivate: () => void;
  visible?: boolean;
  color?: string;
  colorHover?: string;
  width?: number | string;
}

export const StripBarHandle: React.FC<StripBarHandleProps> = ({
  tooltip,
  ariaLabel,
  onActivate,
  visible,
  color,
  colorHover,
  width,
}) => {
  const onMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onActivate();
    },
    [onActivate],
  );

  const buttonStyle: React.CSSProperties = {};
  if (visible !== undefined) {
    buttonStyle.opacity = visible ? 1 : 0;
    buttonStyle.pointerEvents = visible ? 'auto' : 'none';
  }
  if (color !== undefined) (buttonStyle as Record<string, unknown>)['--mutxt-handle-color'] = color;
  if (colorHover !== undefined) (buttonStyle as Record<string, unknown>)['--mutxt-handle-color-hover'] = colorHover;
  if (width !== undefined) buttonStyle.width = width;
  const fillStyle: React.CSSProperties | undefined = visible ? {width: '100%'} : undefined;
  const titleAttr = !tooltip && ariaLabel ? ariaLabel : undefined;

  const button = (
    <button
      type="button"
      className={`${triggerClass} ${stripBarHandleTriggerClass}`}
      title={titleAttr}
      aria-label={ariaLabel}
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={Object.keys(buttonStyle).length > 0 ? buttonStyle : undefined}
    >
      <span className={`${fillClass} ${stripBarHandleFillClass}`} style={fillStyle} />
    </button>
  );

  return tooltip ? (
    <BasicTooltip renderTooltip={() => tooltip} nowrap delay={400}>
      {button}
    </BasicTooltip>
  ) : (
    button
  );
};
