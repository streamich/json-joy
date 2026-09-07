import * as React from 'react';
import {useRoundnessTrace, useSpacingTrace} from '../../context/traces';
import {useStyles} from '../../styles/context';
import {ghostBtnClass} from './FieldGhostButton';
import {buttonHeightFor, buttonRadiusFor} from './metrics';

export interface ValueCellSurfaceProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Which edge of the row the content is pinned to. `'left'` is the
   * property-panel look (card/block); `'right'` the menu look.
   * @default 'left'
   */
  align?: 'left' | 'right';
  /**
   * Whether the surface fills the cell width (card/block) or hugs its
   * content (context menu). @default true
   */
  stretch?: boolean;
  /** Mute the content (0.7 opacity) — e.g. auto/default value provenance. */
  muted?: boolean;
}

/**
 * The interactive value-cell ghost surface, shared by `ValueCell`'s reveal
 * trigger and `ArgBoolReveal`: hover/active (and focus-visible) highlight,
 * trace-derived height and radius, stretch/align layout, and the `-6px` tuck
 * into the row edge. Purely presentational — behavior (click/keyboard
 * handlers, ARIA roles, `title`) is passed through as regular span props.
 */
export const ValueCellSurface: React.FC<ValueCellSurfaceProps> = (props) => {
  const {align = 'left', stretch = true, muted, style, children, ...rest} = props;
  const styles = useStyles();
  const spacing = useSpacingTrace(0.5);
  const radius = buttonRadiusFor(useRoundnessTrace(0.5) ?? 0.5);
  return (
    <span
      role="button"
      tabIndex={0}
      className={ghostBtnClass({
        bdrad: `${radius}px`,
        '&:hover': {bg: styles.g(0, 0.06)},
        '&:focus-visible': {bg: styles.g(0, 0.06)},
        '&:active': {bg: styles.g(0, 0.1)},
      })}
      style={{
        display: stretch ? 'flex' : 'inline-flex',
        ...(stretch ? {width: '100%', minWidth: 0, overflow: 'hidden'} : null),
        height: buttonHeightFor(spacing),
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        opacity: muted ? 0.7 : 1,
        ...(align === 'right' ? {marginInlineEnd: -6} : {marginInlineStart: -6}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
};
