import * as React from 'react';
import BasicButton from 'nice-ui/lib/2-inline-block/BasicButton';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {BasicTooltip} from 'nice-ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';

export interface SoftLockedDeleteButtonProps {
  onDelete: () => void;
}

export const SoftLockedDeleteButton: React.FC<SoftLockedDeleteButtonProps> = ({onDelete}) => {
  const [t] = useT();
  const [locked, setLocked] = React.useState(true);

  return (
    <BasicTooltip renderTooltip={() => (locked ? t('Unlock delete') : t('Delete'))}>
      <BasicButton
        size={32}
        rounder
        onClick={() => {
          if (locked) {
            setLocked(false);
            return;
          }
          onDelete();
        }}
      >
        <Iconista set={'lucide'} icon={'trash'} width={16} height={16} style={{opacity: locked ? 0.5 : 1}} />
      </BasicButton>
    </BasicTooltip>
  );
};
