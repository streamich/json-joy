import * as React from 'react';
import {Inline} from '../../json-crdt-extensions/peritext/block/Inline';
import {useIsoLayoutEffect} from './hooks';
import {ElementAttr} from '../constants';
import {TextView} from './TextView';

export interface Props {
  inline: Inline;
}

export const InlineView: React.FC<Props> = ({inline}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  useIsoLayoutEffect(() => {
    const span = ref.current;
    if (!span) return;
    (span as any)[ElementAttr.InlineOffset] = inline.pos();
    const hash = inline.start.hash;
    if ((span as any).hash__ !== hash) {
      (span as any).hash__ = hash;
      span.textContent = inline.text();
    }
  });

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
    if (inline.attr()['b']) {
      span.style.fontWeight = 'bold';
    }
    if (inline.attr()['i']) {
      span.style.fontStyle = 'italic';
    }
  }, [isSelection]);

  return <TextView ref={ref} text={inline.text()} />;
};
