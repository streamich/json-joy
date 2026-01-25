import * as React from 'react';
import {useT} from 'use-t';
import * as css from '../css';
import {useTheme} from 'nano-theme';
import {FlexibleInput} from 'flexible-input';
import {ValueInput} from './ValueInput';
import {AddAction} from '../buttons/Action/AddAction';

export interface ObjectInsertProps {
  visible?: boolean;
  withType?: boolean;
  onSubmit: (key: string, value: string, type: string) => void;
}

export const ObjectInsert: React.FC<ObjectInsertProps> = ({visible, withType, onSubmit}) => {
  const [t] = useT();
  const [editing, setEditing] = React.useState(false);
  const [property, setProperty] = React.useState('');
  const [value, setValue] = React.useState('');
  const inputPropertyRef = React.useRef<HTMLInputElement>(null);
  const inputValueRef = React.useRef<HTMLInputElement>(null);
  const theme = useTheme();

  const handleSubmit = (value: string, type: string) => {
    if (inputValueRef.current) inputValueRef.current.blur();
    onSubmit(property, value, type);
    setProperty('');
    setValue('');
    setEditing(false);
  };

  if (!visible) return null;

  if (editing) {
    const keyInput = (
      <span
        className={css.property + css.input}
        style={{
          color: theme.g(0.1),
          background: theme.bg,
          display: visible ? undefined : 'none',
          margin: '-1px 0 -1px -2px',
          padding: '3px 4px',
          border: `1px solid ${theme.g(0.85)}`,
          fontWeight: 'bold',
        }}
      >
        <FlexibleInput
          focus
          inp={(el) => ((inputPropertyRef as any).current = el)}
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          onSubmit={() => {
            if (inputValueRef.current) inputValueRef.current.focus();
          }}
          onCancel={() => {
            if (property) setProperty('');
            else if (value) setValue('');
            else setEditing(false);
          }}
        />
      </span>
    );

    const valueInput = (
      <ValueInput
        inp={(el) => ((inputValueRef as any).current = el)}
        visible={visible}
        withType={withType}
        onSubmit={handleSubmit}
        onCancel={() => {
          if (inputPropertyRef.current) inputPropertyRef.current.focus();
        }}
      />
    );

    return (
      <span style={{display: visible ? undefined : 'none'}}>
        {keyInput}
        <span className={css.colon}>
          <span>{':'}</span>
        </span>
        {valueInput}
      </span>
    );
  }

  return (
    <span className={css.insArrBlock} style={{display: visible ? undefined : 'none'}} onClick={() => setEditing(true)}>
      <span className={css.insArrDot} />
      <span className={css.insArrLine} />
      <span className={css.insArrButton}>
        <AddAction tooltip={t('Add key')} onClick={() => setEditing(true)} />
      </span>
    </span>
  );
};
