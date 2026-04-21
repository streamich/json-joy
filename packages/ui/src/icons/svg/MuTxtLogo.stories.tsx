import Component from './MuTxtLogo';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: 'Icons/SVG/MuTxtLogo',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    size: 256,
  },
  decorators: [
    (Story: any) => (
      <div style={{width: '100px', height: '100px', display: 'grid', placeItems: 'center'}}>
        <Story />
      </div>
    ),
  ],
};

export const SizeScale: StoryObj<typeof meta> = {
  render: (args) => {
    const sizes = [16, 32, 64, 128, 256, 512];
    return (
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center'}}>
        {sizes.map((size) => (
          <div key={size} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 8, border: '1px solid #eee', borderRadius: 4}}>
            <Component size={size} />
            <span style={{fontSize: 12, color: '#666'}}>{size}px</span>
          </div>
        ))}
      </div>
    );
  },
};

export const Inverse: StoryObj<typeof meta> = {
  args: {
    size: 128,
  },
  render: (args) => {
    const sizes = [16, 32, 64, 128, 256, 512];
    return (
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#333', padding: 16}}>
        {sizes.map((size) => (
          <div key={size} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 8, border: '1px solid #eee', borderRadius: 4}}>
            <Component size={size} color="#fff" />
            <span style={{fontSize: 12, color: '#666'}}>{size}px</span>
          </div>
        ))}
      </div>
    );
  },
};
