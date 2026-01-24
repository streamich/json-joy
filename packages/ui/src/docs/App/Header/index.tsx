import * as React from 'react';
import {TopNav} from '../../../5-block/TopNav';
import {Split} from '../../../3-list-item/Split';
import {Left} from './Left';
import {Right} from './Right';

export type Props = {};

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
