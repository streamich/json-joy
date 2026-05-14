import * as React from 'react';
import {rule} from 'nano-theme';
import {KeyLite, type KeyLiteProps} from '../../1-inline/KeyLite';

const slotClass = rule({
  pos: 'relative',
  d: 'inline-block',
});

const badgeClass = rule({
  pos: 'absolute',
  t: '-6px',
  r: '4px',
});

export interface WithShortcutProps {
  shortcut: React.ReactNode;

  /** Whether to use the smaller {@link KeyLite} variant. Default: `true`. */
  small?: boolean;

  /** When `true`, the badge is not rendered. */
  hidden?: boolean;

  /** Additional style applied to the badge chip. */
  badgeStyle?: React.CSSProperties;

  /** Pass-through props for the underlying {@link KeyLite} chip. */
  badgeProps?: Omit<KeyLiteProps, 'children' | 'small' | 'style'>;

  /** Additional class on the outer wrapper. */
  className?: string;

  /** The element to attach the shortcut hint to (typically a button). */
  children: React.ReactNode;
}

export const WithShortcut: React.FC<WithShortcutProps> = ({
  shortcut,
  small = true,
  hidden,
  badgeStyle,
  badgeProps,
  className,
  children,
}) => {
  return (
    <span className={slotClass + (className ? ' ' + className : '')}>
      {children}
      {!hidden && (
        <KeyLite {...badgeProps} small={small} className={badgeClass} style={badgeStyle}>
          {shortcut}
        </KeyLite>
      )}
    </span>
  );
};
