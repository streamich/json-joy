import * as React from 'react';
import {useT} from 'use-t';
import * as css from '../css';
import {ValueInput} from './ValueInput';
import {AddAction} from '../buttons/Action/AddAction';
import {CancelAction} from '../buttons/Action/CancelAction';

export interface ArrayInsertProps {
  visible?: boolean;
  withType?: boolean;
  /** Bumping this counter opens the insert editor (e.g. from a node toolbar). */
  openSignal?: number;
  onSubmit: (value: string, type: string) => void;
}

export const ArrayInsert: React.FC<ArrayInsertProps> = ({visible, withType, openSignal, onSubmit}) => {
  const [t] = useT();
  const [editing, setEditing] = React.useState(false);

  React.useEffect(() => {
    if (openSignal) setEditing(true);
  }, [openSignal]);

  const handleSubmit = (value: string, type: string) => {
    setEditing(false);
    onSubmit(value, type);
  };

  if (editing) {
    return (
      <span style={{position: 'relative'}}>
        <ValueInput
          focus
          withType={withType}
          visible={visible}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(false)}
        />
        <CancelAction onClick={() => setEditing(false)} />
      </span>
    );
  }

  return (
    <span className={css.insArrBlock} style={{display: visible ? undefined : 'none'}}>
      <span className={css.insArrDot} />
      <span className={css.insArrLine} />
      <span className={css.insArrButton}>
        <AddAction tooltip={t('Insert')} onClick={() => setEditing(true)} />
      </span>
    </span>
  );
};
