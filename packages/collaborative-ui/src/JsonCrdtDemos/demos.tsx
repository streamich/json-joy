import * as React from 'react';
import {s} from 'json-joy/lib/json-crdt';
import {DemoDisplay} from '../DemoDisplay';
import type {DemoDefinition} from './types';

export const text: DemoDefinition[] = [
  {
    id: 'plain-text',
    type: 'text',
    title: 'Textarea',
    schema: s.obj({
      demo: s.con('plain-text'),
      text: s.str(''),
    }),
    frame: 'spacious',
    render: (props) => <DemoDisplay {...props} path={['text']} comp={'text'} />,
  },
  {
    id: 'code-mirror',
    type: 'text',
    title: 'CodeMirror',
    schema: s.obj({
      demo: s.con('code-mirror'),
      text: s.str(''),
    }),
    frame: 'fitted',
    render: (props) => <DemoDisplay {...props} path={['text']} comp={'codemirror'} />,
  },
  {
    id: 'vscode',
    type: 'text',
    title: 'Visual Studio Code',
    schema: s.obj({
      demo: s.con('vscode'),
      text: s.str(''),
    }),
    render: (props) => <DemoDisplay {...props} path={['text']} comp={'monaco'} />,
  },
  {
    id: 'ace',
    type: 'text',
    title: 'Ace',
    schema: s.obj({
      demo: s.con('ace'),
      text: s.str(''),
    }),
    render: (props) => <DemoDisplay {...props} path={['text']} comp={'text'} />,
  },
  {
    id: 'slate',
    type: 'text',
    title: 'Slate.js',
    schema: s.obj({
      demo: s.con('slate'),
      text: s.str(''),
    }),
    render: (props) => <DemoDisplay {...props} path={['text']} comp={'text'} />,
  },
];

export const get = (id: string): DemoDefinition | undefined => {
  return text.find((d) => d.id === id);
};
