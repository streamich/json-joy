// import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Codeblock as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '5. Block/Codeblock',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    lang: 'ts',
    src: `import * as React from 'react';

export interface CodeblockProps {
  src: string;
  lang?: string;
  compact?: boolean;
}
`,
  },
};
