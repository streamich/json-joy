import * as React from 'react';
import {defaultSize} from './constants';
import {BadgeLayout, type Props as BadgeLayoutProps} from './BadgeLayout';
import {BadgeRight, type Props as BadgeRightProps} from './BadgeRight';
import {Avatar, type AvatarProps} from '../../1-inline/Avatar';

export interface Props extends BadgeLayoutProps, BadgeRightProps {
  avatar: AvatarProps;
}

export const Badge: React.FC<Props> = (props) => {
  const {avatar, width = defaultSize} = props;
  return (
    <BadgeLayout {...props} icon={<Avatar width={width} {...avatar} />}>
      <BadgeRight {...props} width={width} />
    </BadgeLayout>
  );
};
