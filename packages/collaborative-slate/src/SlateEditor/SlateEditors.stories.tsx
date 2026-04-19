import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {SlateEditor} from './SlateEditor';
import type {SlateEditorDocument} from './types';

const initialValue: SlateEditorDocument = [
  {
    type: 'h1',
    children: [{text: 'Drop-in Slate editor'}],
  },
  {
    type: 'p',
    children: [
      {text: 'This story renders the new '},
      {text: 'SlateEditor', bold: true},
      {text: ' by itself, with a balanced layout, '},
      {text: 'inline formatting', italic: true},
      {text: ', alignment controls, '},
      {text: 'links', a: {href: 'https://jsonjoy.com'}},
      {text: ', lists, quotes, and '},
      {text: 'code', code: true},
      {text: ' blocks available from the toolbar.'},
    ],
  },
  {
    type: 'p',
    align: 'center',
    children: [{text: 'Centered copy looks intentional instead of drifting out of rhythm.'}],
  },
  {
    type: 'ul',
    children: [
      {
        type: 'li',
        children: [{text: 'Formatting controls use the shared UI component library.'}],
      },
      {
        type: 'li',
        children: [{text: 'The editor can run standalone or bind to a json-joy model.'}],
      },
      {
        type: 'li',
        children: [{text: 'Selected text can now be wrapped in editable links from the toolbar.'}],
      },
    ],
  },
  {
    type: 'blockquote',
    children: [{text: 'A story should show the component, not bury it under unrelated scaffolding.'}],
  },
  {
    type: 'code-block',
    language: 'js',
    fileName: 'editor-demo.js',
    children: [{text: 'import {SlateEditor} from "@jsonjoy.com/collaborative-slate";\n\n<SlateEditor autoFocus={false} initialValue={document} />'}],
  },
];

const meta = preview.meta({
  title: 'SlateEditor',
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

export const Primary = meta.story({
  render: () => <Story />,
});
