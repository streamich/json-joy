// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {usePeritext} from '../../react';
import {useSyncStore} from '../../react/hooks';
import {DefaultRendererColors} from './constants';
import type {InlineViewProps} from '../../react/InlineView';

interface RenderInlineSelectionProps extends RenderInlineProps {
  selection: [left: 'anchor' | 'focus' | '', right: 'anchor' | 'focus' | ''];
}

const RenderInlineSelection: React.FC<RenderInlineSelectionProps> = (props) => {
  const {children, selection} = props;
  const {dom} = usePeritext();
  const focus = useSyncStore(dom.cursor.focus);

  const [left, right] = selection;
  const style: React.CSSProperties = {
    backgroundColor: focus ? DefaultRendererColors.ActiveSelection : DefaultRendererColors.InactiveSelection,
    borderRadius: left === 'anchor' ? '.25em 1px 1px .25em' : right === 'anchor' ? '1px .25em .25em 1px' : '1px',
  };

  return <span style={style}>{children}</span>;
};

export interface RenderInlineProps extends InlineViewProps {
  children: React.ReactNode;
}

export const RenderInline: React.FC<RenderInlineProps> = (props) => {
  const {inline, children} = props;

  const selection = inline.selection();

  if (selection) {
    return <RenderInlineSelection {...props} selection={selection} />;
  }

  return children;
};
