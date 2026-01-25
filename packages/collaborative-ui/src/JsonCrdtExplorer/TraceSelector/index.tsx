import * as React from 'react';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {ContextItem, ContextPane, ContextSep, ContextTitle} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import * as traces from './traces';
import {useT} from 'use-t';
import {useExplorer} from '../context';

const icon = (trace: traces.TraceDefinition) => {
  switch (trace.type) {
    case 'json':
      return <Iconista width={16} height={16} set={'ant_outline'} icon={'apartment'} />;
    case 'text':
      return <Iconista width={16} height={16} set="elastic" icon="vis_text" />;
    case 'rich-text':
      return <Iconista width={16} height={16} set="ant_outline" icon="highlight" />;
    default:
      return null;
  }
};

export interface TraceSelectorProps {
  width?: number;
  expanded?: boolean;
}

export const TraceSelector: React.FC<TraceSelectorProps> = ({width = 240, expanded}) => {
  const [t] = useT();
  const [loading, setLoading] = React.useState(false);
  const state = useExplorer();

  const load = async (trace: traces.TraceDefinition) => {
    setLoading(true);
    const blob = await traces.loadTrace(trace);
    state.addTrace(blob, trace);
    setLoading(false);
  };

  return (
    <Popup
      block
      renderContext={() => (
        <ContextPane style={{width: width + 8}}>
          <ContextSep />
          <ContextTitle>Rich-text</ContextTitle>
          {traces.quill.map((trace) => (
            <ContextItem closePopup key={trace.id} inset icon={icon(trace)} onClick={() => load(trace)}>
              {trace.name}
            </ContextItem>
          ))}
          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextTitle>Forms</ContextTitle>
          {traces.json.map((trace) => (
            <ContextItem closePopup key={trace.id} inset icon={icon(trace)} onClick={() => load(trace)}>
              {trace.name}
            </ContextItem>
          ))}
          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextTitle>{t('Plain text')}</ContextTitle>
          {traces.text.map((trace) => (
            <ContextItem closePopup key={trace.id} inset icon={icon(trace)} onClick={() => load(trace)}>
              {trace.name}
            </ContextItem>
          ))}
          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextTitle>{t('Fuzzer')}</ContextTitle>
          {traces.fuzzer.map((trace) => (
            <ContextItem closePopup key={trace.id} inset icon={icon(trace)} onClick={() => load(trace)}>
              {trace.name}
            </ContextItem>
          ))}
          <ContextSep />
        </ContextPane>
      )}
    >
      <Button
        block
        ghost
        radius={1}
        icon={<Iconista width={16} height={16} set="ant_outline" icon="shop" />}
        loading={loading}
        disabled={loading}
        size={expanded ? 1 : 0}
      >
        Load
      </Button>
    </Popup>
  );
};
