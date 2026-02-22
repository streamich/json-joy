import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import type {JsonBlockState} from '../JsonBlockState';
import {FlexibleInput} from 'flexible-input';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {JsonBlockTabs} from '../JsonBlockTabs';

const css = {
  pointer: rule({
    ...theme.font.mono.mid,
    col: theme.color.sem.blue[0],
    fz: '12px',
    d: 'flex',
    pd: '1px 0 0',
    alignItems: 'center',
  }),
};

export interface JsonBlockToolbar {
  state: JsonBlockState;
}

export const JsonBlockToolbar: React.FC<JsonBlockToolbar> = ({state}) => {
  const path = useBehaviorSubject(state.path$);

  const handlePointerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let txt = e.target.value;
    if (txt && txt[0] !== '/') txt = '/' + txt;
    state.setPath(txt);
  };

  return (
    <Flex style={{flexDirection: 'row', alignItems: 'center'}}>
      <JsonBlockTabs state={state} />
      <Space horizontal size={2} />
      <div className={css.pointer}>
        <FlexibleInput value={path} onChange={handlePointerChange} typeahead={path ? '' : '/path'} />
      </div>
    </Flex>
  );
};
