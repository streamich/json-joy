import * as React from 'react';
import {TopNav} from 'nice-ui/lib/5-block/TopNav';
import {Split} from 'nice-ui/lib/3-list-item/Split';
import {Left} from './Left';
import {Right} from './Right';

export type Props = Record<string, never>;

export const Header: React.FC<Props> = () => {
  return (
    <TopNav>
      <Split style={{alignItems: 'center'}}>
        <Left />
        <Right />
      </Split>
    </TopNav>
  );
};
