import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {ContextMenuMobile} from '.';
import {ContextMenu} from '../ContextMenu';
import {Popup} from '../../Popup';
import {BasicButtonMore} from '../../../2-inline-block/BasicButton/BasicButtonMore';
import * as menuItems from '../__stories__/menuItems';

const meta: Meta<typeof ContextMenuMobile> = {
  title: '4. Card/ContextMenu/ContextMenuMobile',
  component: ContextMenuMobile,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  tags: ['autodocs'],
};

export default meta;

export const Direct: StoryObj<typeof meta> = {
  args: {
    menu: menuItems.inlineText,
  },
};

export const BlockElementDirect: StoryObj<typeof meta> = {
  args: {
    menu: menuItems.blockElement,
  },
};

const PopupDemo: React.FC<{menu: any}> = ({menu}) => (
  <div style={{padding: 24, height: '100vh', boxSizing: 'border-box'}}>
    <p style={{margin: '0 0 16px', fontFamily: 'system-ui, sans-serif', fontSize: 14}}>
      Tap the button to open the menu. On a mobile viewport this opens as a bottom sheet; on a wide viewport the same
      ContextMenu opens as the desktop popup.
    </p>
    <Popup
      tooltip={{
        nowrap: true,
        renderTooltip: () => 'Open menu',
      }}
      renderContext={() => <ContextMenu inset showSearch menu={menu} />}
    >
      <BasicButtonMore />
    </Popup>
  </div>
);

export const InsidePopup: StoryObj<typeof meta> = {
  render: () => <PopupDemo menu={menuItems.inlineText} />,
};

export const InsidePopupBlock: StoryObj<typeof meta> = {
  render: () => <PopupDemo menu={menuItems.blockElement} />,
};

const NestedMenu = {
  name: 'Format',
  children: [
    {
      name: 'Text style',
      children: [
        {name: 'Bold', onSelect: () => console.log('Bold')},
        {name: 'Italic', onSelect: () => console.log('Italic')},
        {name: 'Underline', onSelect: () => console.log('Underline')},
        {name: 'Strikethrough', onSelect: () => console.log('Strike')},
        {
          name: 'More',
          children: [
            {name: 'Superscript', onSelect: () => console.log('Sup')},
            {name: 'Subscript', onSelect: () => console.log('Sub')},
            {name: 'Small caps', onSelect: () => console.log('Caps')},
            {
              name: 'Decorations',
              children: [
                {name: 'Box around text', onSelect: () => console.log('Box')},
                {name: 'Highlight', onSelect: () => console.log('Highlight')},
                {
                  name: 'Color',
                  children: [
                    {name: 'Red', onSelect: () => console.log('Red')},
                    {name: 'Green', onSelect: () => console.log('Green')},
                    {name: 'Blue', onSelect: () => console.log('Blue')},
                    {
                      name: 'Custom palette',
                      children: [
                        {name: 'Saved color 1', onSelect: () => console.log('S1')},
                        {name: 'Saved color 2', onSelect: () => console.log('S2')},
                        {name: 'Saved color 3', onSelect: () => console.log('S3')},
                        {name: 'Add new color…', onSelect: () => console.log('Add')},
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Paragraph',
      children: [
        {name: 'Heading 1', onSelect: () => console.log('H1')},
        {name: 'Heading 2', onSelect: () => console.log('H2')},
        {name: 'Heading 3', onSelect: () => console.log('H3')},
        {name: 'Body', onSelect: () => console.log('Body')},
        {
          name: 'List',
          children: [
            {name: 'Bullet list', onSelect: () => console.log('Bullet')},
            {name: 'Numbered list', onSelect: () => console.log('Num')},
            {name: 'Checklist', onSelect: () => console.log('Check')},
            {
              name: 'Custom marker',
              children: [
                {name: 'Roman numerals', onSelect: () => console.log('Roman')},
                {name: 'Letters', onSelect: () => console.log('Letters')},
                {name: 'Symbols', onSelect: () => console.log('Symbols')},
              ],
            },
          ],
        },
      ],
    },
    {sep: true, name: '_sep1'},
    {name: 'Copy', keys: ['⌘', 'C'], onSelect: () => console.log('Copy')},
    {name: 'Paste', keys: ['⌘', 'V'], onSelect: () => console.log('Paste')},
    {sep: true, name: '_sep2'},
    {name: 'Delete', danger: true, onSelect: () => console.log('Delete')},
  ],
};

const TallMenu = {
  name: 'Tall menu',
  children: Array.from({length: 30}).map((_, i) => ({
    name: `Item ${i + 1}`,
    description: i % 3 === 0 ? `Description for item ${i + 1}` : undefined,
    onSelect: () => console.log(`Item ${i + 1}`),
  })),
};

const ShortMenu = {
  name: 'Short menu',
  children: [
    {name: 'Cut', keys: ['⌘', 'X'], onSelect: () => console.log('Cut')},
    {name: 'Copy', keys: ['⌘', 'C'], onSelect: () => console.log('Copy')},
    {name: 'Paste', keys: ['⌘', 'V'], onSelect: () => console.log('Paste')},
  ],
};

export const NestedNavigation: StoryObj<typeof meta> = {
  args: {
    menu: NestedMenu as any,
  },
};

export const ShortContent: StoryObj<typeof meta> = {
  args: {
    menu: ShortMenu as any,
  },
};

export const TallContent: StoryObj<typeof meta> = {
  args: {
    menu: TallMenu as any,
  },
};
