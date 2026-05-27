import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {Button} from '../../2-inline-block/Button';
import {ConfirmPrompt} from '../../4-card/ConfirmPrompt';
import {FeatureLayout} from '../../6-page/FeatureLayout';
import {jsonCrdtPage} from '../../6-page/FeatureLayout/index.stories';
import {Modal} from './Modal';
import {ModalHostProvider} from './ModalHost';
import type {ModalProps} from './types';
import {useConfirm} from './useConfirm';

const meta: Meta<typeof Modal> = {
  title: '7. Fullscreen/Modal2',
  component: Modal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

const Lorem: React.FC<{paragraphs?: number}> = ({paragraphs = 1}) => (
  <>
    {Array.from({length: paragraphs}).map((_, i) => (
      <p key={i} style={{margin: '0 0 1em'}}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat.
      </p>
    ))}
  </>
);

const Demo: React.FC<{label: string; modalProps?: Partial<ModalProps>; children: React.ReactNode}> = ({
  label,
  modalProps,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Modal {...modalProps} open={open} onClose={() => setOpen(false)}>
        {children}
      </Modal>
    </>
  );
};

export const Auto: Story = {
  render: () => (
    <Demo label="Open natural-size modal" modalProps={{closeButton: true}}>
      <div style={{maxWidth: 360}}>
        <Lorem />
      </div>
    </Demo>
  ),
};

const PromptDemo: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open prompt</Button>
      <Modal bare open={open} onClose={close}>
        <ConfirmPrompt
          miniTitle="Confirm"
          title="Delete forever?"
          confirmLabel="Delete"
          onConfirm={close}
          onCancel={close}
        >
          This action cannot be undone.
        </ConfirmPrompt>
      </Modal>
    </>
  );
};

export const Prompt: Story = {
  render: () => <PromptDemo />,
};

export const Page: Story = {
  render: () => (
    <Demo
      label="Open page modal"
      modalProps={{
        size: 'page',
        title: 'Settings',
        closeButton: true,
        footer: <Button primary>Save</Button>,
      }}
    >
      <Lorem paragraphs={20} />
    </Demo>
  ),
};

export const Full: Story = {
  render: () => (
    <Demo label="Open full-screen modal" modalProps={{size: 'full', inset: 32, title: 'Editor', closeButton: true}}>
      <Lorem paragraphs={30} />
    </Demo>
  ),
};

export const Blur: Story = {
  render: () => (
    <Demo label="Open with blurred backdrop" modalProps={{backdrop: 'blur', title: 'Blurred', closeButton: true}}>
      <div style={{maxWidth: 360}}>
        <Lorem />
      </div>
    </Demo>
  ),
};

export const Frost: Story = {
  render: () => (
    <Demo
      label="Open with frosted-glass backdrop"
      modalProps={{backdrop: 'frost', title: 'Frosted glass', closeButton: true}}
    >
      <div style={{maxWidth: 360}}>
        <Lorem />
      </div>
    </Demo>
  ),
};

export const FeaturePage: Story = {
  render: () => (
    <Demo
      label="Open feature page in modal"
      modalProps={{size: 'page', width: 1160, noPadding: true, closeButton: true}}
    >
      <div style={{padding: '0 clamp(16px, 8vw, 120px)'}}>
        <FeatureLayout feature={jsonCrdtPage} />
      </div>
    </Demo>
  ),
};

const ConfirmDemo: React.FC = () => {
  const confirm = useConfirm();
  const [result, setResult] = React.useState('');
  return (
    <>
      <Button
        onClick={async () => {
          const ok = await confirm({
            miniTitle: 'Confirm',
            title: 'Delete forever?',
            message: 'This action cannot be undone.',
            confirmLabel: 'Delete',
          });
          setResult(ok ? 'Confirmed' : 'Cancelled');
        }}
      >
        Delete…
      </Button>
      <span style={{marginLeft: 12}}>{result}</span>
    </>
  );
};

export const ImperativeConfirm: Story = {
  render: () => (
    <ModalHostProvider>
      <ConfirmDemo />
    </ModalHostProvider>
  ),
};
