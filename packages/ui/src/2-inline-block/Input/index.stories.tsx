import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Input as Component, type InputProps} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Input',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const Demo: React.FC<InputProps> = (props) => {
  const [value, setValue] = React.useState(props.value);

  return (
    <div>
      <Component label={'Label'} value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component disabled value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component
        disabled
        label={'Disabled with label'}
        value={value}
        onChange={(value) => setValue(value)}
        {...props}
      />
      <br />
      <Component waiting value={value} onChange={(value) => setValue(value)} {...props} />
    </div>
  );
};

export const Primary: StoryObj<typeof meta> = {
  args: {
    value: '...',
  },
};

export const Interactive: StoryObj<typeof meta> = {
  render: (args: any) => <Demo {...args} />,
};

export const WithBackground: StoryObj<typeof meta> = {
  render: (args: any) => (
    <div style={{background: 'rgba(0,0,0,.04)', padding: 32, borderRadius: 16}}>
      <Demo {...args} />
    </div>
  ),
};

const DemoSizes: React.FC<InputProps> = (props) => {
  const [value, setValue] = React.useState(props.value);

  return (
    <div>
      <Component
        size={2}
        label={'Label'}
        placeholder={'Enter something...'}
        value={value}
        onChange={(value) => setValue(value)}
        {...props}
      />
      <br />
      <Component size={1} label={'Label'} value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component size={0} label={'Label'} value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component size={-1} label={'Label'} value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component size={-2} label={'Label'} value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component size={-3} label={'Label'} value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component size={-4} label={'Label'} value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component size={-5} label={'Label'} value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
    </div>
  );
};

export const SizeScale: StoryObj<typeof meta> = {
  render: (args: any) => <DemoSizes {...args} />,
};
