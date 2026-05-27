import * as React from 'react';
import {keyframes, rule} from 'nano-theme';
import {PlaceholderParagraph} from './PlaceholderParagraph';
import {PlaceholderTitle} from './PlaceholderTitle';
import {PlaceholderBlockquote} from './PlaceholderBlockquote';
import {PlaceholderUnderline} from './PlaceholderUnderline';
import {PlaceholderSelection} from './PlaceholderSelection';
import {PlaceholderWord} from './PlaceholderWord';
import {PlaceholderWords} from './PlaceholderWords';
import {PlaceholderRow} from './PlaceholderRow';
import {PlaceholderCaret} from './PlaceholderCaret';
import {PlaceholderCursor} from './PlaceholderCursor';
import {Floater} from '../../misc/Floater';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta = {
  title: '3. List Item/Placeholder/Showcase',
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const lightWrap: React.CSSProperties = {
  width: '640px',
  padding: '36px',
  background: '#fff',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '18px',
  lineHeight: '30px',
  color: '#111',
};

const darkWrap: React.CSSProperties = {
  ...lightWrap,
  background: '#0E0E10',
  border: '1px solid #222',
  color: '#fff',
};

const monoWrap: React.CSSProperties = {
  width: '520px',
  padding: '24px 28px',
  background: '#0E0E10',
  borderRadius: '12px',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '15px',
  lineHeight: '24px',
  color: '#A8B0C2',
};

const punct = (s: string): React.ReactElement => <span style={{opacity: 0.5}}>{s}</span>;

export const RichTextDocument: StoryObj<typeof meta> = {
  render: () => (
    <div style={lightWrap}>
      <div style={{marginBottom: 14}}>
        <PlaceholderTitle level={1}>
          <PlaceholderWords count={3} minWidth={60} maxWidth={150} height={28} trailing />
          <PlaceholderCaret name="Monaco" color="#5FCC8A" height="32px" />
        </PlaceholderTitle>
      </div>

      <div style={{marginBottom: 16}}>
        <PlaceholderParagraph>
          <PlaceholderWords count={8} seed={3} trailing />
          <PlaceholderSelection color="#985DF7">
            <PlaceholderWords count={4} seed={5} trailing />
            <PlaceholderCaret name="Leonidas" color="#985DF7" placement="tl" height="22px" />
          </PlaceholderSelection>{' '}
          <PlaceholderWords count={12} seed={11} />
        </PlaceholderParagraph>
      </div>

      <div style={{marginBottom: 16}}>
        <PlaceholderBlockquote color="#9CA3AF">
          <PlaceholderParagraph>
            <PlaceholderWords count={5} seed={17} trailing />
            <PlaceholderUnderline color="#58B9F8">
              <PlaceholderWords count={2} seed={19} />
            </PlaceholderUnderline>{' '}
            <PlaceholderWords count={6} seed={23} />
          </PlaceholderParagraph>
        </PlaceholderBlockquote>
      </div>

      <div>
        <PlaceholderTitle level={2} words={3} seed={29} />
      </div>

      <div style={{marginTop: 12}}>
        <PlaceholderParagraph>
          <PlaceholderWords count={6} seed={31} trailing />
          <PlaceholderWord variant="bold" width={70} /> <PlaceholderWords count={8} seed={37} trailing />
          <PlaceholderCaret color="#58B9F8" height="22px" />
        </PlaceholderParagraph>
      </div>
    </div>
  ),
};

export const JsonDocument: StoryObj<typeof meta> = {
  render: () => (
    <div style={monoWrap}>
      <PlaceholderRow>{punct('{')}</PlaceholderRow>

      <PlaceholderRow indent={1}>
        <PlaceholderWord variant="key" width={60} />
        {punct(': ')}
        <PlaceholderWord variant="string" width={120} />
        {punct(',')}
      </PlaceholderRow>

      <PlaceholderRow indent={1}>
        <PlaceholderWord variant="key" width={48} />
        {punct(': ')}
        <PlaceholderSelection color="#5FCC8A">
          <PlaceholderWord variant="number" width={36} />
        </PlaceholderSelection>
        {punct(',')}
        <PlaceholderCaret name="Monaco" color="#5FCC8A" height="20px" />
      </PlaceholderRow>

      <PlaceholderRow indent={1}>
        <PlaceholderWord variant="key" width={72} />
        {punct(': ')}
        <PlaceholderWord variant="boolean" width={32} />
        {punct(',')}
      </PlaceholderRow>

      <PlaceholderRow indent={1}>
        <PlaceholderWord variant="key" width={56} />
        {punct(': [')}
      </PlaceholderRow>

      <PlaceholderRow indent={2}>{punct('{')}</PlaceholderRow>

      <PlaceholderRow indent={3}>
        <PlaceholderWord variant="key" width={40} />
        {punct(': ')}
        <PlaceholderWord variant="string" width={90} />
        {punct(',')}
      </PlaceholderRow>

      <PlaceholderRow indent={3}>
        <PlaceholderWord variant="key" width={50} />
        {punct(': ')}
        <PlaceholderSelection color="#985DF7">
          <PlaceholderWord variant="string" width={70} />
        </PlaceholderSelection>
        <PlaceholderCaret name="Leonidas" color="#985DF7" placement="tl" height="20px" />
      </PlaceholderRow>

      <PlaceholderRow indent={2}>{punct('},')}</PlaceholderRow>

      <PlaceholderRow indent={1}>{punct(']')}</PlaceholderRow>
      <PlaceholderRow>{punct('}')}</PlaceholderRow>
    </div>
  ),
};

const flyInKf = keyframes({
  '0%': {opacity: 0, transform: 'translateY(8px)'},
  '100%': {opacity: 1, transform: 'translateY(0)'},
});

const flyInClass = rule({
  d: 'inline-block',
  an: `${flyInKf} 0.6s ease-out both`,
});

const FlyIn: React.FC<{delay?: number; children: React.ReactNode}> = ({delay = 0, children}) => (
  <span className={flyInClass} style={{animationDelay: `${delay}ms`}}>
    {children}
  </span>
);

export const AnimatedFlyIn: StoryObj<typeof meta> = {
  render: () => (
    <div style={lightWrap}>
      <FlyIn delay={0}>
        <PlaceholderTitle level={1} seed={1} />
      </FlyIn>
      <div style={{marginTop: 16}}>
        <FlyIn delay={150}>
          <PlaceholderParagraph>
            <PlaceholderWords count={20} seed={3} />
          </PlaceholderParagraph>
        </FlyIn>
      </div>
      <div style={{marginTop: 12}}>
        <FlyIn delay={350}>
          <PlaceholderParagraph>
            <PlaceholderWords count={6} seed={7} trailing />
            <PlaceholderSelection color="#5FCC8A">
              <PlaceholderWords count={3} seed={11} trailing />
              <PlaceholderCaret name="Monaco" color="#5FCC8A" height="22px" />
            </PlaceholderSelection>{' '}
            <PlaceholderWords count={10} seed={13} />
          </PlaceholderParagraph>
        </FlyIn>
      </div>
    </div>
  ),
};

export const AnimatedFloating: StoryObj<typeof meta> = {
  render: () => (
    <div style={{...darkWrap, position: 'relative', height: 280}}>
      <PlaceholderTitle level={2} seed={1} color="#444" />
      <div style={{marginTop: 12}}>
        <PlaceholderParagraph>
          <PlaceholderWords count={6} seed={3} color="#2a2a2e" trailing />
          <PlaceholderSelection color="#5FCC8A">
            <PlaceholderWords count={3} seed={5} color="#2a2a2e" />
          </PlaceholderSelection>{' '}
          <PlaceholderWords count={10} seed={7} color="#2a2a2e" />
        </PlaceholderParagraph>
      </div>

      <span style={{position: 'absolute', left: 80, top: 18}}>
        <Floater distance={6} duration={5} delay={0}>
          <PlaceholderCursor name="Monaco" color="#5FCC8A" />
        </Floater>
      </span>
      <span style={{position: 'absolute', left: 340, top: 110}}>
        <Floater distance={8} duration={7} delay={-2}>
          <PlaceholderCursor name="Leonidas" color="#985DF7" />
        </Floater>
      </span>
      <span style={{position: 'absolute', left: 200, top: 200}}>
        <Floater distance={10} duration={6} delay={-1}>
          <PlaceholderCursor name="Marko" color="#58B9F8" />
        </Floater>
      </span>
    </div>
  ),
};
