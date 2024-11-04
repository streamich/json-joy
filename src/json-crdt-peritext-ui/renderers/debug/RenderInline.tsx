// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {useDebugCtx} from './context';
import type {InlineRendererProps} from '../../react/types';

export const RenderInline: React.FC<InlineRendererProps> = (props) => {
  const {children} = props;
  const {enabled} = useDebugCtx();
  
  if (!enabled) return children;
  
  const span = props.span();
  if (span) {
    const style = span.style;
    style.outline = '1px dotted red';
  }

  return children;
};
