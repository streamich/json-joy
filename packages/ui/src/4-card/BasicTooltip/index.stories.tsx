import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {type BasicTooltipProps, BasicTooltip as Component} from '.';
import {BasicButtonMore} from '../../2-inline-block/BasicButton/BasicButtonMore';

const meta: Meta<typeof Component> = {
  title: '4. Card/BasicTooltip',
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
    renderTooltip: () => <div style={{padding: 10}}>Hello world</div>,
    children: <div style={{border: '1px solid red'}}>Hover me!</div>,
  },
};

const ButtonWithTooltip: React.FC<BasicTooltipProps & {size?: number}> = ({size, ...rest}) => (
  <Component {...rest} renderTooltip={() => 'Hello world'}>
    <BasicButtonMore size={size} />
  </Component>
);

const VerticalDemo: React.FC<BasicTooltipProps> = (props) => (
  <div style={{width: '100vw', height: '100vh', position: 'relative'}}>
    <div style={{position: 'absolute', left: 32, top: 32}}>
      <ButtonWithTooltip {...props} />
    </div>
    <div style={{position: 'absolute', right: 32, top: 32}}>
      <ButtonWithTooltip {...props} />
    </div>
    <div style={{position: 'absolute', left: 'calc(50% + 64px)', top: 'calc(50% + 64px)'}}>
      <ButtonWithTooltip {...props} />
    </div>
    <div style={{position: 'absolute', left: 'calc(50% - 64px)', top: 'calc(50% + 64px)'}}>
      <ButtonWithTooltip {...props} />
    </div>
    <div style={{position: 'absolute', left: 'calc(50% - 64px)', top: 'calc(50% - 64px)'}}>
      <ButtonWithTooltip {...props} />
    </div>
    <div style={{position: 'absolute', left: 'calc(50% + 64px)', top: 'calc(50% - 64px)'}}>
      <ButtonWithTooltip {...props} />
    </div>
    <div style={{position: 'absolute', left: 32, bottom: 32}}>
      <ButtonWithTooltip {...props} />
    </div>
    <div style={{position: 'absolute', right: 32, bottom: 32}}>
      <ButtonWithTooltip {...props} />
    </div>
  </div>
);

export const Vertical: StoryObj<typeof meta> = {
  parameters: {
    layout: 'default',
  },
  render: () => <VerticalDemo anchor={{topIf: 80}} />,
};

export const VerticalFadeIn: StoryObj<typeof meta> = {
  parameters: {
    layout: 'default',
  },
  render: () => (
    <div style={{width: '100vw', height: '100vh', position: 'relative'}}>
      <div style={{position: 'absolute', left: 32, top: 32}}>
        <ButtonWithTooltip fadeIn />
      </div>
      <div style={{position: 'absolute', right: 32, top: 32}}>
        <ButtonWithTooltip fadeIn />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% + 64px)', top: 'calc(50% + 64px)'}}>
        <ButtonWithTooltip fadeIn />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% - 64px)', top: 'calc(50% + 64px)'}}>
        <ButtonWithTooltip fadeIn />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% - 64px)', top: 'calc(50% - 64px)'}}>
        <ButtonWithTooltip fadeIn />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% + 64px)', top: 'calc(50% - 64px)'}}>
        <ButtonWithTooltip fadeIn />
      </div>
      <div style={{position: 'absolute', left: 32, bottom: 32}}>
        <ButtonWithTooltip fadeIn />
      </div>
      <div style={{position: 'absolute', right: 32, bottom: 32}}>
        <ButtonWithTooltip fadeIn />
      </div>
    </div>
  ),
};

export const Horizontal: StoryObj<typeof meta> = {
  parameters: {
    layout: 'default',
  },
  render: () => (
    <div style={{width: '100vw', height: '100vh', position: 'relative'}}>
      <div style={{position: 'absolute', left: 32, top: 32}}>
        <ButtonWithTooltip anchor={{horizontal: true}} size={64} />
      </div>
      <div style={{position: 'absolute', right: 32, top: 32}}>
        <ButtonWithTooltip anchor={{horizontal: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% + 128px)', top: 'calc(50% + 128px)'}}>
        <ButtonWithTooltip anchor={{horizontal: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% - 128px)', top: 'calc(50% + 128px)'}}>
        <ButtonWithTooltip anchor={{horizontal: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% - 128px)', top: 'calc(50% - 128px)'}}>
        <ButtonWithTooltip anchor={{horizontal: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% + 128px)', top: 'calc(50% - 128px)'}}>
        <ButtonWithTooltip anchor={{horizontal: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 32, bottom: 32}}>
        <ButtonWithTooltip anchor={{horizontal: true}} size={64} />
      </div>
      <div style={{position: 'absolute', right: 32, bottom: 32}}>
        <ButtonWithTooltip anchor={{horizontal: true}} size={64} />
      </div>
    </div>
  ),
};

export const HorizontalCentered: StoryObj<typeof meta> = {
  parameters: {
    layout: 'default',
  },
  render: () => (
    <div style={{width: '100vw', height: '100vh', position: 'relative'}}>
      <div style={{position: 'absolute', left: 32, top: 32}}>
        <ButtonWithTooltip anchor={{horizontal: true, center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', right: 32, top: 32}}>
        <ButtonWithTooltip anchor={{horizontal: true, center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% + 128px)', top: 'calc(50% + 128px)'}}>
        <ButtonWithTooltip anchor={{horizontal: true, center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% - 128px)', top: 'calc(50% + 128px)'}}>
        <ButtonWithTooltip anchor={{horizontal: true, center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% - 128px)', top: 'calc(50% - 128px)'}}>
        <ButtonWithTooltip anchor={{horizontal: true, center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% + 128px)', top: 'calc(50% - 128px)'}}>
        <ButtonWithTooltip anchor={{horizontal: true, center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 32, bottom: 32}}>
        <ButtonWithTooltip anchor={{horizontal: true, center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', right: 32, bottom: 32}}>
        <ButtonWithTooltip anchor={{horizontal: true, center: true}} size={64} />
      </div>
    </div>
  ),
};

export const VerticalCentered: StoryObj<typeof meta> = {
  parameters: {
    layout: 'default',
  },
  render: () => (
    <div style={{width: '100vw', height: '100vh', position: 'relative'}}>
      <div style={{position: 'absolute', left: 32, top: 32}}>
        <ButtonWithTooltip nowrap anchor={{center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', right: 32, top: 32}}>
        <ButtonWithTooltip nowrap anchor={{center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% + 128px)', top: 'calc(50% + 128px)'}}>
        <ButtonWithTooltip nowrap anchor={{center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% - 128px)', top: 'calc(50% + 128px)'}}>
        <ButtonWithTooltip nowrap anchor={{center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% - 128px)', top: 'calc(50% - 128px)'}}>
        <ButtonWithTooltip nowrap anchor={{center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 'calc(50% + 128px)', top: 'calc(50% - 128px)'}}>
        <ButtonWithTooltip nowrap anchor={{center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', left: 32, bottom: 32}}>
        <ButtonWithTooltip nowrap anchor={{center: true}} size={64} />
      </div>
      <div style={{position: 'absolute', right: 32, bottom: 32}}>
        <ButtonWithTooltip nowrap anchor={{center: true}} size={64} />
      </div>
    </div>
  ),
};
