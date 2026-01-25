import * as React from 'react';
import {JsonBlockClickable} from '.';
import {model0} from '../../__tests__/fixtures';

export default {
  component: JsonBlockClickable,
  title: '<JsonBlock>/<JsonBlockClickable>',
};

export const Default = {
  render: () => <JsonBlockClickable value={model0.view()} />,
};
