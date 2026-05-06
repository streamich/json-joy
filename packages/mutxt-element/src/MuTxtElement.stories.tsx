import * as React from 'react';
import preview from '../../../.storybook/preview';
import './index';
import type {MuTxtElement} from './index';
import type {MuTxtApi, SlateEditorDocument} from 'mutxt-react';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt';

const Wrap: React.FC<{children: React.ReactNode; height?: number | string}> = ({children, height = 600}) => (
  <div style={{padding: '32px 24px', boxSizing: 'border-box', minHeight: '100vh'}}>
    <div style={{height, border: '1px dashed rgba(0,0,0,0.15)'}}>{children}</div>
  </div>
);

const meta = preview.meta({
  title: 'mutxt-element',
});

export const Default = meta.story({
  render: () => (
    <Wrap>
      <mu-txt style={{height: '100%'}} />
    </Wrap>
  ),
});

export const ApiAccess = meta.story({
  render: () => {
    const ref = React.useRef<MuTxtElement>(null);
    const [info, setInfo] = React.useState<string>('Editor is mounting...');

    React.useEffect(() => {
      const el = ref.current;
      if (!el) return;
      let cancelled = false;
      el.ready().then((api: MuTxtApi) => {
        if (cancelled) return;
        setInfo('Editor is ready. The MuTxtApi is on element.api.');
        // Demonstrate one API call.
        api.focus();
      });
      return () => {
        cancelled = true;
      };
    }, []);

    return (
      <Wrap>
        <div style={{padding: '8px 4px', font: '12px ui-monospace, Menlo, monospace'}}>{info}</div>
        <mu-txt ref={ref} style={{height: 'calc(100% - 28px)'}} />
      </Wrap>
    );
  },
});

export const ReadyEvent = meta.story({
  render: () => {
    const ref = React.useRef<MuTxtElement>(null);
    const [log, setLog] = React.useState<string[]>([]);

    React.useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const onReady = (e: Event) => {
        const api = (e as CustomEvent<MuTxtApi>).detail;
        setLog((prev) => [...prev, `ready event fired (api focused=${api.focused()})`]);
      };
      el.addEventListener('ready', onReady);
      return () => el.removeEventListener('ready', onReady);
    }, []);

    return (
      <Wrap>
        <div style={{padding: '8px 4px', font: '12px ui-monospace, Menlo, monospace'}}>
          {log.length === 0 ? 'Waiting for ready event...' : log.join('\n')}
        </div>
        <mu-txt ref={ref} style={{height: 'calc(100% - 28px)'}} />
      </Wrap>
    );
  },
});

export const TextFromChildren = meta.story({
  render: () => (
    <Wrap>
      <mu-txt style={{height: '100%'}}>{`
        Plain text seeded from element children.

        Each newline becomes a paragraph. Indentation here is stripped by the dedent logic so the editor sees clean, left-aligned text regardless of where in the HTML you nest the element.

        Edit freely - the seed is applied only once, at mount.
      `}</mu-txt>
    </Wrap>
  ),
});

const slateSeed: SlateEditorDocument = [
  {type: 'h1', children: [{text: 'Seeded with '}, {text: 'format="slate"', code: true}]},
  {
    type: 'p',
    children: [{text: 'This editor was initialized from a JSON Slate document placed inside:'}],
  },
  {
    type: 'code-block',
    language: 'html',
    children: [{text: '<mu-txt format="slate">...</mu-txt>'}],
  },
  {
    type: 'p',
    children: [
      {text: 'Inline marks work: '},
      {text: 'bold', bold: true},
      {text: ', '},
      {text: 'italic', italic: true},
      {text: ', '},
      {text: 'underline', underline: true},
      {text: ', '},
      {text: 'code', code: true},
      {text: ', and '},
      {text: 'links', a: {href: 'https://jsonjoy.com'}},
      {text: '.'},
    ],
  },
];

export const SlateFromChildren = meta.story({
  render: () => (
    <Wrap>
      <mu-txt format="slate" style={{height: '100%'}}>
        {JSON.stringify(slateSeed)}
      </mu-txt>
    </Wrap>
  ),
});

export const MarkdownFromChildren = meta.story({
  render: () => (
    <Wrap>
      <mu-txt format="markdown" style={{height: '100%'}}>{`
        # Markdown seed

        This editor was seeded with markdown source. Right now the markdown
        parser is a stub and the source is loaded as plain text. Once the
        markdown to Slate transform is wired in, **bold**, *italics*, lists,
        code fences, and so on will all render.

        - bullet one
        - bullet two
          - nested
      `}</mu-txt>
    </Wrap>
  ),
});

const buildNativeDataUrl = (): string => {
  const model = ModelWithExt.create<any>(
    s.obj({
      '@type': s.con('mutxt'),
      text: ext.peritext.new('Hello from a binary mu-txt document!'),
    }),
  );
  const bytes = model.toBinary();
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `data:application/vnd.mutxt;base64,${btoa(bin)}`;
};

export const NativeFromDataUrl = meta.story({
  render: () => {
    const url = React.useMemo(buildNativeDataUrl, []);
    return (
      <Wrap>
        <mu-txt src={url} format="native" style={{height: '100%'}} />
      </Wrap>
    );
  },
});

export const NativeFromBlobUrl = meta.story({
  render: () => {
    const url = React.useMemo(() => {
      const model = ModelWithExt.create<any>(
        s.obj({
          '@type': s.con('mutxt'),
          text: ext.peritext.new('Loaded via a blob: URL - same fetch pipeline.'),
        }),
      );
      return URL.createObjectURL(new Blob([model.toBinary() as BlobPart]));
    }, []);
    React.useEffect(() => () => URL.revokeObjectURL(url), [url]);
    return (
      <Wrap>
        <mu-txt src={url} format="native" style={{height: '100%'}} />
      </Wrap>
    );
  },
});

export const TwoInstances = meta.story({
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        padding: 24,
        height: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <div style={{border: '1px dashed rgba(0,0,0,0.15)', minHeight: 0}}>
        <mu-txt style={{height: '100%'}} />
      </div>
      <div style={{border: '1px dashed rgba(0,0,0,0.15)', minHeight: 0}}>
        <mu-txt style={{height: '100%'}} />
      </div>
    </div>
  ),
});
