import * as React from 'react';
import {useT} from 'use-t';
import {Iconista} from '../../../../icons/Iconista';
import {BasicTooltip} from '../../../BasicTooltip';

export const OptionalBadge: React.FC = () => {
  const [t] = useT();
  return (
    <BasicTooltip renderTooltip={() => t('optional')}>
      <span
        role="img"
        style={{marginInlineStart: 4, opacity: 0.45, verticalAlign: 'middle'}}
        aria-label={t('optional')}
      >
        <Iconista width={11} height={11} set="tabler" icon="circle-dashed" />
      </span>
    </BasicTooltip>
  );
};
