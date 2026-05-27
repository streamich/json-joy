import * as React from 'react';
import {Avatar} from '../../1-inline/Avatar';
import {AvatarStack} from '../../1-inline/AvatarStack';
import {LEO, MARK} from './users';

export interface CollabAvatarsProps {
  /** Avatar diameter in pixels. Defaults to 26. */
  size?: number;
}

/** The two illustration users (Leo Tolstoy, Mark Twain) as an overlapping avatar stack. */
export const CollabAvatars: React.FC<CollabAvatarsProps> = ({size = 26}) => {
  const ring: React.CSSProperties = {boxShadow: '0 0 0 3px var(--colBgTint)'};
  return (
    <AvatarStack gap={-Math.round(size * 0.2)} noHoverEffect>
      <Avatar name={LEO.name} title={LEO.name} color={LEO.color} width={size} noHover style={ring} />
      <Avatar name={MARK.name} title={MARK.name} color={MARK.color} width={size} noHover style={ring} />
    </AvatarStack>
  );
};
