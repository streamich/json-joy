import * as React from 'react';
import {type Item, NextBlock} from '../../5-block/NextBlock';
import {pageutils} from './util';
import {Markdown} from '../../markdown/Markdown';
import type {ContentPage} from './types';

export interface Props {
  top?: ContentPage;
  page: ContentPage;
  onlyNext?: boolean;
}

const PrevNext: React.FC<Props> = ({top, page, onlyNext}) => {
  let prev = !onlyNext ? pageutils.prev(page) : undefined;
  let next = pageutils.next(page, !!onlyNext);

  if (prev === top) prev = undefined;
  if (next) {
    const parent = next.parent;
    if (parent && parent.children) {
      const topIsSibling = parent.children.find((child) => child === top);
      if (topIsSibling) next = undefined;
    }
  }

  return (
    <NextBlock
      left={
        prev
          ? ({
              title: prev.title ? <Markdown src={prev.title} inline /> : pageutils.title(prev),
              to: prev.to,
            } as Item)
          : undefined
      }
      right={
        next
          ? ({
              title: next.title ? <Markdown src={next.title} inline /> : pageutils.title(next),
              to: next.to,
            } as Item)
          : undefined
      }
    />
  );
};

export default PrevNext;
