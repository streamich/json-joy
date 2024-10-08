import * as React from 'react';
import type {Block} from '../../../json-crdt-extensions/peritext/block/Block';

export interface Props {
  hash: number;
  block: Block;
}

export const BlockView: React.FC<Props> = React.memo(
  ({block}) => {
    // const {peritext} = usePeritext();

    return <div>this is block ...</div>;
  },
  (prev, next) => prev.hash === next.hash,
);
