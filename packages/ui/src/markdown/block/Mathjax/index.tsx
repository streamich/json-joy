import * as React from 'react';
import type {IMarkdownBlockCodeProps} from '../shared';
import MathjaxDisplayEquation from './MathjaxDisplayEquation';
import MarkdownBlock from '../../util/MarkdownBlock';

const Mathjax: React.FC<IMarkdownBlockCodeProps> = ({idx, source}) => {
  return (
    <MarkdownBlock idx={idx}>
      <MathjaxDisplayEquation source={source} />
    </MarkdownBlock>
  );
};

export default Mathjax;
