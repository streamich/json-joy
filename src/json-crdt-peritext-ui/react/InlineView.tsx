import * as React from 'react';
import {Inline} from '../../json-crdt-extensions/peritext/block/Inline';
import {useIsoLayoutEffect} from './hooks';
import {ElementAttr} from '../constants';
import {TextView} from './TextView';
import {usePeritext} from './context';
import {CaretView} from './selection/CaretView';
import {FocusView} from './selection/FocusView';
import {AnchorView} from './selection/AnchorView';

const {createElement: h, Fragment} = React;

export interface InlineViewProps {
  inline: Inline;
}

/** @todo Add ability to compute `.hash` for {@link Inline} nodes and use for memoization. */
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

  const attributes: React.HTMLAttributes<HTMLSpanElement> = {
    className: 'jsonjoy-text',
  };

  let element: React.ReactNode = <TextView ref={ref} attr={attributes} text={inline.text()} />;
  for (const map of renderers) element = map.inline?.(props, element, attributes) ?? element;

  if (inline.hasCursor()) {
    const elements: React.ReactNode[] = [];
    const attr = inline.attr();
    const key = inline.key();
    const cursorStart = inline.cursorStart();
    if (cursorStart) {
      const k = key + 'a';
      elements.push(cursorStart.isStartFocused() ? (cursorStart.isCollapsed() ? <CaretView key={k} italic={!!attr['i']} /> : <FocusView key={k} />) : <AnchorView key={k} />);
    }
    elements.push(h(Fragment, {key}, element));
    const cursorEnd = inline.cursorEnd();
    if (cursorEnd) {
      const k = key + 'b';
      elements.push(cursorEnd.isEndFocused() ? (cursorEnd.isCollapsed() ? <CaretView key={k} italic={!!attr['i']} /> : <FocusView key={k} left />) : <AnchorView key={k} />);
    }
    element = h(Fragment, null, elements);
  }

  return element;
};
