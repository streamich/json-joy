import * as React from 'react';
import type {RenderNode} from '../types';
import InlineCode from '../inline/InlineCode';

const renderInlineCode: RenderNode = (renderers, flat, idx) => {
  return <InlineCode idx={idx} />;
};

export default renderInlineCode;
