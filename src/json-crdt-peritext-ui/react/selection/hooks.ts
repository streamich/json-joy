import * as React from 'react';
import {useBrowserLayoutEffect} from '../hooks';

export const useCaret = () => {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const timer = React.useRef<unknown>();
  useBrowserLayoutEffect(() => {
    const span = ref.current;
    if (!span) return;
    clearTimeout(timer.current as any);
    timer.current = setTimeout(() => {
      const selection = window.getSelection();
      if (!selection) return;
      const range = document.createRange();
      range.setStart(span, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }, 1);
    return () => {
      clearTimeout(timer.current as any);
    };
  });
  return ref;
};
