// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import {useDebugCtx} from './context';
import {formatType} from '../../../json-crdt-extensions/peritext/slice/util';
import {DebugLabel} from '../../components/DebugLabel';
import type {BlockViewProps} from '../../react/BlockView';

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
  const {enabled} = useDebugCtx();

  if (!enabled) return children;

  const isRoot = block.tag() === '';
  if (isRoot) return children;

  return (
    <div style={{position: 'relative'}}>
      <div contentEditable={false} className={labelContainerClass} onMouseDown={e => e.preventDefault()}>
        <DebugLabel right={hash.toString(36)}>
          {block.path
            .map((type) => formatType(type))
            .join('.')}
        </DebugLabel>
      </div>
      <div style={{outline: '1px dotted blue'}}>{children}</div>
    </div>
  );
};
