// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {useDebugCtx} from './context';
import {DebugLabel} from '../../components/DebugLabel';
import {SliceTypeName} from '../../../json-crdt-extensions';
import {SliceTypeCon} from '../../../json-crdt-extensions/peritext/slice/constants';
import type {InlineViewProps} from '../../react/InlineView';

export interface RenderInlineProps extends InlineViewProps {
  children: React.ReactNode;
}

export const RenderInline: React.FC<RenderInlineProps> = (props) => {
  const {children, inline} = props;
  const {enabled} = useDebugCtx();

  const keys: (number | string)[] = Object.keys(inline.attr());
  const tags: string[] = [];
  const length = keys.length;
  let hasCursor = false;
  for (let i = 0; i < length; i++) {
    let tag: string | number = keys[i];
    if (typeof tag === 'string' && Number(tag) + '' === tag) tag = Number(tag);
    if (tag === SliceTypeCon.Cursor) hasCursor = true;
    tag = SliceTypeName[tag as any] ?? (tag + '');
    tag = '<' + tag + '>';
    tags.push(tag);
  }

  if (!enabled) return children;

  return (
    <span style={{outline: '1px dotted red', position: 'relative'}}>
      {tags.length > 0 && (
        <span contentEditable={false} style={{position: 'absolute', top: -8, left: -3, userSelect: 'none', pointerEvents: 'none'}}>
          <DebugLabel>
            {tags.join(', ')}
          </DebugLabel>
        </span>
      )}
      {children}
    </span>
  );
};
