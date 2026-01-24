import * as React from 'react';
import type {RenderNode} from '../types';
import MarkdownBlock from '../util/MarkdownBlock';

const renderBreak: RenderNode = (renderers, flat, idx) => <MarkdownBlock idx={idx} as="br" />;

export default renderBreak;
