import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {DropArea, DropAreaState} from '.';
import {Iconista} from '../../icons/Iconista';

const meta: Meta<typeof DropArea> = {
  title: '5. Block/DropArea',
  component: DropArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

const frameStyle: React.CSSProperties = {
  width: 480,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const FilesPreview: React.FC<{files: File[]}> = ({files}) => {
  if (!files.length) return null;
  return (
    <div style={{fontFamily: 'monospace', fontSize: 12, color: '#666'}}>
      <strong>{files.length}</strong> file(s):
      <ul style={{margin: '4px 0 0', paddingLeft: 20}}>
        {files.map((f, i) => (
          <li key={i}>
            {f.name} ({f.size}b)
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Basic: StoryObj<typeof meta> = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    return (
      <div style={frameStyle}>
        <DropArea onFiles={setFiles} />
        <FilesPreview files={files} />
      </div>
    );
  },
};

export const Compact: StoryObj<typeof meta> = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    return (
      <div style={frameStyle}>
        <DropArea compact onFiles={setFiles} />
        <FilesPreview files={files} />
      </div>
    );
  },
};

export const CustomLabel: StoryObj<typeof meta> = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    return (
      <div style={frameStyle}>
        <DropArea onFiles={setFiles}>
          <span className="DropArea-text" style={{fontSize: 13}}>
            Drag a CSV here to import
          </span>
        </DropArea>
        <FilesPreview files={files} />
      </div>
    );
  },
};

export const WithIcon: StoryObj<typeof meta> = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    return (
      <div style={frameStyle}>
        <DropArea onFiles={setFiles} paper={false}>
          <Iconista set={'lucide' as any} icon={'upload' as any} width={24} height={24} />
          <div className="DropArea-text" style={{fontSize: 13, lineHeight: 1.4}}>
            Drop a file here, or click to pick
          </div>
        </DropArea>
        <FilesPreview files={files} />
      </div>
    );
  },
};

export const NoPaper: StoryObj<typeof meta> = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    return (
      <div style={frameStyle}>
        <DropArea paper={false} compact onFiles={setFiles} />
        <FilesPreview files={files} />
      </div>
    );
  },
};

export const SingleFile: StoryObj<typeof meta> = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    return (
      <div style={frameStyle}>
        <DropArea multiple={false} accept="image/*" onFiles={setFiles}>
          <span className="DropArea-text" style={{fontSize: 13}}>
            Drop a single image here
          </span>
        </DropArea>
        <FilesPreview files={files} />
      </div>
    );
  },
};

export const ExternalState: StoryObj<typeof meta> = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    const state = React.useMemo(() => new DropAreaState(setFiles), []);
    const over = state.over.use();
    return (
      <div style={frameStyle}>
        <div style={{padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: '#666'}}>
          dragOver: <strong>{String(over)}</strong>
        </div>
        <DropArea state={state} compact />
        <div>
          <button type="button" onClick={state.pick}>
            Choose file…
          </button>
        </div>
        <FilesPreview files={files} />
      </div>
    );
  },
};

export const ClickDisabled: StoryObj<typeof meta> = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    const state = React.useMemo(() => new DropAreaState(setFiles), []);
    return (
      <div style={frameStyle}>
        <DropArea state={state} clickToPick={false} compact>
          <span className="DropArea-text" style={{fontSize: 13}}>
            Drop only — click does nothing
          </span>
        </DropArea>
        <div>
          <button type="button" onClick={state.pick}>
            Choose file…
          </button>
        </div>
        <FilesPreview files={files} />
      </div>
    );
  },
};
