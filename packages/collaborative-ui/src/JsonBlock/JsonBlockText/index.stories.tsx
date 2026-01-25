import * as React from 'react';
import {JsonBlockText} from '.';
import {model0} from '../../__tests__/fixtures';

export default {
  component: JsonBlockText,
  title: '<JsonBlock>/<JsonBlockText>',
};

export const Default = {
  render: () => <JsonBlockText value={model0.view()} />,
};
