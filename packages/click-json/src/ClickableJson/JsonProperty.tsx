import * as React from 'react';
import {useTheme} from 'nano-theme';
import {escapeComponent, unescapeComponent} from '@jsonjoy.com/json-pointer';
import * as css from '../css';
import {FlexibleInput} from 'flexible-input';
import {useStyles} from '../context/style';
import type {OnChange} from './types';

export interface JsonPropertyProps {
  pointer: string;
  onChange?: OnChange;
}

export const JsonProperty: React.FC<JsonPropertyProps> = ({pointer, onChange}) => {
  const {formal} = useStyles();
  const steps = React.useMemo(() => pointer.split('/'), [pointer]);
  const property = React.useMemo(() => unescapeComponent(steps[steps.length - 1]), [steps]);
  const [proposed, setProposed] = React.useState(property);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);
  const theme = useTheme();

  const style: React.CSSProperties = {
    color: theme.g(0.1),
  };

  if (focused) {
    style.background = theme.bg;
    style.border = `1px solid ${theme.g(0.9)}`;
    style.fontWeight = 'bold';
    style.margin = '-3px';
    style.padding = '2px';
  }

  if (!property || property.indexOf(' ') !== -1) {
    style.background = theme.blue(0.1);
  }

  const onSubmit = (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    if (onChange)
      onChange([
        {op: 'move', from: pointer, path: steps.slice(0, steps.length - 1).join('/') + '/' + escapeComponent(proposed)},
      ]);
  };

  return (
    <>
      {!onChange ? (
        <span className={css.property} style={style}>
          {formal ? JSON.stringify(property) : property}
        </span>
      ) : (
        <span className={css.property + css.input} style={style}>
          <FlexibleInput
            inp={(el) => ((inputRef as any).current = el)}
            value={focused ? proposed : property}
            onChange={(e) => setProposed(e.target.value)}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              const input = e.target;
              const value = input.value;
              const length = value.length;
              if (length && length < 6) {
                setTimeout(() => {
                  input.setSelectionRange(0, length, 'forward');
                }, 155);
              }
              setFocused(true);
            }}
            onBlur={() => {
              setFocused(false);
            }}
            onSubmit={(e) => {
              if (inputRef.current) {
                inputRef.current.blur();
                setFocused(false);
              }
              onSubmit(e);
            }}
            onCancel={() => {
              if (inputRef.current) {
                inputRef.current.blur();
                setFocused(false);
              }
            }}
          />
        </span>
      )}
      <span className={css.colon} style={{color: theme.g(0.5)}}>
        <span>:</span>
      </span>
    </>
  );
};
