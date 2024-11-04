// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {DefaultRendererColors} from './constants';
import {usePeritext} from '../../react';
import {useSyncStore} from '../../react/hooks';
import type {InlineRendererProps} from '../../react/types';

export const RenderInline: React.FC<InlineRendererProps> = (props) => {
  const {inline, children} = props;
  const {dom} = usePeritext();
  const focus = useSyncStore(dom.cursor.focus);
  const span = props.span();

  if (span) {
    const attr = inline.attr();
    const style = span.style;
    
    if (attr.b) {
      style.fontWeight = 'bold';
    }
    if (attr.i) {
      style.fontStyle = 'italic';
    }
    
    const selection = inline.selection();
    if (selection) {
      const [left, right] = selection;
      style.backgroundColor = focus ? DefaultRendererColors.ActiveSelection : DefaultRendererColors.InactiveSelection;
      style.borderRadius =
      left === 'anchor' ? '.25em 1px 1px .25em' : right === 'anchor' ? '1px .25em .25em 1px' : '1px';
    }
  }

  return children;
};
