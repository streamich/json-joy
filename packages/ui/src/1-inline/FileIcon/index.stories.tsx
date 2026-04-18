import {FileIcon} from '.';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof FileIcon> = {
  title: '1. Inline/FileIcon',
  component: FileIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text'},
    color: {control: 'color'},
    gradient: {control: 'boolean'},
    accent: {control: 'boolean'},
    size: {control: {type: 'range', min: 16, max: 128, step: 4}},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: 'ts',
    size: 48,
    gradient: true,
  },
};

export const WithAccent: Story = {
  args: {
    label: 'tsx',
    size: 48,
    gradient: true,
    accent: true,
  },
};

export const CustomColor: Story = {
  args: {
    label: 'jsx',
    color: 'hsl(170 70% 42%)',
    size: 48,
    gradient: true,
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'cfg',
    size: 48,
    gradient: true,
  },
};

export const LargeIcon: Story = {
  args: {
    label: 'rs',
    size: 80,
    gradient: true,
    accent: true,
  },
};

export const SmallIcon: Story = {
  args: {
    label: 'js',
    size: 24,
    gradient: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 16}}>
        {[16, 24, 32, 40, 48, 64, 80, 96].map((s) => (
          <FileIcon key={s} label="ts" size={s} gradient />
        ))}
      </div>
      <br />
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 16}}>
        {[16, 24, 32, 40, 48, 64, 80, 96].map((s) => (
          <FileIcon key={s} label="coffee" size={s} gradient />
        ))}
      </div>
    </>
  ),
};

const randomNames = ['README', 'Makefile', 'Dockerfile', 'LICENSE', 'CHANGELOG', 'schema', 'vitest.config', 'biome'];

export const HashedColors: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
      {randomNames.map((name) => (
        <div key={name} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
          <FileIcon id={name} label={name.slice(0, 4)} size={48} gradient />
          <span style={{fontSize: 9, color: '#999', fontFamily: 'monospace'}}>{name}</span>
        </div>
      ))}
    </div>
  ),
};
