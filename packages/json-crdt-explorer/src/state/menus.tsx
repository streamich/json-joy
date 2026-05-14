import * as React from 'react';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import * as traces from './traces';
import type {JsonCrdtExplorerState} from '.';
import ApartmentIcon__svg from 'iconista/lib/react/ant_outline/apartment';
import VisTextIcon__svg from 'iconista/lib/react/elastic/vis_text';
import HighlightIcon__svg from 'iconista/lib/react/ant_outline/highlight';

const ApartmentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ApartmentIcon__svg {...props} />;
const VisTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <VisTextIcon__svg {...props} />;
const HighlightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <HighlightIcon__svg {...props} />;

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

export class Menus {
  constructor(public readonly state: JsonCrdtExplorerState) {}

  public newFileMenu(): MenuItem {
    const {state} = this;
    return {
      name: 'New',
      minWidth: 300,
      expand: 6,
      children: [
        {
          name: 'Empty document',
          right: () => (
            <Sidetip>
              <Code>
                <span style={{fontSize: '11.5px'}}>{'()'}</span>
              </Code>
            </Sidetip>
          ),
          onSelect: () => state.createNew(),
        },
        {
          name: 'Empty object',
          right: () => (
            <Sidetip>
              <Code>
                <span style={{fontSize: '11.5px'}}>{'{}'}</span>
              </Code>
            </Sidetip>
          ),
          onSelect: () => state.createNew({}),
        },
        {
          name: 'Empty array',
          right: () => (
            <Sidetip>
              <Code>
                <span style={{fontSize: '11.5px'}}>{'[]'}</span>
              </Code>
            </Sidetip>
          ),
          onSelect: () => state.createNew([]),
        },
        {
          name: 'Sample document',
          right: () => (
            <Sidetip>
              <Code>
                <span style={{fontSize: '11.5px'}}>{'{"foo": ...'}</span>
              </Code>
            </Sidetip>
          ),
          onSelect: () =>
            state.createNew({
              name: 'Alice',
              age: 30,
              hobbies: ['reading', 'hiking'],
              address: {
                city: 'Wonderland',
                zip: '12345',
              },
            }),
        },
      ],
    };
  }

  public tracesMenu(width: number, load: (wait: Promise<void>) => void): MenuItem {
    const {state} = this;
    const wrapLoader = async (trace: traces.TraceDefinition) => {
      const blob = await traces.loadTrace(trace);
      state.addTrace(blob, trace);
    };
    return {
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
            onSelect: () => load(wrapLoader(trace)),
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
            onSelect: () => load(wrapLoader(trace)),
          })),
        },
        {sep: true, name: 'sep-2'},
        {
          name: 'Plain text',
          expand: 4,
          children: traces.text.map((trace) => ({
            id: trace.id,
            name: trace.name,
            icon: traceIcon(trace),
            onSelect: () => load(wrapLoader(trace)),
          })),
        },
        {sep: true, name: 'sep-3'},
        {
          name: 'Fuzzer',
          expand: 4,
          children: traces.fuzzer.map((trace) => ({
            id: trace.id,
            name: trace.name,
            icon: traceIcon(trace),
            onSelect: () => load(wrapLoader(trace)),
          })),
        },
      ],
    };
  }
}
