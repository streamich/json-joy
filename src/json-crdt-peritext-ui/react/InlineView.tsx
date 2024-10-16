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
    (span as any)[ElementAttr.InlineOffset] = inline.pos();
  }, [text]);

  const isSelection = inline.isSelected();
  useIsoLayoutEffect(() => {
    const span = ref.current;
    if (!span) return;
    if (isSelection) {
      span.style.backgroundColor = '#d7e9fd';
      span.style.borderRadius = inline.cursorStart()?.isStartFocused() ? '1px .25em .25em 1px' : '.25em 1px 1px .25em';
    } else {
      span.style.backgroundColor = 'transparent';
    }
  }, [isSelection]);

  const attributes: React.HTMLAttributes<HTMLSpanElement> = {
    className: "jsonjoy-text",
  };

  let element: React.ReactNode = <TextView ref={ref} attr={attributes} text={inline.text()} />;
  for (const map of renderers) element = map.inline?.(props, element, attributes) ?? element;
  return element;
};
