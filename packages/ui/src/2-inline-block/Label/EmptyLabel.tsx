import * as React from 'react';
import {defaultSize} from './constants';
import {LabelLayout} from './LabelLayout';
import {LabelRight} from './LabelRight';
import {Avatar} from '../../1-inline/Avatar';

export interface Props {
  size?: number;
  square?: boolean;
  name?: string;
}

export const EmptyLabel: React.FC<Props> = ({size = defaultSize, square, name = '\u2205'}) => {
  return (
    <LabelLayout icon={<Avatar width={size} grey square={square} />}>
      <LabelRight spacious width={size} name={name} />
    </LabelLayout>
  );
};
