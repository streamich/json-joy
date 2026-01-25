import * as React from 'react';
import {useTheme} from 'nano-theme';
import {FlexibleInput} from 'flexible-input';
import * as css from '../css';
import {inputStyle, typeahead} from '../ClickableJson/utils';
import {CrdtTypeSwitch} from '../buttons/CrdtTypeSwitch';
import {selectOnFocus} from '../utils/selectOnFocus';

export interface ValueInputProps {
  inp?: (el: HTMLInputElement | null) => void;
  focus?: boolean;
  initialValue?: string;
  visible?: boolean;
  types?: string[];
  initialType?: string;
  withType?: boolean;
  onSubmit: (value: string, type: string) => void;
  onCancel?: React.KeyboardEventHandler<HTMLInputElement>;
}

export const ValueInput: React.FC<ValueInputProps> = ({
  inp,
  focus,
  initialValue = '',
  visible,
  types = ['any', 'con', 'val', 'vec'],
  initialType,
  withType,
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = React.useState(initialValue);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const type = React.useRef<string>(initialType ?? (types && types.length ? types[0] : ''));

  const handleSubmit = () => {
    if (inputRef.current) inputRef.current.blur();
    setValue('');
    onSubmit(value, type.current);
  };

  const style = inputStyle(theme, !theme.isLight, value);
  style.display = visible ? undefined : 'none';
  style.margin = '-1px 0 -1px -2px';
  style.padding = '3px 4px 3px 5px';
  style.border = `1px solid ${theme.g(0.85)}`;

  let afterValue: React.ReactNode = null;

  if (types && types.length && withType) {
    afterValue = (
      <CrdtTypeSwitch
        type={type}
        onSubmit={handleSubmit}
        onClick={() => {
          if (inputRef.current) inputRef.current.focus();
        }}
      />
    );
  }

  return (
    <span className={css.input} style={style}>
      <FlexibleInput
        focus={focus}
        inp={(el) => {
          (inputRef as any).current = el;
          if (inp) inp(el as any);
        }}
        value={value}
        typeahead={typeahead(value)}
        onChange={(e) => setValue(e.target.value)}
        onSubmit={handleSubmit}
        onFocus={(e) => selectOnFocus(e.target)}
        onCancel={(e) => {
          setValue('');
          if (onCancel) onCancel(e as any);
        }}
        onTab={(e) => {
          const ahead = typeahead(value);
          if (ahead) {
            e.preventDefault();
            setValue(value + ahead);
          }
        }}
      />
      {afterValue}
    </span>
  );
};
