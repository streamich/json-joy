import * as React from 'react';
import {rule} from 'nano-theme';
import {FixedColumn} from '@jsonjoy.com/ui/lib/3-list-item/FixedColumn';
import {fonts} from '@jsonjoy.com/ui/lib/styles';
import {useT} from 'use-t';
import {CopyButton} from './CopyButton';

const iconColumnWidth = 40;

const domainClass = rule({
  ...fonts.get('ui', 'bold', 1),
  fz: '14px',
  maxW: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const buttonGroupClass = rule({
  w: '60px',
  d: 'flex',
  ai: 'center',
  flexDirection: 'row-reverse',
  mr: '-4px',
  pd: '0',
});

export interface ColorDisplayLayoutProps {
  color: string;
  text?: string;
}

export const ColorDisplayLayout: React.FC<ColorDisplayLayoutProps> = ({color, text}) => {
  const [t] = useT();

  return (
    <FixedColumn right={60}>
      <div style={{maxWidth: 'calc(100% - 100px)'}}>
        <div style={{overflow: 'hidden', width: 'calc(min(248px,100vw - 100px))'}}>
          <div className={domainClass}>
            {text ?? color}
          </div>
        </div>
      </div>
      <div className={buttonGroupClass}>
        <CopyButton width={48} height={48} round onCopy={() => color} tooltip={{anchor: {}}} />
      </div>
    </FixedColumn>
  );
};
