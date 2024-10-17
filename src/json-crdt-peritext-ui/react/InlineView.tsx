import * as React from 'react';
import {Inline} from '../../json-crdt-extensions/peritext/block/Inline';
import {useIsoLayoutEffect} from './hooks';
import {ElementAttr} from '../constants';
import {TextView} from './TextView';
import {usePeritext} from './context';

export interface InlineViewProps {
  inline: Inline;
}

export const InlineView: React.FC<InlineViewProps> = (props) => {
  const {inline} = props;
  const {renderers} = usePeritext();
  const ref = React.useRef<HTMLSpanElement>(null);
  const text = inline.text();

  useIsoLayoutEffect(() => {
    const span = ref.current;
    if (!span) return;
    (span as any)[ElementAttr.InlineOffset] = inline;
  }, [text]);

  const selection = inline.selection();
  useIsoLayoutEffect(() => {
    const span = ref.current;
    if (!span) return;
    const style = span.style;
    if (selection) {
      const [left, right] = selection;
      style.backgroundColor = '#d7e9fd';
      style.borderRadius = left === 'anchor' ? '.25em 1px 1px .25em' : right === 'anchor' ? '1px .25em .25em 1px' : '1px';
    } else {
      style.backgroundColor = 'transparent';
      style.borderRadius = '0px';
    }
  }, [selection]);

  const attributes: React.HTMLAttributes<HTMLSpanElement> = {
    className: 'jsonjoy-text',
  };

  let element: React.ReactNode = <TextView ref={ref} attr={attributes} text={inline.text()} />;
  for (const map of renderers) element = map.inline?.(props, element, attributes) ?? element;
  return element;
};
