import * as React from 'react';
import {rule} from 'nano-theme';
import type {Model} from 'json-joy/lib/json-crdt';
import {JsonPatch} from 'json-joy/lib/json-crdt/json-patch/JsonPatch';
import type {JsonCrdtModelState} from '../JsonCrdtModelState';
import {Checkbox} from 'nice-ui/lib/2-inline-block/Checkbox';
import {Split} from 'nice-ui/lib/3-list-item/Split';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {Separator} from 'nice-ui/lib/3-list-item/Separator';
import {MiniTitle} from 'nice-ui/lib/3-list-item/MiniTitle';
import {Scrollbox} from 'nice-ui/lib/4-card/Scrollbox';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {JsonBlock} from '../../JsonBlock';
import {JsonBlockToolbar} from '../../JsonBlock/JsonBlockToolbar';
import {JsonBlockToolbarRight} from '../../JsonBlock/JsonBlockToolbarRight';
import type {OnChange} from 'clickable-json/lib/ClickableJson/types';
import {useModelTick} from '../../hooks/useModelTick';
import {LogReadonlyLabel} from '../../atoms/ReadonlyLabel';

const css = {
  header: rule({
    d: 'flex',
    ai: 'center',
    pad: '8px 8px 8px 16px',
    minH: '24px',
  }),
  content: rule({
    pad: '0 8px 8px',
  }),
};

export interface JsonCrdtModelViewProps {
  model: Model<any>;
  readonly?: boolean;
  state: JsonCrdtModelState;
  filename?: string;
}

export const JsonCrdtModelView: React.FC<JsonCrdtModelViewProps> = ({model, readonly, state, filename}) => {
  const show = useBehaviorSubject(state.showView$);
  useModelTick(model);
  // biome-ignore lint: manual dependency list
  const value = React.useMemo(() => {
    return model.view();
  }, [model.tick]);

  const handleChange: OnChange = React.useMemo(() => {
    const patcher = new JsonPatch(model);
    return (ops) => {
      patcher.apply(ops);
    };
  }, [model]);

  return (
    <>
      <Separator />
      <div className={css.header}>
        <Split>
          <Flex style={{alignItems: 'center'}}>
            <div style={{marginTop: -1}}>
              <MiniTitle>{'View'}</MiniTitle>
            </div>
            {!!readonly && show && (
              <>
                <Space horizontal size={0} />
                <LogReadonlyLabel />
              </>
            )}
            {show && (
              <>
                <Space horizontal size={2} />
                <JsonBlockToolbar state={state.viewState} />
              </>
            )}
          </Flex>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Flex style={{alignItems: 'center'}}>
              <JsonBlockToolbarRight value={value} filename={filename} state={state.viewState} compact={!show} />
              <Space horizontal size={0} />
              <Checkbox as={'span'} small on={show} onChange={state.toggleShowView} />
            </Flex>
          </div>
        </Split>
      </div>
      {show && (
        <Scrollbox style={{maxHeight: 500}}>
          <div className={css.content}>
            <JsonBlock
              noToolbar
              value={value}
              readonly={readonly}
              filename={filename}
              state={state.viewState}
              onChange={handleChange}
            />
          </div>
        </Scrollbox>
      )}
    </>
  );
};
