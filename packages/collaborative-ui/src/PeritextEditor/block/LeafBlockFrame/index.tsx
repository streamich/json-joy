import * as React from 'react';
import {rule} from 'nano-theme';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useToolbarPlugin} from '../../context';
import {AutoExpandableToolbar} from './AutoExpandableToolbar';
import {compare} from 'json-joy/lib/json-crdt-patch';
import {EntangledPortal, EntangledPortalStateOpts} from '../../components/EntangledPortal';
import type {RenderBlockProps} from '../RenderBlock';

const blockClass = rule({
  d: 'block',
  pos: 'relative',
  pd: '1em 0',
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
          <EntangledPortal position={position}>
            <AutoExpandableToolbar menu={menu!} more={{small: true}} />
          </EntangledPortal>
        </div>
      )}
      {/* <div className={topRightOverlay}>
        <InlineToolbarMenu menu={menu!} />
      </div> */}
    </div>
  );
};
