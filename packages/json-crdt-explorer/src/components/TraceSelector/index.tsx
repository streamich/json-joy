import * as React from 'react';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import * as traces from './traces';
import {useT} from 'use-t';
import {useExplorer} from '../../context';

const ApartmentIcon = makeIcon({set: 'ant_outline', icon: 'apartment'});
const VisTextIcon = makeIcon({set: 'elastic', icon: 'vis_text'});
const HighlightIcon = makeIcon({set: 'ant_outline', icon: 'highlight'});
const ShopIcon = makeIcon({set: 'ant_outline', icon: 'shop'});

const traceIcon = (trace: traces.TraceDefinition) => {
  switch (trace.type) {
    case 'json':
      return () => <ApartmentIcon width={16} height={16} />;
    case 'text':
      return () => <VisTextIcon width={16} height={16} />;
    case 'rich-text':
      return () => <HighlightIcon width={16} height={16} />;
    default:
      return undefined;
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

  const menu: MenuItem = React.useMemo(() => ({
    name: 'Load trace',
    minWidth: width,
    children: [
      {
        name: 'Rich-text',
        expand: 4,
        children: traces.quill.map((trace) => ({
          id: trace.id,
          name: trace.name,
          icon: traceIcon(trace),
          onSelect: () => load(trace),
        })),
      },
      {sep: true, name: 'sep-1'},
      {
        name: 'Forms',
        expand: 4,
        children: traces.json.map((trace) => ({
          id: trace.id,
          name: trace.name,
          icon: traceIcon(trace),
          onSelect: () => load(trace),
        })),
      },
      {sep: true, name: 'sep-2'},
      {
        name: t('Plain text'),
        expand: 4,
        children: traces.text.map((trace) => ({
          id: trace.id,
          name: trace.name,
          icon: traceIcon(trace),
          onSelect: () => load(trace),
        })),
      },
      {sep: true, name: 'sep-3'},
      {
        name: t('Fuzzer'),
        expand: 4,
        children: traces.fuzzer.map((trace) => ({
          id: trace.id,
          name: trace.name,
          icon: traceIcon(trace),
          onSelect: () => load(trace),
        })),
      },
    ],
  }), [width, t]);

  return (
    <Popup
      block
      renderContext={() => (
        <ContextMenu
          inset
          menu={menu}
          pane={{style: {width}}}
        />
      )}
    >
      <Button
        block
        ghost
        radius={1}
        icon={<ShopIcon width={16} height={16} />}
        loading={loading}
        disabled={loading}
        size={expanded ? 1 : -1}
      >
        Load
      </Button>
    </Popup>
  );
};

