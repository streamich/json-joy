import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ContextItem, ContextPane, ContextSep, ContextTitle} from '.';
import {Iconista} from '../../icons/Iconista';
import {Split} from '../../3-list-item/Split';
import {Code} from '../../1-inline/Code';
import {Sidetip} from '../../1-inline/Sidetip';
import {ContextItemNested} from './ContextItemNested';

const meta: Meta<typeof ContextPane> = {
  title: '4. Card/ContextMenu/ContextPane',
  component: ContextPane,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    children: (
      <>
        <ContextSep />
        <ContextItem>Item 1</ContextItem>
        <ContextItem>Item 2</ContextItem>
        <ContextSep line />
        <ContextItem big>Big item 1</ContextItem>
        <ContextItem big>Big item 2</ContextItem>
        <ContextSep />
      </>
    ),
  },
};

export const Accent: StoryObj<typeof meta> = {
  args: {
    accent: 'red',
    children: (
      <>
        <ContextSep />
        <ContextItem>Item 1</ContextItem>
        <ContextItem>Item 2</ContextItem>
        <ContextSep line />
        <ContextItem big>Big item 1</ContextItem>
        <ContextItem big>Big item 2</ContextItem>
        <ContextSep />
      </>
    ),
  },
};

export const MinWidth: StoryObj<typeof meta> = {
  args: {
    style: {
      minWidth: 300,
    },
    children: (
      <>
        <ContextSep />
        <ContextItem>Item 1</ContextItem>
        <ContextItem>Item 2</ContextItem>
        <ContextSep line />
        <ContextItem big>Big item 1</ContextItem>
        <ContextItem big>Big item 2</ContextItem>
        <ContextSep />
      </>
    ),
  },
};

const DownloadIcon: React.FC = () => {
  return <Iconista set={'auth0'} icon={'download'} width={16} height={16} />;
};

const DownloadPanelContent: React.FC = () => (
  <>
    <ContextSep />
    <ContextTitle>Structural</ContextTitle>

    <ContextItem inset icon={<DownloadIcon />} onClick={() => {}}>
      <Split>
        <span>
          Download{' '}
          <Code gray size={0} spacious>
            binary
          </Code>
        </span>
        <Sidetip small>{'.crdt'}</Sidetip>
      </Split>
    </ContextItem>

    <ContextItem inset icon={<DownloadIcon />} onClick={() => {}}>
      <Split>
        <span>
          Download{' '}
          <Code gray size={0} spacious>
            verbose
          </Code>
        </span>
        <Sidetip small>{'.cbor'}</Sidetip>
      </Split>
    </ContextItem>

    <ContextItem inset icon={<DownloadIcon />} onClick={() => {}}>
      <Split>
        <span>
          Download{' '}
          <Code gray size={0} spacious>
            verbose
          </Code>
        </span>
        <Sidetip small>{'.json'}</Sidetip>
      </Split>
    </ContextItem>

    <ContextItem inset icon={<DownloadIcon />} onClick={() => {}}>
      <Split>
        <span>
          Download{' '}
          <Code gray size={0} spacious>
            compact
          </Code>
        </span>
        <Sidetip small>{'.cbor'}</Sidetip>
      </Split>
    </ContextItem>

    <ContextItem inset icon={<DownloadIcon />} onClick={() => {}}>
      <Split>
        <span>
          Download{' '}
          <Code gray size={0} spacious>
            compact
          </Code>
        </span>
        <Sidetip small>{'.json'}</Sidetip>
      </Split>
    </ContextItem>

    <ContextSep />
    <ContextSep line />
    <ContextSep />
    <ContextTitle>Indexed</ContextTitle>

    <ContextItem inset icon={<DownloadIcon />} onClick={() => {}}>
      <Split>
        <span>
          Download{' '}
          <Code gray size={0} spacious>
            binary
          </Code>
        </span>
        <Sidetip small>{'.cbor'}</Sidetip>
      </Split>
    </ContextItem>

    <ContextSep />
    <ContextSep line />
    <ContextSep />
    <ContextTitle>Sidecar</ContextTitle>

    <ContextItem inset icon={<DownloadIcon />} onClick={() => {}}>
      <Split>
        <span>
          Download{' '}
          <Code gray size={0} spacious>
            binary
          </Code>
        </span>
        <Sidetip small>{'.crdt'}</Sidetip>
      </Split>
    </ContextItem>

    <ContextSep />
    <ContextSep line />
    <ContextSep />
    <ContextItem inset onClick={() => {}} icon={<Iconista set="auth0" icon="external-link" width={16} height={16} />}>
      About encoding formats
      {' …'}
    </ContextItem>

    <ContextSep />
  </>
);

export const DownloadMenu: StoryObj<typeof meta> = {
  args: {
    children: <DownloadPanelContent />,
    accent: 'blue',
  },
};

export const Submenu: StoryObj<typeof meta> = {
  args: {
    style: {
      width: 240,
    },
    children: (
      <>
        <ContextSep />
        <ContextTitle>Structural</ContextTitle>

        <ContextItem inset onClick={() => {}}>
          Item 1
        </ContextItem>
        <ContextItemNested
          inset
          open
          onClick={() => {}}
          renderPane={() => (
            <ContextPane style={{width: 200}}>
              <ContextSep />
              <ContextItem inset onClick={() => {}}>
                Subitem 1
              </ContextItem>
              <ContextItem inset onClick={() => {}}>
                Subitem 2
              </ContextItem>
              <ContextSep />
            </ContextPane>
          )}
        >
          Open submenu ...
        </ContextItemNested>
        <ContextItem inset onClick={() => {}}>
          Item 3
        </ContextItem>

        <ContextSep />
      </>
    ),
  },
};

export const SubmenuLeft: StoryObj<typeof meta> = {
  args: {
    style: {
      width: 240,
    },
    children: (
      <>
        <ContextSep />
        <ContextTitle>Structural</ContextTitle>

        <ContextItem inset onClick={() => {}}>
          Item 1
        </ContextItem>
        <ContextItemNested
          inset
          left
          open
          onClick={() => {}}
          renderPane={() => (
            <ContextPane style={{width: 200}}>
              <ContextSep />
              <ContextItem inset onClick={() => {}}>
                Subitem 1
              </ContextItem>
              <ContextItem inset onClick={() => {}}>
                Subitem 2
              </ContextItem>
              <ContextSep />
            </ContextPane>
          )}
        >
          Open submenu ...
        </ContextItemNested>
        <ContextItem inset onClick={() => {}}>
          Item 3
        </ContextItem>

        <ContextSep />
      </>
    ),
  },
};
