import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {InputNumber as Component, type InputNumberProps} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/InputNumber',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const Demo: React.FC<InputNumberProps> = (props) => {
  const [value, setValue] = React.useState<number | undefined>(props.value ?? 16);

  return (
    <div style={{width: 220}}>
      <Component {...props} value={value} onChange={setValue} />
      <div style={{marginTop: 12, fontSize: 12, opacity: 0.6}}>value: {String(value)}</div>
    </div>
  );
};

type Story = StoryObj<typeof Component>;

export const Basic: Story = {
  render: (args) => <Demo {...args} />,
};

export const FontSize: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    value: 16,
    min: 8,
    max: 96,
    step: 1,
    inputProps: {label: 'Font size'},
  },
};

export const Decimal: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    value: 1,
    min: 0,
    max: 5,
    step: 0.25,
  },
};

export const Disabled: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    value: 12,
    disabled: true,
  },
};
