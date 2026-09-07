import * as React from 'react';
import {context} from './context';
import {ArrayInsert} from '../inserts/ArrayInsert';

export interface JsonArrayInsertProps {
  pointer: string;
  visible?: boolean;
}

export const JsonArrayInsert: React.FC<JsonArrayInsertProps> = ({pointer, visible}) => {
  const {onChange, edit} = React.useContext(context);
  const [openSignal, setOpenSignal] = React.useState(0);

  React.useEffect(() => {
    if (!edit) return;
    return edit.subscribe((p, target) => {
      if (target === 'insert' && p === pointer) setOpenSignal((x) => x + 1);
    });
  }, [edit, pointer]);

  if (!onChange) return null;

  const onSubmit = (value: string) => {
    let newValue: unknown;
    try {
      newValue = JSON.parse(value);
    } catch {
      newValue = String(value);
    }
    onChange([{op: 'add', path: pointer, value: newValue}]);
  };

  return <ArrayInsert visible={visible} openSignal={openSignal} onSubmit={onSubmit} />;
};
