import * as React from 'react';
import {CopyButton} from '.';

export default {
  title: '2. Inline Block/CopyButton',
  component: CopyButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Default = {
  render: () => <CopyButton onCopy={() => 'test...'} />,
};
