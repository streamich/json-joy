import Svg from 'iconista';
import {rule, type Scale, lightTheme as theme} from 'nano-theme';
import * as React from 'react';
import {useT} from 'use-t';
import {fonts} from '../../styles/font';
import {useStyles} from '../../styles/context';
import {Link} from '../Link';

const {useState} = React;

const defaultWidth = 32;
const sizes = [10, 16, 20, 24, 32, 40, 48, 64, 128, 256, 512];
const defaultSize = 4;
const fontSizeFactor = 0.5;

/** Selectable avatar outlines, indexed by the `shape` prop. */
export const shapes = [
  '42% 58% 70% 30% / 45% 45% 55% 55%',
  '44% 44% 55% 55%',
  '25% 50% 25% 50%',
  '44% 33% 44% 33%',
  '33% / 44%',
  '40% / 50%',
  '22% / 44%',
  '40% / 333%',
];

const blockClass = rule({
  ...fonts.get('display', 'mid'),
  pos: 'relative',
  d: 'flex',
  flex: '0 0',
  alignItems: 'center',
  justifyContent: 'center',
  ov: 'hidden',
  w: defaultWidth + 'px',
  h: defaultWidth + 'px',
  lh: defaultWidth + 'px',
  bdrad: '50%',
  bg: theme.color.color[0],
  col: '#fff',
  ta: 'center',
  fz: 32 * fontSizeFactor + 'px',
  mar: 0,
  pad: 0,
  bd: 0,
  userSelect: 'none',
  '&:hover': {
    col: '#fff',
  },
});

const hoverableClass = rule({
  '&:hover': {
    mar: '-2px',
  },
});

const squareClass = rule({
  bdrad: '8%',
});

const imgClass = rule({
  d: 'block',
  objectFit: 'cover',
  w: defaultWidth + 'px',
  h: defaultWidth + 'px',
});

const emojiClass = rule({
  bg: 'transparent',
  fz: defaultWidth + 'px',
  lh: defaultWidth + 'px',
});

// Fluid wrapper: establishes a size container so the avatar can size
// itself — the smaller of the parent's two dimensions
const fluidWrapClass = rule({
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  w: '100%',
  h: '100%',
  containerType: 'size',
});

const renderImg = (width: number, src: string, onError: () => void, fill?: boolean) => {
  const props: any = {
    className: imgClass,
    src,
    onError,
  };

  if (width) {
    props.style = {width, height: width};
  } else if (fill) {
    props.style = {width: '100%', height: '100%'};
  }

  // biome-ignore lint/a11y/useAltText: alt is spread from props
  return <img {...props} />;
};

export interface AvatarProps extends Omit<React.AllHTMLAttributes<any>, 'shape'> {
  id?: string; // Used for hashing.
  href?: string;
  size?: Scale;
  width?: number;
  src?: string;
  emoji?: string;
  name?: string;
  grey?: boolean;
  lightGrey?: boolean;
  transparent?: boolean;
  className?: string;
  square?: boolean;
  rounded?: boolean;
  isPrivate?: boolean;
  isOP?: boolean;
  badge?: React.ReactNode;
  hover?: boolean;
  color?: string;
  icon?: any;
  del?: boolean;
  bottomRight?: React.ReactElement;
  noHover?: boolean;
  bold?: boolean;
  letters?: number;
  /** When set and no `size`/`width` is given, the avatar stretches to fill its
   * parent container while staying a square (width === height) box. */
  fluid?: boolean;
  /** Adds a faint background shade behind the content. Useful with `emoji` (which is
   * otherwise transparent) so the underlying circle/square shape of the avatar is visible. */
  fill?: boolean;
  /** Draws a colored ring around the avatar (with a small gap, like a status
   * ring). `true` uses the accent color, or pass a CSS color string. */
  ring?: boolean | string;
  /** Adds a soft colored glow/halo around the avatar. `true` uses the ring or
   * accent color, or pass a CSS color string. */
  glow?: boolean | string;
  /** Selects an irregular/organic outline by index from the {@link shapes} list
   * (blobs and squircle-like forms). Out-of-range values are ignored. */
  shape?: number;
}

