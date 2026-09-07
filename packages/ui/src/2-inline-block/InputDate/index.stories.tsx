import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {InputDate as Component, type InputDateProps} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/InputDate',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const Demo: React.FC<InputDateProps> = (props) => {
  const [value, setValue] = React.useState('2026-07-09');

  return (
    <div style={{width: 260}}>
      <Component label={'Due date'} {...props} value={value} onChange={setValue} />
      <br />
      <Component {...props} value={value} onChange={setValue} />
      <br />
      <Component disabled label={'Disabled'} {...props} value={value} onChange={setValue} />
      <br />
      <Component invalid label={'Invalid'} {...props} value={value} onChange={setValue} />
    </div>
  );
};

export const Primary: StoryObj<typeof meta> = {
  render: (args: any) => <Demo {...args} />,
};

const DemoTime: React.FC = () => {
  const [value, setValue] = React.useState('2026-07-09T14:30');
  return (
    <div style={{width: 280}}>
      <Component time label={'Starts'} value={value} onChange={setValue} />
    </div>
  );
};

export const WithTime: StoryObj<typeof meta> = {
  render: () => <DemoTime />,
};

const DemoEmpty: React.FC = () => {
  const [value, setValue] = React.useState('');
  return (
    <div style={{width: 260}}>
      <Component value={value} onChange={setValue} />
    </div>
  );
};

export const Empty: StoryObj<typeof meta> = {
  render: () => <DemoEmpty />,
};

const DemoBounds: React.FC = () => {
  const [value, setValue] = React.useState('2026-07-09');
  return (
    <div style={{width: 260}}>
      <Component label={'This month only'} min="2026-07-01" max="2026-07-31" value={value} onChange={setValue} />
    </div>
  );
};

export const Bounds: StoryObj<typeof meta> = {
  render: () => <DemoBounds />,
};

const DemoSizes: React.FC = () => {
  const [value, setValue] = React.useState('2026-07-09');
  return (
    <div style={{width: 260}}>
      <Component size={1} label={'Label'} value={value} onChange={setValue} />
      <br />
      <Component size={0} label={'Label'} value={value} onChange={setValue} />
      <br />
      <Component size={-1} label={'Label'} value={value} onChange={setValue} />
      <br />
      <Component size={-3} label={'Label'} value={value} onChange={setValue} />
    </div>
  );
};

export const SizeScale: StoryObj<typeof meta> = {
  render: () => <DemoSizes />,
};
