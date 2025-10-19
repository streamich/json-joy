import * as React from 'react';
import {rule} from 'nano-theme';
import {useDebugCtx} from './context';
import {formatStep} from '../../../json-crdt-extensions/peritext/slice/util';
import {DebugLabel} from '../../components/DebugLabel';
import {useSyncStore} from '../../web/react/hooks';
import type {BlockViewProps} from '../../web/react/BlockView';

const labelContainerClass = rule({
  pos: 'absolute',
  top: '-8px',
  left: '-4px',
  us: 'none',
  pe: 'none',
});

export interface RenderBlockProps extends BlockViewProps {
  children?: React.ReactNode;
}

export const RenderBlock: React.FC<RenderBlockProps> = ({block, hash, children}) => {
  const ctx = useDebugCtx();
  const enabled = useSyncStore(ctx.state.enabled);
  const showSliceOutlines = useSyncStore(ctx.state.showSliceOutlines);
  const showSliceInfo = useSyncStore(ctx.state.showSliceInfo);

  if (!enabled) return children;

  const isRoot = block.tag() === '';
  if (isRoot) return children;

  return (
    <div style={{position: 'relative'}}>
      {showSliceInfo && (
        <div contentEditable={false} className={labelContainerClass} onMouseDown={(e) => e.preventDefault()}>
          <DebugLabel right={hash.toString(36)}>{block.path.map((type) => formatStep(type)).join('.')}</DebugLabel>
        </div>
      )}
      {showSliceOutlines ? <div style={{outline: '1px dotted blue'}}>{children}</div> : children}
    </div>
  );
};
