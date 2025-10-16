// biome-ignore lint: lint/style/useImportType
import * as React from 'react';
import {rule} from 'nano-theme';
import {EntangledPortal, type EntangledPortalStateOpts} from '../../../../components/EntangledPortal';

const spanClass = rule({
  pe: 'none',
});

const gap = 4;
const position: EntangledPortalStateOpts['position'] = (base, dest) => {
  let x = base.x - (dest.width >> 1);
  const y = base.y - dest.height;
  if (x < gap) x = gap;
  else if (x + dest.width + gap > window.innerWidth) x = window.innerWidth - dest.width - gap;
  return [x, y];
};

const span = {className: spanClass};

const entangledProps = {
  position,
  span,
};

export interface TopPanePortalProps {
  children: React.ReactNode;
}

export const TopPanePortal: React.FC<TopPanePortalProps> = ({children}) => {
  return <EntangledPortal {...entangledProps}>{children}</EntangledPortal>;
};
