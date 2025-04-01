// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {useDebugCtx} from './context';
import {DebugLabel} from '../../components/DebugLabel';
import {SliceTypeName} from '../../../json-crdt-extensions';
import {SliceTypeCon} from '../../../json-crdt-extensions/peritext/slice/constants';
import {useSyncStore} from '../../web/react/hooks';
import type {InlineViewProps} from '../../web/react/InlineView';

export interface RenderInlineProps extends InlineViewProps {
  children: React.ReactNode;
}

export const RenderInline: React.FC<RenderInlineProps> = (props) => {
  const {children, inline} = props;
  const ctx = useDebugCtx();
  const enabled = useSyncStore(ctx.state.enabled);
  const showSliceOutlines = useSyncStore(ctx.state.showSliceOutlines);
  const showSliceInfo = useSyncStore(ctx.state.showSliceInfo);

  const keys: (number | string)[] = Object.keys(inline.attr());
  const tags: string[] = [];
  const length = keys.length;
  let hasCursor = false;
  for (let i = 0; i < length; i++) {
    let tag: string | number = keys[i];
    if (typeof tag === 'string' && Number(tag) + '' === tag) tag = Number(tag);
    if (tag === SliceTypeCon.Cursor) {
      hasCursor = true;
      continue;
    }
    tag = SliceTypeName[tag as any] ?? tag + '';
    tag = '<' + tag + '>';
    tags.push(tag);
  }

  if (!enabled) return children;

  return (
    <span style={{outline: showSliceOutlines ? '1px dotted red' : undefined, position: 'relative'}}>
      {showSliceInfo && tags.length > 0 && (
        <span
          contentEditable={false}
          style={{position: 'absolute', top: -6, left: -3, userSelect: 'none', pointerEvents: 'none'}}
        >
          <DebugLabel small>{tags.join(', ')}</DebugLabel>
        </span>
      )}
      {children}
    </span>
  );
};
