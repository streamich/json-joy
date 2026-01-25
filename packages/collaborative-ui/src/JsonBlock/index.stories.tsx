import * as React from 'react';
import {JsonBlock} from '.';
import {model0} from '../__tests__/fixtures';

export default {
  component: JsonBlock,
  title: '<JsonBlock>',
};

export const Default = {
  render: () => <JsonBlock value={model0.view()} />,
};
