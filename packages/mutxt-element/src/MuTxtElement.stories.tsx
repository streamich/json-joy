import * as React from 'react';
import preview from '../../../.storybook/preview';
import './index';
import type {MuTxtElement} from './index';
import type {MuTxtApi} from 'mutxt-react';

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
    const [info, setInfo] = React.useState<string>('Editor is mounting…');

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
          {log.length === 0 ? 'Waiting for ready event…' : log.join('\n')}
        </div>
        <mu-txt ref={ref} style={{height: 'calc(100% - 28px)'}} />
      </Wrap>
    );
  },
});

export const TwoInstances = meta.story({
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 24, height: '100vh', boxSizing: 'border-box'}}>
      <div style={{border: '1px dashed rgba(0,0,0,0.15)', minHeight: 0}}>
        <mu-txt style={{height: '100%'}} />
      </div>
      <div style={{border: '1px dashed rgba(0,0,0,0.15)', minHeight: 0}}>
        <mu-txt style={{height: '100%'}} />
      </div>
    </div>
  ),
});
