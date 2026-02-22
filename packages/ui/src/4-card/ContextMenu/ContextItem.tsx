import * as React from 'react';
import {rule, drule, SYMBOL} from 'nano-theme';
import {Link} from '../../1-inline/Link';
import {FixedColumn} from '../../3-list-item/FixedColumn';
import {Ripple} from '../../misc/Ripple';
import {usePopup} from '../Popup/context';
import {Split} from '../../3-list-item/Split';
import Arrow from '../../icons/interactive/Arrow';
import {useStyles} from '../../styles/context';
import {fonts} from '../../styles';

const padding = 20;

const {createElement: h} = React;

const blockClass = rule({
  d: 'block',
  bd: 0,
  w: '100%',
  bxz: 'border-box',
  bg: 'none',
  ta: 'left',
  us: 'none',
  out: 'none',
});

const itemClass = drule({
  ...fonts.get('ui', 'mid', 1),
  bxz: 'border-box',
  fz: '14px',
});

const iconClass = rule({
  pad: 0,
  w: '16px',
  h: '16px',
  mar: '0 0 0 -2px',
});

const smallTextClass = drule({
  p: {
    fz: '.82em',
    pad: 0,
    mar: 0,
  },
  a: {
    '&:hover': {
      col: '#0089ff',
      bdb: '1px solid rgba(0,137,255,.4)',
    },
  },
});

const nestedClass = rule({
  d: 'flex',
  w: '20px',
  h: '20px',
  mr: '-2px -14px -2px -2px',
  pdl: '4px',
});

export interface ContextItemProps extends React.HTMLAttributes<any> {
  big?: boolean;
  grey?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  smallText?: boolean;
  /** Whether to show ellipsis "...". */
  more?: boolean;
  /** Whether to show right chevron, if item opens a sub-panel. */
  nested?: boolean;
  compact?: boolean;
  outline?: boolean;
  bg?: boolean;
  open?: boolean;
  to?: string;
  selected?: boolean;
  disabled?: boolean;
  inset?: boolean;
  /** Whether to close popup on click. */
  closePopup?: boolean;
}

export const ContextItem: React.FC<ContextItemProps> = ({
  big,
  grey,
  danger,
  className,
  icon,
  right,
  children,
  smallText,
  more,
  outline,
  bg,
  nested,
  compact,
  open,
  to,
  selected,
  disabled,
  inset,
  closePopup,
  ...rest
}) => {
  const styles = useStyles();
  const popup = usePopup();

  const bg_ = selected
    ? styles.col.accent(0, 'bg-2')
    : grey
      ? styles.light
        ? styles.g(0.985)
        : styles.g(0.92)
      : bg
        ? styles.g(0, 0.02)
        : 'transparent';

  const mainClassName =
    (className || '') +
    blockClass +
    itemClass({
      bg: bg_,
      bdt: outline ? `1px solid ${styles.g(0, 0.05)}` : 0,
      pd: `${compact ? 4 : 8}px ${padding}px`,
      col: styles.g(0.2),
      '&:hover': {
        // col: danger ? theme.color.sem.negative[1] : theme.g(0),
        col: danger ? styles.col.get('error', 'solid-1') : styles.g(0),
        bg: disabled
          ? 'transparent'
          : danger
            ? styles.col.get('error', 'el-1', 0, {A: 25})
            : rest.onClick || to
              ? styles.light
                ? styles.g(0, 0.05)
                : styles.g(0, 0.08)
              : 'transparent',
      },
      '&:active': {
        col: danger ? styles.col.get('error', 'solid-1') : styles.g(0),
        bg: disabled
          ? 'transparent'
          : danger
            ? styles.col.get('error', 'el-2', 0, {A: 25})
            : rest.onClick || to
              ? styles.light
                ? styles.g(0, 0.05)
                : styles.g(0, 0.08)
              : 'transparent',
      },
      '&:focus': {
        bg: disabled ? 'transparent' : styles.g(0, 0.02),
      },
    }) +
    (smallText
      ? smallTextClass({
          p: {
            col: styles.g(0.5),
          },
          a: {
            col: styles.g(0.5),
            borderBottomColor: styles.g(0.9),
          },
        })
      : '');

  if (closePopup && popup && !disabled) {
    const onClick0 = rest.onClick;
    rest.onClick = (e) => (popup.close(), onClick0?.(e));
  }

  let element: React.ReactNode = children;

  if (more) {
    element = (
      <span>
        {element}
        <span style={{opacity: 0.4}}> {SYMBOL.ELLIPSIS}</span>
      </span>
    );
  }

  if (right) {
    element = (
      <Split as="span">
        {element}
        {right}
      </Split>
    );
  }

  if (nested) {
    element = (
      <Split as="span">
        {element}
        <span className={nestedClass} style={{opacity: open ? 1 : 0.7}}>
          <Arrow direction={open ? 'r' : 'd'} />
        </span>
      </Split>
    );
  }

  if (icon) {
    element = (
      <FixedColumn as={'span'} left={26}>
        <span className={iconClass}>{icon}</span>
        <span>{element}</span>
      </FixedColumn>
    );
  }

  const buttonStyle: React.CSSProperties = {};

  if (disabled) {
    buttonStyle.pointerEvents = 'none';
    buttonStyle.opacity = 0.5;
  }
  if (inset) {
    buttonStyle.paddingLeft = padding - 4;
    buttonStyle.paddingRight = padding - 4;
    buttonStyle.borderRadius = 4;
  }

  element = h(Ripple, {
    ms: 800,
    color: danger ? styles.col.get('error', 'el-3', 0, {A: 40}) : undefined,
    children: h(
      to ? Link : 'button',
      {
        ...rest,
        a: to ? true : undefined,
        to: disabled ? undefined : to,
        disabled,
        className: mainClassName,
        style: buttonStyle,
      },
      element,
    ),
  });

  if (inset) {
    element = <span style={{padding: '0 4px', display: 'block'}}>{element}</span>;
  }

  return <>{element}</>;
};
