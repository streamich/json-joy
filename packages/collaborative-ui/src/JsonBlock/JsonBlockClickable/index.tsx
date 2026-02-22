import * as React from 'react';
import {rule} from 'nano-theme';
import {ClickableJson} from '@jsonjoy.com/click-json';
import {select} from '../../util/select';
import type {OnChange} from '@jsonjoy.com/click-json/lib/ClickableJson/types';

const css = {
  block: rule({
    mr: 0,
    pd: '4px 8px 1px 40px',
    w: '100%',
    bxz: 'border-box',
  }),
};

export interface JsonBlockClickableProps {
  value: unknown;
  path?: string;
  compact?: boolean;
  onChange?: OnChange;
}

export const JsonBlockClickable: React.FC<JsonBlockClickableProps> = ({value, path, compact, onChange}) => {
  const view = React.useMemo(() => {
    return select(value, path);
  }, [value, path]);

  return (
    <div className={css.block} style={{paddingLeft: !!view && typeof view === 'object' ? undefined : '1px'}}>
      <ClickableJson
        doc={view}
        compact
        onChange={onChange}
        readonly={!onChange}
        collapsed={compact}
        fontSize={'12px'}
      />
    </div>
  );
};
