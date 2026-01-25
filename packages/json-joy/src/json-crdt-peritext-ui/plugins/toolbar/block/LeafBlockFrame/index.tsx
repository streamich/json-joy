import * as React from 'react';
import {rule} from 'nano-theme';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useToolbarPlugin} from '../../context';
import {AutoExpandableToolbar} from './AutoExpandableToolbar';
import {compare} from '../../../../../json-crdt-patch';
import type {RenderBlockProps} from '../RenderBlock';

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

// const topRightOverlay = rule({
//   d: 'block',
//   pos: 'absolute',
//   t: '-36px',
//   r: '-16px',
// });

export interface LeafBlockFrameProps extends RenderBlockProps {}

export const LeafBlockFrame: React.FC<LeafBlockFrameProps> = ({block, children}) => {
  const {toolbar} = useToolbarPlugin();
  const activeLeafBlockId = useBehaviorSubject(toolbar.activeLeafBlockId$);
  const menu = React.useMemo(() => toolbar.leafBlockSmallMenu({block}), [toolbar, block]);

  const isBlockActive = !!activeLeafBlockId && compare(activeLeafBlockId, block.marker?.id ?? block.txt.str.id) === 0;

  return (
    <div className={blockClass}>
      {children}
      {isBlockActive && (
        <div className={topLeftOverlay}>
          <AutoExpandableToolbar menu={menu!} more={{small: true}} />
        </div>
      )}
      {/* <div className={topRightOverlay}>
        <InlineToolbarMenu menu={menu!} />
      </div> */}
    </div>
  );
};
