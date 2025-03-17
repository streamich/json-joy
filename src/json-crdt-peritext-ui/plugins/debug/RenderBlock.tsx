// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {drule} from 'nano-theme';
import {useDebugCtx} from './context';
import type {BlockViewProps} from '../../react/BlockView';
import {CommonSliceType} from '../../../json-crdt-extensions';

const blockClass = drule({
  pos: 'relative',
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
    <div
      className={blockClass({
        'caret-color': enabled ? 'blue !important' : 'transparent',
        '::selection': {
          bgc: enabled ? 'red !important' : 'transparent',
        },
      })}
    >
      <div contentEditable={false} style={{position: 'absolute', top: '-24px', left: 0}}>
        <span
          style={{
            fontSize: '9px',
            padding: '2px 4px',
            borderRadius: 3,
            background: 'rgba(0,0,0)',
            lineHeight: '1.2em',
            color: 'white',
            display: 'inline-block',
          }}
        >
          {hash.toString(36)} {block.path.map(type => typeof type === 'number' ? `<${CommonSliceType[type] ?? type}>` : `<${type}>`).join('.')}
        </span>
      </div>
      <div style={{outline: '1px dotted blue'}}>{children}</div>
    </div>
  );
};
