import * as React from 'react';
import {rule, theme, useRule} from 'nano-theme';
import {useT} from 'use-t';
import {Code} from '../../1-inline/Code';
import {Avatar} from '../../1-inline/Avatar';
import {Link} from '../../1-inline/Link';

const {createElement: h} = React;

const blockClass = rule({
  d: 'flex',
  flexWrap: 'nowrap',
  cur: 'pointer',
  bd: 0,
  pad: '5px',
  mar: '-5px',
  bdrad: '4px',
  trs: 'background .12s ease-in 0s',
  userSelect: 'none',
});

const bgHoverWide = rule({
  pad: '10px',
  mar: '-10px',
});

const rightClass = rule({
  w: '100%',
  ov: 'hidden',
  d: 'inline-block',
  flex: '1 1',
});

const nameClass = rule({
  ...theme.font.sans,
  lh: 1.2,
  color: theme.color.sem.positive[1],
  mar: 0,
  whiteSpace: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
  w: '100%',
  flexBasis: '100%',
  d: 'block',
  [`.${blockClass.trim()}:hover &`]: {
    color: theme.color.sem.positive[2],
  },
});

const subtextClass = rule({
  ...theme.font.ui1.mid,
  lh: 1.3,
  d: 'inline-block',
  mar: 0,
  whiteSpace: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
  color: theme.g(0.3),
  [`.${blockClass.trim()}:hover &`]: {
    color: theme.g(0.1),
  },
});

const specialFontClass = rule({
  ...theme.font.ui1.mid,
});

const renderRightDefault = (props: AvatarBlockProps) => {
  const [t] = useT();
  const {
    width = 40,
    name,
    hideName,
    subtext,
    post,
    grey,
    lightGrey,
    greyText,
    spacious,
    onNameClick,
    onSubtextClick,
  } = props;
  const subtextDynamicClass = useRule((theme) => ({
    col: theme.g(0.3),
    [`.${blockClass.trim()}:hover &`]: {
      col: theme.g(0.1),
    },
  }));
  const dynamicGreyNameClass = useRule((theme) => ({
    color: theme.g(0.1, 0.8),
    [`.${blockClass.trim()}:hover &`]: {
      color: theme.g(0.1, 1),
    },
  }));

  return (
    <span
      className={rightClass}
      style={{
        padding: `${width * (subtext ? (spacious ? 0 : 0.085) : width < 32 ? (spacious ? 0.12 : 0.2) : 0.19)}px ${
          width * 0.2
        }px 0 ${width * (0.2 + (spacious ? 0.1 : 0))}px`,
        fontSize: width * (subtext ? (spacious ? 0.5 : 0.42) : spacious ? (width < 32 ? 0.65 : 0.53) : 0.5) + 'px',
      }}
    >
      {!!name &&
        !hideName &&
        h(
          'span',
          {
            className:
              nameClass +
              (post || grey || lightGrey || greyText ? dynamicGreyNameClass : '') +
              (grey || lightGrey || greyText ? specialFontClass : ''),
            style: {
              marginTop: spacious && subtext ? width * -0.05 : undefined,
            },
            onClick: onNameClick,
          },
          props.you ? (
            <>
              {name} <Code gray>{t('you')}</Code>
            </>
          ) : (
            name
          ),
        )}
      {subtext && (
        <span
          className={subtextClass + subtextDynamicClass}
          style={{
            fontSize: width * (name && !hideName ? (spacious ? 0.35 : 0.28) : 0.53) + 'px',
            paddingTop: name && !hideName ? 0 : `${width * 0.08}px`,
            opacity: spacious ? 0.7 : undefined,
          }}
          onClick={onSubtextClick}
        >
          {subtext}
        </span>
      )}
    </span>
  );
};

export interface AvatarBlockProps {
  id?: string; // Used for hashing.
  active?: boolean;
  href?: string;
  width?: number;
  src?: string;
  name?: string;
  hideName?: boolean;
  emoji?: string;
  subtext?: React.ReactNode;
  square?: boolean;
  rounded?: boolean;
  post?: boolean;
  title?: string;
  className?: string;
  color?: string;
  isPrivate?: boolean;
  isOP?: boolean;
  hover?: boolean;
  wideHover?: boolean;
  icon?: React.ReactNode;
  grey?: boolean;
  lightGrey?: boolean;
  greyText?: boolean;
  transparent?: boolean;
  spacious?: boolean;
  you?: boolean;
  avatarBottomRight?: React.ReactElement;
  noHover?: boolean;
  del?: boolean;
  circle?: boolean;
  bold?: boolean;
  letters?: number;
  onClick?: React.MouseEventHandler;
  onAvatarClick?: React.MouseEventHandler;
  onNameClick?: React.MouseEventHandler;
  onSubtextClick?: React.MouseEventHandler;
  renderRight?: (props: AvatarBlockProps) => React.ReactElement<any>;
}

/**
 * Similar to <Avatar> but also allows to specify username
 * and other info.
 */
export const AvatarBlock: React.FC<AvatarBlockProps> = (props) => {
  const {
    id,
    active,
    href,
    src,
    width = 40,
    name,
    emoji,
    square,
    rounded,
    post,
    title,
    onClick,
    onAvatarClick,
    renderRight = renderRightDefault,
    color,
    className = '',
    isPrivate,
    isOP,
    hover,
    wideHover,
    icon,
    grey,
    lightGrey,
    transparent,
    noHover,
    avatarBottomRight,
    del,
    bold,
    letters,
  } = props;

  const dynamicBlockClass = useRule((theme) => ({
    '&:hover': {
      bg: theme.g(0.1, 0.04),
    },
    '&:active': {
      bg: theme.g(0.1, 0.08),
    },
  }));

  const Component = href ? Link : 'div';

  const avatar = (
    <Avatar
      id={id}
      src={src}
      width={width}
      name={name}
      emoji={emoji}
      square={square}
      rounded={rounded}
      post={post}
      color={color}
      isPrivate={isPrivate}
      isOP={isOP}
      hover={hover}
      icon={icon}
      grey={grey}
      lightGrey={lightGrey}
      transparent={transparent}
      bottomRight={avatarBottomRight}
      del={del}
      bold={bold}
      letters={letters}
      onClick={onAvatarClick}
      noHover={noHover}
    />
  );

  return (
    <Component
      a={href ? true : undefined}
      to={href}
      className={className + blockClass + (noHover ? '' : dynamicBlockClass) + (wideHover ? bgHoverWide : '')}
      style={{
        background: active ? theme.green(0.06) : undefined,
        height: width || 32,
        cursor: noHover ? 'default' : undefined,
      }}
      onClick={onClick}
      title={title}
    >
      {avatar}
      {renderRight(props)}
    </Component>
  );
};
