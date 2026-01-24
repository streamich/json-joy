import * as React from 'react';
import {CopyCode} from '.';

export default {
  title: '1. Inline/CopyCode',
  component: CopyCode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Default = {
  render: () => (
    <div>
      <CopyCode value={'xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxx'} />
      <br />
      <br />
      <CopyCode value={'xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxx'} alt border />
      <br />
      <br />
      <CopyCode value={'xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxx'} alt border gray={false} size={2} noBg />
    </div>
  ),
};
