import * as React from 'react';
import {TextBlock} from '.';

export default {
  component: TextBlock,
  title: '5. Block/TextBlock',
};

const src = `import * as React from 'react';
import {TextBlock} from '.';

export default {
  component: TextBlock,
  title: '<TextBlock>',
};

export const Default = {
  render: () => <TextBlock src={model0.toString()} />,
};
`;

export const Default = {
  render: () => <TextBlock src={src} />,
};
