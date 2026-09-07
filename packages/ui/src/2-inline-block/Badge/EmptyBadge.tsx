import * as React from 'react';
import {defaultSize} from './constants';
import {BadgeLayout} from './BadgeLayout';
import {BadgeRight} from './BadgeRight';
import {Avatar} from '../../1-inline/Avatar';

export interface Props {
  size?: number;
  square?: boolean;
  name?: string;
}

export const EmptyBadge: React.FC<Props> = ({size = defaultSize, square, name = '\u2205'}) => {
  return (
    <BadgeLayout icon={<Avatar width={size} grey square={square} />}>
      <BadgeRight spacious width={size} name={name} />
    </BadgeLayout>
  );
};
