import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {Split} from '../../../3-list-item/Split';
import {CommandPaletteTitle} from '../CommandPaletteList/CommandPaletteTitle';

const blockClass = rule({
  pad: '12px 0',
});

const contentClass = rule({
  ...theme.font.ui1.mid,
  pad: '8px 0',
  fz: '14px',
});

const labelClass = rule({
  d: 'flex',
  alignItems: 'center',
  pad: '0 20px 0 0',
});

export interface Props {
  title?: React.ReactNode;
  right?: React.ReactNode;
  active?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const CommandArg: React.FC<Props> = ({title, right, active, children, onClick}) => {
  return (
    <div className={blockClass} onClick={onClick}>
      <div>
        {!!title && (
          <Split style={{userSelect: 'none'}}>
            <CommandPaletteTitle contrast={active}>{title}</CommandPaletteTitle>
            <div className={labelClass}>{right}</div>
          </Split>
        )}
        {active && <div className={contentClass}>{children}</div>}
      </div>
    </div>
  );
};
