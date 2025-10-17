import * as React from 'react';
import {rule} from 'nano-theme';
import {EntangledPortal, type EntangledPortalStateOpts} from '../../../../components/EntangledPortal';

const spanClass = rule({
  pe: 'none',
});

const gap = 4;
const position: EntangledPortalStateOpts['position'] = (base, dest) => {
  let x = base.x - (dest.width >> 1);
  let y = base.y;
  if (x < gap) x = gap;
  else if (x + dest.width + gap > window.innerWidth) x = window.innerWidth - dest.width - gap;
  const {scrollY} = window;
  const body = document.body;
  const html = document.documentElement;
  const pageHeight = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight,
  );
  if (base.y + dest.height + scrollY > pageHeight) y = base.y - (base.y + dest.height + scrollY - pageHeight);
  return [x, y];
};

const span = {className: spanClass};

const entangledProps = {
  position,
  span,
};

export interface BottomPanePortalProps {
  children: React.ReactNode;
}

export const BottomPanePortal: React.FC<BottomPanePortalProps> = ({children}) => {
  return <EntangledPortal {...entangledProps}>{children}</EntangledPortal>;
};
