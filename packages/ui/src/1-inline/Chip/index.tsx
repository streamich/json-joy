/**
 * Inline entity *token*: a leading mark ({@link Avatar} or {@link Dot}) plus a
 * short label, sized to flow within a line of text (mentions, tags, a "timer"
 * token in a rich-text document). Unlike `Pill` (a text-only status tag), a Chip
 * stands for a thing and is typically interactive — clickable and/or removable.
 */

import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';
import {ThemeColor} from '../../styles/color';
import {BasicButtonClose} from '../../2-inline-block/BasicButton/BasicButtonClose';
import {Avatar, type AvatarProps} from '../Avatar';
import {Dot, type DotColor} from '../Dot';
import {type NamedTraceContextValue, useRoundnessTrace} from '../../context';
import {easing} from '../../styles/easing';

const ROUNDNESS_MIN_EM = 0.2;
const ROUNDNESS_MAX_EM = 0.85;
const ROUNDNESS_DEFAULT = 0.5;
const roundnessMapping = easing.mapping(ROUNDNESS_MIN_EM, ROUNDNESS_MAX_EM);

const blockClass = drule({
  ...fonts.get('display', 'mid', 0),
  d: 'inline-flex',
  ai: 'center',
  gap: '6px',
  bxz: 'border-box',
  maxWidth: '100%',
  verticalAlign: 'middle',
  pd: '2px 10px 2px 4px',
  fz: '13px',
  lh: '18px',
  bdrad: roundnessMapping(ROUNDNESS_DEFAULT) + 'em',
  whiteSpace: 'nowrap',
});

const smallClass = rule({
  pd: '1px 8px 1px 3px',
  fz: '12px',
  lh: '16px',
});

const textClass = rule({
  ov: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const markClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  flex: '0 0 auto',
  mrr: '-4px',
  '& svg': {d: 'block'},
});

export interface ChipProps extends Pick<NamedTraceContextValue, 'roundness'> {
  /** Leading avatar (identity mark). Takes precedence over {@link ChipProps.icon}/{@link ChipProps.dot}. */
  avatar?: AvatarProps;
  /** Leading icon node (e.g. a file/paperclip/place glyph), when the mark isn't a
   * person or a status. Sized to the avatar/dot mark box. */
  icon?: React.ReactNode;
  /** Leading status dot — a color key/string, or `true` for the neutral dot. */
  dot?: DotColor | true;
  /** Tone the chip in a color: a soft tint of it as the background, the color
   * itself as the foreground (label + `currentColor` icon). Any CSS color. */
  color?: string;
  /** Chip label content. */
  children?: React.ReactNode;
  /** Smaller size variant. */
  small?: boolean;
  /** Makes the whole chip an interactive token (pointer cursor + hover). */
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  /** When set, renders a trailing "×"; its click is isolated from {@link ChipProps.onClick}. */
  onRemove?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: React.CSSProperties;
}

export const Chip: React.FC<ChipProps> = (props) => {
  const {avatar, icon, dot, color, children, small, onClick, onRemove, className, style} = props;
  const styles = useStyles();
  const markSize = small ? 16 : 18;
  const roundness = useRoundnessTrace(props.roundness ?? 0);
  const hasLabel = children !== undefined && children !== null && children !== '';
  const markStyle: React.CSSProperties = {width: markSize, height: markSize, marginRight: hasLabel ? undefined : 0};

  const mark = avatar ? (
    <Avatar width={markSize} {...avatar} />
  ) : icon ? (
    <span className={markClass} style={markStyle}>
      {icon}
    </span>
  ) : dot ? (
    <span className={markClass} style={markStyle}>
      <Dot size={small ? 7 : 8} color={dot === true ? 'neutral' : dot} />
    </span>
  ) : null;

  const tone = color ? ThemeColor.from(color) : undefined;
  const dyn = blockClass({
    bg: tone ? tone.softTint(0.1) : styles.g(0, 0.06),
    col: color ?? styles.g(0.2),
    cur: onClick ? 'pointer' : 'default',
    '&:hover': onClick ? {bg: tone ? tone.softTint(0.22) : styles.g(0, 0.1)} : undefined,
  });

  const finalStyle: React.CSSProperties = {};
  if (!mark) finalStyle.paddingLeft = small ? 8 : 10;
  else if (!hasLabel && !onRemove) finalStyle.paddingRight = small ? 3 : 4;
  if (roundness && roundness !== ROUNDNESS_DEFAULT) finalStyle.borderRadius = roundnessMapping(roundness) + 'em';
  Object.assign(finalStyle, style);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: presentational token; keyboard a11y is the consumer's concern
    <span
      className={dyn + (small ? ' ' + smallClass : '') + (className ? ` ${className}` : '')}
      style={finalStyle}
      onClick={onClick}
    >
      {mark}
      {hasLabel && <span className={textClass}>{children}</span>}
      {!!onRemove && (
        <BasicButtonClose
          comp="span"
          role="button"
          aria-label="Remove"
          round
          size={markSize}
          style={{marginRight: -6, flex: '0 0 auto'}}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e as React.MouseEvent<HTMLButtonElement>);
          }}
        />
      )}
    </span>
  );
};
