import * as React from 'react';
import type {ICode} from 'very-small-parser/lib/markdown/block/types';
import DocsMd from '../../DocsMd';
import AsideContainer from './AsideContainer';

export interface Props {
  node: ICode;
}

const Aside: React.FC<Props> = ({node}) => {
  return (
    <AsideContainer>
      <DocsMd md={node.value} />
    </AsideContainer>
  );
};

export default Aside;
