import * as React from 'react';
import {useT} from 'use-t';
import {Meta} from '../../1-inline/Meta';
import {FieldHint} from './components/FieldHint';

export interface EmptyValueProps {
  /** Fires when the placeholder is clicked (e.g. to reveal the editor). */
  onClick?: () => void;
  /** Placeholder label. Defaults to "Empty". */
  label?: React.ReactNode;
  /** Append a warning pill: the field is required but has no value yet. */
  required?: boolean;
}

/**
 * Muted "Empty" placeholder shown in a value cell that has no value yet. The
 * read-only counterpart to {@link FieldValueView} for the empty case.
 */
export const EmptyValue: React.FC<EmptyValueProps> = ({onClick, label, required}) => {
  const [t] = useT();
  return (
    <span
      {...(onClick
        ? {
            onClick,
            role: 'button',
            tabIndex: 0,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            },
          }
        : null)}
      style={{cursor: onClick ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: 6}}
    >
      <Meta>{label ?? t('Empty')}</Meta>
      {required && <FieldHint warn note={t('Required')} />}
    </span>
  );
};
