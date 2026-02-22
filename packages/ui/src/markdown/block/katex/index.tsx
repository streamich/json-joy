import * as React from 'react';
import type {IMarkdownBlockCodeProps} from '../shared';
import {rule} from 'nano-theme';
import MarkdownBlock from '../../util/MarkdownBlock';
import KatexDisplay from '../../components/katex/KatexDisplay';

const blockClass = rule({
  w: '100%',
  maxW: '100%',
  overflowY: 'hidden',
  overflowX: 'scroll',
});

const Katex: React.FC<IMarkdownBlockCodeProps> = (props) => (
  <MarkdownBlock idx={props.idx} className={blockClass}>
    <KatexDisplay source={props.source} />
  </MarkdownBlock>
);

export default Katex;
