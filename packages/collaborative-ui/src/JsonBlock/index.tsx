import * as React from 'react';
import {Split} from 'nice-ui/lib/3-list-item/Split';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {JsonBlockText} from './JsonBlockText';
import {JsonBlockClickable} from './JsonBlockClickable';
import {CodeblockLayout} from '../CodeblockLayout';
import {rule, theme} from 'nano-theme';
import {JsonBlockState} from './JsonBlockState';
import {JsonBlockToolbar} from './JsonBlockToolbar';
import {JsonBlockToolbarRight} from './JsonBlockToolbarRight';
import type {OnChange} from 'clickable-json/lib/ClickableJson/types';

const css = {
  pointer: rule({
    ...theme.font.mono.mid,
    col: theme.color.sem.blue[0],
    fz: '12px',
    d: 'flex',
    pd: '1px 0 0',
    alignItems: 'center',
  }),
  body: rule({
    w: '100%',
    bxz: 'border-box',
    minH: '2em',
  }),
};

export interface JsonBlockProps {
  value: unknown;
  compact?: boolean;
  readonly?: boolean;
  filename?: string;
  state?: JsonBlockState;
  noToolbar?: boolean;
  onChange?: OnChange;
}

export const JsonBlock: React.FC<JsonBlockProps> = ({
  value,
  compact,
  readonly,
  filename = 'file',
  state: controlledState,
  noToolbar,
  onChange,
}) => {
  const state = React.useMemo(() => controlledState || new JsonBlockState(), [controlledState]);
  const view = useBehaviorSubject(state.view$);
  const path = useBehaviorSubject(state.path$);

  let content: React.ReactNode = null;

  switch (view) {
    case 'interactive':
      content = (
        <JsonBlockClickable compact={compact} value={value} path={path} onChange={readonly ? undefined : onChange} />
      );
      break;
    case 'json':
      content = <JsonBlockText key={'compact'} value={value} path={path} />;
      break;
    case 'text':
      content = <JsonBlockText key={'text'} plain value={value} path={path} />;
      break;
    case 'minified':
      content = <JsonBlockText key={'minified'} plain wrap tab={0} value={value} path={path} />;
      break;
  }

  const header = noToolbar ? null : (
    <Split>
      <JsonBlockToolbar state={state} />
      <JsonBlockToolbarRight value={value} filename={filename} state={state} />
    </Split>
  );

  return (
    <CodeblockLayout>
      {header}
      <div className={css.body}>{content}</div>
    </CodeblockLayout>
  );
};
