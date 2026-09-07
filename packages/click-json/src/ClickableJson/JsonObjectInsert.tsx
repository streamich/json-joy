import * as React from 'react';
import {escapeComponent} from '@jsonjoy.com/json-pointer';
import {context} from './context';
import {ObjectInsert} from '../inserts/ObjectInsert';

export interface JsonObjectInsertProps {
  pointer: string;
  visible?: boolean;
}

export const JsonObjectInsert: React.FC<JsonObjectInsertProps> = ({pointer, visible}) => {
  const {onChange, edit} = React.useContext(context);
  const [openSignal, setOpenSignal] = React.useState(0);

  React.useEffect(() => {
    if (!edit) return;
    return edit.subscribe((p, target) => {
      if (target === 'insert' && p === pointer) setOpenSignal((x) => x + 1);
    });
  }, [edit, pointer]);

  if (!onChange) return null;

  const onSubmit = (property: string, value: string) => {
    let newValue: unknown;
    try {
      newValue = JSON.parse(value);
    } catch {
      newValue = String(value);
    }
    onChange([{op: 'add', path: pointer + '/' + escapeComponent(property), value: newValue}]);
  };

  return <ObjectInsert visible={visible} openSignal={openSignal} onSubmit={onSubmit} />;
};
