import * as React from 'react';
import type {CustomComponents} from '@jsonjoy.com/ui/lib/markdown';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Avatar} from '@jsonjoy.com/ui/lib/1-inline/Avatar';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';

export const custom: CustomComponents = {
  Avatar: (props) => <Avatar {...props} />,
  AvatarsPreview: (props) => (
    <Flex>
      <Avatar {...props} name={'John Doe'} />
      <Space horizontal />
      <Avatar
        {...props}
        width={64}
        src={'https://bafybeicwjfikrmhtjjfuthpk5zbs7sofwvgvoyr3oo7ligkrzm7fxfu53a.ipfs.nftstorage.link/5007.png'}
      />
      <Space horizontal />
      <Avatar {...props} width={40} name={'Tyler Durden!'} isPrivate />
      <Space horizontal />
      <Avatar {...props} width={56} name={'System'} isOP />
      <Space horizontal />
      <Avatar {...props} width={36} name={'Notes++'} square rounded />
    </Flex>
  ),
};
