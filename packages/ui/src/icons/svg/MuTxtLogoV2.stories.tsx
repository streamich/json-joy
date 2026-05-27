import * as React from 'react';
import Component from './MuTxtLogoV2';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: 'Icons/SVG/MuTxtLogoV2',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {control: {type: 'range', min: 16, max: 512, step: 4}},
    color: {control: 'color'},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {size: 260},
};

export const SizeScale: Story = {
  render: () => {
    const sizes = [16, 32, 64, 128, 256];
    return (
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center'}}>
        {sizes.map((size) => (
          <div
            key={size}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: 8,
              border: '1px solid #eee',
              borderRadius: 4,
            }}
          >
            <Component size={size} />
            <span style={{fontSize: 12, color: '#666'}}>{size}px</span>
          </div>
        ))}
      </div>
    );
  },
};

export const Monochrome: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 32, alignItems: 'center'}}>
      <Component size={220} color="#1a1a1b" />
      <div style={{background: '#1a1a1b', padding: 24, borderRadius: 8}}>
        <Component size={220} color="#ffffff" />
      </div>
    </div>
  ),
};
