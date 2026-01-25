import * as React from 'react';
import {CopyButton} from '.';

export default {
  component: CopyButton,
  title: '<CopyButton>',
};

export const Default = {
  render: () => <CopyButton onCopy={() => 'test...'} />,
};
