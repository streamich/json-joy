import * as React from 'react';
import preview from '../../../.storybook/preview';
import './index';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt';

const Frame: React.FC<{html: string}> = ({html}) => (
  <div
    style={{padding: 24, boxSizing: 'border-box', minHeight: '100vh'}}
    // The string is parsed as HTML by the browser; React never touches the
    // <mu-txt> element after this — the same path a CDN consumer takes.
    dangerouslySetInnerHTML={{__html: html}}
  />
);

const meta = preview.meta({
  title: 'mutxt-element/Plain HTML',
});

export const Empty = meta.story({
  render: () => (
    <Frame
      html={`
        <mu-txt style="height: 600px;"></mu-txt>
      `}
    />
  ),
});

export const Text = meta.story({
  render: () => (
    <Frame
      html={`
        <mu-txt style="height: 600px;">
          Plain text seeded via static HTML.

          No React, no JSX - just an HTML custom element.

          Each newline becomes a paragraph. Indentation in the surrounding
          HTML is stripped before parsing.
        </mu-txt>
      `}
    />
  ),
});

export const Markdown = meta.story({
  render: () => (
    <Frame
      html={`
        <mu-txt format="markdown" style="height: 600px;">
          # Markdown seed

          Markdown source loaded from element children. The transform is a
          stub for now, so the source is rendered as plain text.

          - bullet one
          - bullet two
            - nested
        </mu-txt>
      `}
    />
  ),
});

export const Slate = meta.story({
  render: () => {
    const doc = JSON.stringify([
      {type: 'h1', children: [{text: 'Seeded via plain HTML'}]},
      {
        type: 'p',
        children: [{text: 'A JSON Slate document placed inside the element.'}],
      },
      {
        type: 'p',
        children: [
          {text: 'Inline marks: '},
          {text: 'bold', bold: true},
          {text: ', '},
          {text: 'italic', italic: true},
          {text: ', '},
          {text: 'code', code: true},
          {text: '.'},
        ],
      },
    ]);
    return (
      <Frame
        html={`
          <mu-txt format="slate" style="height: 600px;">${doc}</mu-txt>
        `}
      />
    );
  },
});

const buildNativeDataUrl = (sample: string): string => {
  const model = ModelWithExt.create<any>(
    s.obj({
      '@type': s.con('mutxt'),
      text: ext.peritext.new(sample),
    }),
  );
  const bytes = model.toBinary();
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `data:application/vnd.mutxt;base64,${btoa(bin)}`;
};

export const NativeFromDataUrl = meta.story({
  render: () => {
    const url = React.useMemo(
      () => buildNativeDataUrl('Loaded from a data URL via plain HTML.'),
      [],
    );
    return (
      <Frame
        html={`
          <mu-txt src="${url}" format="native" style="height: 600px;"></mu-txt>
        `}
      />
    );
  },
});

export const TwoInstances = meta.story({
  render: () => (
    <Frame
      html={`
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0; height: 600px;">
          <mu-txt style="height: 100%;">First editor.</mu-txt>
          <mu-txt style="height: 100%;">Second editor.</mu-txt>
        </div>
      `}
    />
  ),
});
