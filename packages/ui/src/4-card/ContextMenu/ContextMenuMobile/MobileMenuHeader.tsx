import * as React from 'react';
import {useTheme} from 'nano-theme';
import {useT} from 'use-t';
import {BasicButtonBack} from '../../../2-inline-block/BasicButton/BasicButtonBack';
import {BasicButtonClose} from '../../../2-inline-block/BasicButton/BasicButtonClose';
import {headerClass, headerTitleClass} from './styles';
import type {MenuItem} from '../../StructuralMenu/types';

export interface MobileMenuHeaderProps {
  title: string;
  parent?: MenuItem;
  onBack: () => void;
  onClose: () => void;
}

export const MobileMenuHeader: React.FC<MobileMenuHeaderProps> = ({title, parent, onBack, onClose}) => {
  const [t] = useT();
  const theme = useTheme();

  const lineColor = theme.g(0.92);
  const fgColor = theme.g(0.15);
  const SLOT = 32;

  return (
    <div
      className={headerClass({
        bdb: `1px solid ${lineColor}`,
        col: fgColor,
      })}
    >
      <div style={{width: SLOT, height: SLOT, flexShrink: 0, display: 'flex', alignItems: 'center'}}>
        {parent && <BasicButtonBack onClick={onBack} title={t('Back')} />}
      </div>
      <span className={headerTitleClass({col: fgColor})}>{title}</span>
      <div style={{width: SLOT, height: SLOT, flexShrink: 0, display: 'flex', alignItems: 'center'}}>
        <BasicButtonClose onClick={onClose} title={t('Close')} />
      </div>
    </div>
  );
};
