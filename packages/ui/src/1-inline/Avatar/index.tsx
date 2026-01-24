import * as React from 'react';
import {lightTheme as theme, type Scale, rule, useTheme} from 'nano-theme';
import Svg from 'iconista';
import {useT} from 'use-t';
import {LogoStatic} from '../LogoStatic';
import {Link} from '../Link';
import {useStyles} from '../../styles/context';

const {useState} = React;

const defaultWidth = 32;
const sizes = [10, 16, 20, 24, 32, 40, 48, 64, 128, 256, 512];
const defaultSize = 4;
const fontSizeFactor = 0.5;

const blockClass = rule({
  ...theme.font.ui1.mid,
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
  cur: 'pointer',
  userSelect: 'none',
  '&:hover': {
    col: '#fff',
  },
});

const hoverableClass = rule({
  '&:hover': {
    mar: '-2px',
    // bd: `2px solid ${theme.color.sem.warning[0]}`,
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

const postClass = rule({
  bg: 'transparent',
  bd: `1px solid ${theme.g(0.5)}`,
  col: theme.g(0.3),
  '&:hover': {
    bd: `1px solid ${theme.g(0.4)}`,
    col: theme.g(0.1),
  },
});

const renderImg = (width: number, src: string, onError: () => void) => {
  const props: any = {
    className: imgClass,
    src,
    onError,
  };

  if (width) {
    props.style = {
      width,
      height: width,
    };
  }

  return <img {...props} />;
};

export interface AvatarProps extends React.AllHTMLAttributes<any> {
  id?: string; // Used for hashing.
  href?: string;
  size?: Scale;
  width?: number;
  src?: string;
  emoji?: string;
  name?: string;
  post?: boolean;
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
    post,
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
    ...rest
  } = allProps;

  let emoji = emojiImmutable;
  if (del) emoji = '␡';

  const theme = useTheme();
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
    (emoji ? emojiClass : '') +
    (post ? postClass : '');
  props.style = {...props.style};

  if (bold) {
    props.style.fontWeight = 600;
  }

  if (noHover) {
    props.style.cursor = 'default';
  }

  props.style.flex = `0 0 ${width || 32}px`;

  if (transparent) {
    props.style.background = 'transparent';
  } else if (lightGrey) {
    props.style.background = theme.g(0.1, 0.08);
    props.style.color = theme.g(0.2, 0.4);
    props.style.fill = theme.g(0.2, 0.4);
  } else if (grey || del) {
    props.style.background = theme.g(0.4);
    props.style.color = theme.g(0.9);
    props.style.fill = theme.g(0.9);
  } else if (color) {
    props.style.background = color;
  }

  const computedWidth: number = width || (size ? sizes[defaultSize + (size || 0)] : 0);
  const realWidth = computedWidth || defaultWidth;

  if (computedWidth) {
    props.style.width = computedWidth;
    props.style.height = computedWidth;
    props.style.lineHeight = emoji ? `${computedWidth * 1.07}px` : `${computedWidth}px`;
    props.style.fontSize = emoji ? `${computedWidth * 0.85}px` : `${computedWidth * fontSizeFactor}px`;
    if (computedWidth < 24) {
      props.style.fontWeight = 'bold';
      props.style.lineHeight = computedWidth + 1 + 'px';
    }
  }

  if (showText && name && !emoji && !post && !(grey || del) && !lightGrey && !transparent && !color) {
    props.style.background = styles.col.hash(id || name) + '';
  } else if (post) {
    props.style.background = theme.g(0.1, 0.08);
    props.style.border = 0;
    props.style.borderRadius = '15%';
  }

  if (rounded) {
    props.style.borderRadius = '25%';
  }

  if ((grey || del || lightGrey) && !name) {
    props.style.opacity = 0.3;
  }

  let element = icon ? (
    icon
  ) : post ? (
    <LogoStatic variant={'round'} size={realWidth * 0.8} />
  ) : showText ? (
    emoji ? (
      emoji
    ) : typeof name === 'string' && name.length > 0 ? (
      name.slice(0, letters || 2).trim()
    ) : (
      ''
    )
  ) : (
    renderImg(computedWidth, src, () => setError(true))
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

  if (isPrivate || badge || isOP || !!bottomRight) {
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
        background: props.style.background || styles.col.hash(id || name || '') + '' || theme.color.sem.negative[0],
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
            border: `1px solid ${theme.bg}`,
            width: badgeSize + 'px',
            height: badgeSize + 'px',
            borderRadius: '50%',
            fill: theme.bg,
            color: theme.bg,
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

  return element;
};
