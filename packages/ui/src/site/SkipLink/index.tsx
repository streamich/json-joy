import * as React from 'react';
import {rule, theme} from 'nano-theme';

const skipLinkCls = rule({
  pos: 'absolute',
  top: '-9999px',
  left: '8px',
  z: 10000,
  pad: '12px 16px',
  bdrad: '6px',
  bg: theme.g(0.08),
  col: '#fff',
  ...theme.font.ui3.bold,
  fz: '14px',
  td: 'none',
  '&:focus, &:focus-visible': {
    top: '8px',
    outline: `2px solid ${theme.g(0.08)}`,
    outlineOffset: '2px',
  },
});

/**
 * Visually-hidden link that becomes visible on focus, jumping keyboard users
 * straight to `#main`. Must be the first focusable element in the document.
 */
export const SkipLink: React.FC<{targetId?: string}> = ({targetId = 'main'}) => (
  <a href={`#${targetId}`} className={skipLinkCls}>
    Skip to main content
  </a>
);

export default SkipLink;
