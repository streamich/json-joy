import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {CopyInput as Component, type CopyInputProps} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/CopyInput',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const Demo: React.FC<CopyInputProps> = (props) => {
  const value = 'https://example.com';

  return (
    <div style={{width: 400}}>
      <Component value={value} />
      <br />
      <Component label={'My label'} value={value} />
      <br />
    </div>
  );
};

export const Primary: StoryObj<typeof meta> = {
  render: () => <Demo />,
};
