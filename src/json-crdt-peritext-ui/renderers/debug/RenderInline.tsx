import type * as React from 'react';
import {useDebugCtx} from './context';
import type {InlineViewProps} from '../../react/InlineView';

export interface RenderInlineProps extends InlineViewProps {
  children?: React.ReactNode;
  attributes: React.HTMLAttributes<HTMLSpanElement>;
}

export const RenderInline: React.FC<RenderInlineProps> = ({attributes, children}) => {
  const {enabled} = useDebugCtx();

  if (!enabled) return children;

  const style = attributes.style || (attributes.style = {});
  style.outline = '1px dotted red';

  return children;
};
