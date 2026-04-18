import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {SlateEditor} from './SlateEditor';
import type {SlateEditorDocument} from './types';

const initialValue: SlateEditorDocument = [
  {
    type: 'heading-one',
    children: [{text: 'Drop-in Slate editor'}],
  },
  {
    type: 'paragraph',
    children: [
      {text: 'This story renders the new '},
      {text: 'SlateEditor', bold: true},
      {text: ' by itself, with a balanced layout, '},
      {text: 'inline formatting', italic: true},
      {text: ', alignment controls, lists, quotes, and '},
      {text: 'code', code: true},
      {text: ' blocks available from the toolbar.'},
    ],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{text: 'Centered copy looks intentional instead of drifting out of rhythm.'}],
  },
  {
    type: 'bulleted-list',
    children: [
      {
        type: 'list-item',
        children: [{text: 'Formatting controls use the shared UI component library.'}],
      },
      {
        type: 'list-item',
        children: [{text: 'The editor can run standalone or bind to a json-joy model.'}],
      },
      {
        type: 'list-item',
        children: [{text: 'The folder structure is split by blocks, inline, toolbar, and chrome.'}],
      },
    ],
  },
  {
    type: 'blockquote',
    children: [{text: 'A story should show the component, not bury it under unrelated scaffolding.'}],
  },
  {
    type: 'code-block',
    language: 'tsx',
    children: [{text: '<SlateEditor autoFocus={false} initialValue={document} />'}],
  },
];

const meta = preview.meta({
  title: 'Slate/Editor',
});

const Story: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '32px 24px 56px',
        boxSizing: 'border-box',
      }}
    >
      <SlateEditor
        autoFocus={false}
        initialValue={initialValue}
        minHeight={440}
      />
    </div>
  );
};

export const Editor = meta.story({
  render: () => <Story />,
});
