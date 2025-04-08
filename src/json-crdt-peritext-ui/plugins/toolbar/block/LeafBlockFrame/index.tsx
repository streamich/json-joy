// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import {useToolbarPlugin} from '../../context';
import {inlineText} from '../menuItems';
import {ExpandableToolbar} from './ExpandableToolbar';
import type {RenderBlockProps} from '../RenderBlock';
import {AutoExpandableToolbar} from './AutoExpandableToolbar';

const blockClass = rule({
  d: 'block',
  pos: 'relative',
});

const topLeftOverlay = rule({
  d: 'block',
  pos: 'absolute',
  t: '-8px',
  l: '-72px',
});

const topRightOverlay = rule({
  d: 'block',
  pos: 'absolute',
  t: '-36px',
  r: '-16px',
});

export interface LeafBlockFrameProps extends RenderBlockProps {
}

export const LeafBlockFrame: React.FC<LeafBlockFrameProps> = ({block, children}) => {
  const state = useToolbarPlugin();
  const menu = React.useMemo(() => state?.toolbar.leafBlockSmallMenu(), [state]);

  return (
    <div className={blockClass}>
      {children}
      <div className={topLeftOverlay}>
        <AutoExpandableToolbar menu={menu!} more={{small: true}} />
      </div>
      {/* <div className={topRightOverlay}>
        <InlineToolbarMenu menu={menu!} />
      </div> */}
    </div>
  );
};
