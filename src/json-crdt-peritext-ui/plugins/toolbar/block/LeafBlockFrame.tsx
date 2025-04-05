// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {InlineToolbarMenu} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/InlineToolbarMenu';
import {rule} from 'nano-theme';
import {useToolbarPlugin} from '../context';
import type {RenderBlockProps} from './RenderBlock';

const blockClass = rule({
  d: 'block',
  pos: 'relative',
});

const topRightOverlay = rule({
  d: 'block',
  pos: 'absolute',
  t: '-8px',
  r: '-8px',
});

export interface LeafBlockFrameProps extends RenderBlockProps {
}

export const LeafBlockFrame: React.FC<LeafBlockFrameProps> = ({block, children}) => {
  const state = useToolbarPlugin();
  const menu = React.useMemo(() => state?.toolbar.blockMenu(), [state]);

  return (
    <div className={blockClass}>
      {children}
      <div className={topRightOverlay}>
        <InlineToolbarMenu menu={menu!} />
      </div>
    </div>
  );
};