export const Avatar: React.FC<AvatarProps> = (allProps) => {
  const {
    id,
    href,
    name,
    emoji: emojiImmutable,
    size,
    src,
    width,
    grey,
    lightGrey,
    transparent,
    className,
    square,
    rounded,
    isPrivate,
    isOP,
    badge,
    hover,
    color,
    icon,
    del,
    bottomRight,
    noHover,
    bold,
    letters,
    fluid,
    fill,
    ring,
    glow,
    shape,
    ...rest
  } = allProps;

  let emoji = emojiImmutable;
  if (del) emoji = '␡';

  const [t] = useT();
  const [error, setError] = useState(false);
  const styles = useStyles();

  const showText = error || !src;
  const props: React.HtmlHTMLAttributes<any> = rest;

  props.className =
    (className || '') +
    blockClass +
    (hover ? hoverableClass : '') +
    (square || emoji ? squareClass : '') +
    (emoji ? emojiClass : '');
  props.style = {...props.style};

  if (bold) {
    props.style.fontWeight = 600;
  }

  if (noHover) {
    props.style.cursor = 'default';
  }

  if (transparent) {
    props.style.background = 'transparent';
  } else if (lightGrey) {
    props.style.background = styles.g(0.1, 0.08);
    props.style.color = styles.g(0.2, 0.4);
    props.style.fill = styles.g(0.2, 0.4);
  } else if (grey || del) {
    props.style.background = styles.g(0.4);
    props.style.color = styles.g(0.9);
    props.style.fill = styles.g(0.9);
  } else if (color) {
    props.style.background = color;
  } else if (fill) {
    props.style.background = styles.g(0.45, 0.1);
  }

  const computedWidth: number = width || (size ? sizes[defaultSize + (size || 0)] : 0);
  const stretch = !!fluid && !computedWidth;

  if (stretch) {
    // `100cqmin` resolves against the fluid wrapper's size container, so the
    // box is always a square sized to the smaller parent dimension and never
    // stretches into an ellipse in a non-square container.
    props.style.flex = '0 0 auto';
    props.style.width = '100cqmin';
    props.style.height = '100cqmin';
  } else {
    props.style.flex = `0 0 ${computedWidth || 32}px`;
    if (computedWidth) {
      props.style.width = computedWidth;
      props.style.height = computedWidth;
      props.style.lineHeight = emoji ? `${computedWidth * 1.07}px` : `${computedWidth}px`;
      props.style.fontSize = emoji
        ? `${computedWidth * 0.85}px`
        : `${styles.easing.saturate(computedWidth * 0.015) * 42}px`;
      if (computedWidth < 24) {
        props.style.fontWeight = 'bold';
        props.style.lineHeight = computedWidth + 1 + 'px';
      }
    }
  }

  if (showText && name && !emoji && !(grey || del) && !lightGrey && !transparent && !color) {
    props.style.background = styles.col.hash(id || name) + '';
  }

  if (rounded) {
    props.style.borderRadius = '25%';
  }

  if (shape !== undefined && shapes[shape]) {
    props.style.borderRadius = shapes[shape];
  }

  if (ring || glow) {
    const ringColor = typeof ring === 'string' ? ring : styles.accent + '';
    const glowColor = typeof glow === 'string' ? glow : ringColor;
    const shadows: string[] = [];
    if (ring) shadows.push(`0 0 0 2px ${styles.bg}`, `0 0 0 4px ${ringColor}`);
    if (glow) shadows.push(`0 0 12px 1px ${glowColor}`);
    props.style.boxShadow = shadows.join(', ');
  }

  if ((grey || del || lightGrey) && !name) {
    props.style.opacity = 0.3;
  }

  const initials = typeof name === 'string' && name.length > 0 ? name.slice(0, letters || 2).trim() : '';
  const nudgeInitials = !!computedWidth && computedWidth < 28;
  let element = icon ? (
    icon
  ) : showText ? (
    emoji ? (
      emoji
    ) : initials ? (
      nudgeInitials ? (
        <span style={{position: 'relative', top: '.05em'}}>{initials}</span>
      ) : (
        initials
      )
    ) : (
      ''
    )
  ) : (
    renderImg(computedWidth, src, () => setError(true), stretch)
  );

  if (href) {
    element = (
      <Link a {...props} to={href}>
        {element}
      </Link>
    );
  } else {
    element = <span {...props}>{element}</span>;
  }

  if (isPrivate || badge || isOP || bottomRight) {
    const size = computedWidth || 32;
    let lock: React.ReactElement | undefined;
    let badgeElement: React.ReactElement | undefined;
    let subAvatarElement: React.ReactElement | undefined;

    if (isPrivate) {
      const lockSize = size * 0.5;
      const iconSize = lockSize * 0.75;
      const lockStyle: React.CSSProperties = {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        top: size * -0.1,
        left: size * -0.1,
        background:
          props.style.background || styles.col.hash(id || name || '') + '' || styles.col.get('error', 'solid-1'),
        width: lockSize + 'px',
        height: lockSize + 'px',
        borderRadius: '50%',
        fill: '#fff',
        color: '#fff',
      };
      lock = (
        <span style={lockStyle} title={t('Private')}>
          <Svg
            set="atlaskit"
            icon="lock-filled"
            width={iconSize}
            height={iconSize}
            style={{margin: `${size <= 40 ? -1 : 0}px 0 0`}}
          />
        </span>
      );
    }

    if (badge || isOP) {
      const badgeSize = size * 0.25;
      badgeElement = (
        <span
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            top: size * -0.035,
            right: size * -0.035,
            background: styles.col.get('warning', 'el-2'),
            border: `1px solid ${styles.bg}`,
            width: badgeSize + 'px',
            height: badgeSize + 'px',
            borderRadius: '50%',
            fill: styles.bg + '',
            color: styles.bg + '',
          }}
        />
      );
    }

    if (bottomRight) {
      const subAvatarSize = size * 0.6;
      subAvatarElement = (
        <span
          style={{
            display: 'inline-block',
            position: 'absolute',
            bottom: -0.2 * subAvatarSize,
            right: -0.3 * subAvatarSize,
          }}
        >
          {bottomRight}
        </span>
      );
    }

    element = (
      <span style={{display: 'inline-block', position: 'relative'}}>
        {element}
        {lock}
        {badgeElement}
        {subAvatarElement}
      </span>
    );
  }

  if (stretch) {
    element = <span className={fluidWrapClass}>{element}</span>;
  }

  return element;
};
