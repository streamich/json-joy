import * as React from 'react';
import {rule} from 'nano-theme';
import type {IMarkdownBlockCodeProps} from '../shared';
import MarkdownBlock from '../../util/MarkdownBlock';
import CharChemDisplay from '../../components/charchem/CharChemDisplay';

const blockClass = rule({
  ta: 'center',
});

const Charchem: React.FC<IMarkdownBlockCodeProps> = ({idx, source}) => {
  const element = (
    <MarkdownBlock idx={idx} className={blockClass}>
      <CharChemDisplay source={source} />
    </MarkdownBlock>
  );

  return element;
};

export default Charchem;
