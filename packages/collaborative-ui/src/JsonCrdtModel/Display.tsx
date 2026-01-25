import * as React from 'react';
import type {Model} from 'json-joy/lib/json-crdt';
import {rule} from 'nano-theme';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {Checkbox} from '@jsonjoy.com/ui/lib/2-inline-block/Checkbox';
import {Scrollbox} from '@jsonjoy.com/ui/lib/4-card/Scrollbox';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import type {JsonCrdtModelState} from './JsonCrdtModelState';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';
import {LogReadonlyLabel} from '../atoms/ReadonlyLabel';

const css = {
  header: rule({
    d: 'flex',
    ai: 'center',
    pad: '8px 8px 8px 16px',
    minH: '24px',
  }),
  content: rule({
    d: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pad: '4px 16px 16px',
  }),
  debug: rule({
    '& *': {
      out: '1px solid blue !important',
    },
    '& div': {
      out: '1px solid red !important',
    },
    '& span': {
      out: '1px solid green !important',
    },
  }),
};

export interface DisplayProps {
  state: JsonCrdtModelState;
  model: Model<any>;
  readonly?: boolean;
  renderDisplay: (model: Model<any>, readonly: boolean) => React.ReactNode;
}

export const Display: React.FC<DisplayProps> = React.memo(({state, model, readonly, renderDisplay}) => {
  const [t] = useT();
  const show = useBehaviorSubject(state.showDisplay$);
  const showOutlines = useBehaviorSubject(state.showDisplayOutlines$);

  return (
    <>
      <div className={css.header}>
        <Split>
          <div style={{marginTop: -1}}>
            <MiniTitle>{'Display'}</MiniTitle>
            {!!readonly && show && (
              <>
                <Space horizontal size={0} />
                <LogReadonlyLabel />
              </>
            )}
          </div>
          <div style={{display: 'flex', alignItems: 'center'}}>
            {show && (
              <>
                <BasicTooltip nowrap renderTooltip={() => t('Outline')}>
                  <BasicButton onClick={() => state.showDisplayOutlines$.next(!state.showDisplayOutlines$.getValue())}>
                    <Iconista set="elastic" icon="vector" width={16} height={16} />
                  </BasicButton>
                </BasicTooltip>
                <Space horizontal />
              </>
            )}
            <Checkbox as={'span'} small on={show} onChange={state.toggleShowDisplay} />
          </div>
        </Split>
      </div>
      {show && (
        <Scrollbox style={{maxHeight: 500}}>
          <div className={css.content + (showOutlines ? css.debug : '')}>{renderDisplay(model, !!readonly)}</div>
        </Scrollbox>
      )}
    </>
  );
});
