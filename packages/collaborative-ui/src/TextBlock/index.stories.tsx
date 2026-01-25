import * as React from 'react';
import {TextBlock} from '.';
import {model0} from '../__tests__/fixtures';

export default {
  component: TextBlock,
  title: '<TextBlock>',
};

export const Default = {
  render: () => <TextBlock src={model0.toString()} />,
};
