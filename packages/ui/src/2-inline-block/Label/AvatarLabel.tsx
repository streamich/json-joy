import * as React from 'react';
import {LabelLayout, type Props as LabelLayoutProps} from './LabelLayout';
import {LabelRight, type Props as LabelRightProps} from './LabelRight';
import {Avatar, type AvatarProps} from '../../1-inline/Avatar';

export interface Props extends LabelLayoutProps, LabelRightProps {
  avatar: AvatarProps;
}

export const AvatarLabel: React.FC<Props> = (props) => {
  return (
    <LabelLayout {...props} icon={<Avatar {...props.avatar} />}>
      <LabelRight {...props} />
    </LabelLayout>
  );
};
