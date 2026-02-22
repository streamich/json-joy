import * as React from 'react';
import {BasicButton as Component} from '.';
import IconSvgClose from '../../icons/svg/Close';
import {Split} from '../../3-list-item/Split';
import {FixedColumn} from '../../3-list-item/FixedColumn';
import IconSettings from '../../icons/svg/Settings';
import Arrow from '../../icons/interactive/Arrow';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/BasicButton',
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
    children: <IconSvgClose />,
    fill: true,
  },
};

export const Stretched: StoryObj<typeof meta> = {
  args: {
    children: 'Hello',
    fill: true,
    width: 'auto',
    compact: true,
  },
};

export const Disabled: StoryObj<typeof meta> = {
  args: {
    children: 'Hello',
    fill: true,
    width: 'auto',
    compact: true,
    disabled: true,
  },
};

export const BigButton: StoryObj<typeof meta> = {
  render: () => {
    return (
      <div style={{width: 250}}>
        <Component width={'100%'} height={40} onClick={() => {}}>
          <Split style={{alignItems: 'center'}}>
            <div>
              <FixedColumn left={32} style={{alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <div style={{width: 16, height: 16}}>{<IconSettings />}</div>
                </div>
                <div style={{display: 'flex', alignItems: 'center'}}>{'Hello world'}</div>
              </FixedColumn>
            </div>
            <div style={{width: 16, height: 16}}>
              <Arrow direction="r" />
            </div>
          </Split>
        </Component>
      </div>
    );
  },
};
