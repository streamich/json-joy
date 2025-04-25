import * as React from 'react';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {rule} from 'nano-theme';
import type {ToolbarFormatting} from '../state/formattings';

const blockClass = rule({
  d: 'flex',
  ai: 'center',
  fz: '14px',
  us: 'none',
});

const iconClass = rule({
  fz: '14px',
  w: '28px',
  h: '28px',
  bdrad: '6px',
  pd: '0',
  mr: '0 8px 0 0',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  bg: 'rgba(0,0,0,.08)',
  o: .7,
  '&>div': {
    transform: 'scale(.9)',
    transformOrigin: 'center',
    d: 'flex',
    ai: 'center',
    jc: 'center',
  },
});

export interface FormattingTitleProps {
  formatting: ToolbarFormatting;
}

export const FormattingTitle: React.FC<FormattingTitleProps> = ({formatting}) => {
  const behavior = formatting.behavior;
  const menu = behavior.data().menu;

  const icon = menu?.icon?.();
  const name = menu?.name ?? behavior.name;

  return (
    <div className={blockClass}>
      {icon ? (
        <Flex style={{alignItems: 'center'}}>
          <div className={iconClass}>
            <div>{icon}</div>
          </div>
          {name}
        </Flex>
      ) : (
        name
      )}
    </div>
  );
};
