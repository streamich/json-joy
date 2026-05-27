import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {BentoCardDisplay} from './BentoCardDisplay';
import {DisplayTitle} from '../DisplayTitle';
import {useStyles} from '../../styles/context';

const meta: Meta<typeof BentoCardDisplay> = {
  title: '4. Card/BentoCard/BentoCardDisplay',
  component: BentoCardDisplay,
  parameters: {layout: 'centered'},
};

export default meta;

const Body: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <div style={{padding: '0 24px 24px', fontSize: 15, lineHeight: '1.6em', color: 'rgba(0,0,0,0.6)'}}>{children}</div>
);

export const Primary: StoryObj<typeof BentoCardDisplay> = {
  render: () => (
    <BentoCardDisplay
      color="#07f"
      style={{width: 360, height: 460, background: '#fff'}}
      left={<DisplayTitle card eyebrow={'JSON CRDT'} title={'JSON'} color="#07f" />}
      onExpand={() => console.log('expand')}
      cta={{
        label: 'Explore JSON CRDT',
        to: 'https://jsoncrdt.com',
      }}
    >
      <Body>
        <div>Model app state as nested objects, arrays, and maps. The whole document is one mergeable JSON CRDT.</div>
      </Body>
    </BentoCardDisplay>
  ),
};

const TrioDemo: React.FC = () => {
  const styles = useStyles();
  const WIDTH = 404;
  const HEIGHT = 600;

  return (
    <div style={{display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap'}}>
      <BentoCardDisplay
        animation={'rays'}
        color={styles.brand5.fg}
        style={{width: WIDTH, height: HEIGHT, background: '#fff'}}
        left={<DisplayTitle card eyebrow={'collaborative text'} title={'Text'} color={styles.brand5.fg} />}
        onExpand={() => console.log('expand')}
        cta={{
          label: 'Explore plain text',
          to: 'https://jsoncrdt.com',
        }}
      >
        <Body>
          <div>
            Bind a json-joy str node to a DOM input, a textarea, or any code editor. The text stays mergeable across
            users, tabs, and devices, with no custom sync code.
          </div>
        </Body>
      </BentoCardDisplay>
      <BentoCardDisplay
        animation={'dots'}
        color={styles.brand2.fg}
        style={{width: WIDTH, height: HEIGHT, background: '#fff'}}
        left={<DisplayTitle card eyebrow={'JSON CRDT'} title={'JSON'} color={styles.brand2.fg} />}
        onExpand={() => console.log('expand')}
        cta={{
          label: 'Explore JSON CRDT',
          to: 'https://jsoncrdt.com',
        }}
      >
        <Body>
          <div>Model app state as nested objects, arrays, and maps. The whole document is one mergeable JSON CRDT.</div>
        </Body>
      </BentoCardDisplay>
      <BentoCardDisplay
        animation={'blob'}
        color={styles.brand3.fg}
        style={{width: WIDTH, height: HEIGHT, background: '#fff'}}
        left={<DisplayTitle card eyebrow={'collaborative rich-text'} title={'Rich-text'} color={styles.brand3.fg} />}
        onExpand={() => console.log('expand')}
        cta={{
          label: 'Explore rich-text',
          to: 'https://jsoncrdt.com',
        }}
      >
        <Body>
          <div>Block-level structure that stays correct through concurrent splits, merges, and formatting.</div>
        </Body>
      </BentoCardDisplay>
    </div>
  );
};

export const Trio: StoryObj<typeof BentoCardDisplay> = {
  parameters: {layout: 'padded'},
  render: () => <TrioDemo />,
};
