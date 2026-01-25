import * as React from 'react';
import {useTheme} from 'nano-theme';
import * as css from '../css';
import {inputStyle, typeahead, valueBg, valueColor} from './utils';
import {FlexibleInput} from 'flexible-input';
import {selectOnFocus} from '../utils/selectOnFocus';

export interface ValueInputProps {
  value: unknown;
  onChange?: (value: unknown) => void;
}

export const ValueInput: React.FC<ValueInputProps> = (props) => {
  const {value, onChange} = props;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const json = React.useMemo(
    () =>
      value === null
        ? 'null'
        : typeof value === 'boolean'
          ? value
            ? 'true'
            : 'false'
          : typeof value === 'string'
            ? JSON.stringify(value)
            : String(value),
    [value, theme],
  );
  const [proposed, setProposed] = React.useState(json);
  const [focused, setFocused] = React.useState(false);
  React.useEffect(() => {
    setProposed(json);
  }, [json]);

  const onSubmit = (e: React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    let newValue;
    try {
      newValue = JSON.parse(proposed);
    } catch {
      newValue = String(proposed);
    }
    if (onChange) onChange(newValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    if (input.value === proposed) selectOnFocus(input);
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const handleSubmit = (e: React.KeyboardEvent) => {
    if (inputRef.current) inputRef.current.blur();
    onSubmit(e);
  };

  const handleCancel = () => {
    if (json !== proposed) setProposed(json);
    else if (inputRef.current) inputRef.current.blur();
  };

  const handleTab = (e: React.KeyboardEvent) => {
    const ahead = typeahead(proposed);
    if (ahead) {
      e.preventDefault();
      setProposed(proposed + ahead);
    }
  };

  return (
    <span
      className={css.input}
      style={
        focused
          ? inputStyle(theme, !theme.isLight, proposed)
          : {
              color: valueColor(!theme.isLight, value),
              background: valueBg(value),
            }
      }
    >
      <FlexibleInput
        inp={(el) => ((inputRef as any).current = el)}
        value={focused ? proposed : json}
        typeahead={focused ? typeahead(proposed) : ''}
        onChange={(e) => setProposed(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onTab={handleTab}
      />
    </span>
  );
};
