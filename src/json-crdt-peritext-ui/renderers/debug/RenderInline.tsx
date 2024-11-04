// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {useDebugCtx} from './context';
import type {InlineViewProps} from '../../react/InlineView';
export interface RenderInlineProps extends InlineViewProps {
  children: React.ReactNode;
}

export const RenderInline: React.FC<RenderInlineProps> = (props) => {
  const {children} = props;
  const {enabled} = useDebugCtx();
  
  if (!enabled) return children;

  return (
    <span style={{outline: '1px dotted red'}}>
      {children}
    </span>
  );
};
