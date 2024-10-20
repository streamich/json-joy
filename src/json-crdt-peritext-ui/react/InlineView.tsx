import * as React from 'react';
import {Inline} from '../../json-crdt-extensions/peritext/block/Inline';
import {useIsoLayoutEffect} from './hooks';
import {ElementAttr} from '../constants';
import {TextView} from './TextView';
import {usePeritext} from './context';
import {CaretView} from './selection/CaretView';
import {FocusView} from './selection/FocusView';
import {AnchorView} from './selection/AnchorView';

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
    const keyBase = inline.key();
    const cursorStart = inline.cursorStart();
    if (cursorStart) {
      const key = keyBase + 'a';
      elements.push(cursorStart.isStartFocused() ? (cursorStart.isCollapsed() ? <CaretView key={key} italic={!!attr['i']} /> : <FocusView key={key} />) : <AnchorView key={key} />);
    }
    elements.push(element);
    const cursorEnd = inline.cursorEnd();
    if (cursorEnd) {
      const key = keyBase + 'b';
      elements.push(cursorEnd.isEndFocused() ? (cursorEnd.isCollapsed() ? <CaretView key={key} italic={!!attr['i']} /> : <FocusView key={key} left />) : <AnchorView key={key} />);
    }
    element = React.createElement(React.Fragment, null, elements);
  }

  return element;
};
