import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {copyStyles} from './util';
import {bind} from 'collaborative-input';
import type {CollaborativeStr} from 'collaborative-editor';

const blockClass = rule({
  d: 'inline-block',
  pos: 'relative',
  w: '100%',
});

const inputClass = rule({
  d: 'inline-block',
  va: 'bottom',
  bxz: 'border-box',
  ov: 'hidden',
  pd: 0,
  mr: 0,
  bg: 0,
  out: 0,
  bd: 0,
  col: 'inherit',
  fw: 'inherit',
  f: 'inherit',
  lh: 'inherit',
  ws: 'pre',
  resize: 'none',
});

const sizerClass = rule({
  d: 'inline-block',
  pos: 'absolute',
  // ov: 'hidden',
  pe: 'none',
  us: 'none',
  bxz: 'border-box',
  t: 0,
  l: 0,
  bd: 0,
  ws: 'pre',
});

export interface CollaborativeFlexibleInputProps {
  /** JSON CRDT "str" node API. */
  str: () => CollaborativeStr;

  /**
   * Whether to poll for updates the underlying <input> or <textarea> element
   * in case some third-party code modifies the value of the input element.
   */
  polling?: boolean;

  /** Ref to the input element. */
  inp?: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;

  /** Whether the input is multiline. */
  multiline?: boolean;

  /** Whether to wrap text to a new line when it exceeds the length of current. */
  wrap?: boolean;

  /**
   * Whether the input should take the full width of the parent, even when there
   * is not enough text to do that naturally with content.
   */
  fullWidth?: boolean;

  /** Placeholder to display. */
  typebefore?: string;

  /** Typeahead string to add to the value. It is visible at half opacity. */
  typeahead?: string;

  /** Addition width to add, for example, to account for number stepper. */
  extraWidth?: number;

  /** Minimum width to allow. */
  minWidth?: number;

  /** Maximum width to allow. */
  maxWidth?: number;

  /** Whether the input is focused on initial render. */
  focus?: boolean;

  /** Callback for when the input is focused. */
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;

  /** Callback for when the input is blurred. */
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;

  /** Callback for when a key is pressed. */
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;

  /** Callback for when the Enter key is pressed. */
  onSubmit?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;

  /** Callback for when the Escape key is pressed. */
  onCancel?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;

  /** Callback for when the Tab key is pressed. */
  onTab?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export const CollaborativeFlexibleInput: React.FC<CollaborativeFlexibleInputProps> = ({
  str,
  polling,
  inp,
  multiline,
  wrap,
  fullWidth,
  typebefore = '',
  typeahead = '',
  extraWidth,
  minWidth = 8,
  maxWidth,
  focus,
  onFocus,
  onBlur,
  onKeyDown,
  onSubmit,
  onCancel,
  onTab,
}) => {
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const sizerRef = React.useRef<HTMLSpanElement>(null);
  const sizerValueRef = React.useRef<HTMLSpanElement>(null);
  const theme = useTheme();

  // biome-ignore lint: manual dependency list
  React.useLayoutEffect(() => {
    if (!inputRef.current || !sizerRef.current) return;
    if (focus) inputRef.current.focus();
    copyStyles(inputRef.current, sizerRef.current!, [
      'font',
      'fontSize',
      'fontFamily',
      'fontWeight',
      'fontStyle',
      'letterSpacing',
      'textTransform',
      'boxSizing',
    ]);
  }, []);

  // biome-ignore lint: manual dependency list
  React.useLayoutEffect(() => {
    const node = str();
    if (!node) return;
    const sync = () => {
      const sizerValue = sizerValueRef.current;
      if (sizerValue) sizerValue.textContent = node.view();
      const input = inputRef.current;
      const sizer = sizerRef.current;
      if (!input || !sizer) return;
      let width = sizer.scrollWidth;
      if (extraWidth) width += extraWidth;
      if (minWidth) width = Math.max(width, minWidth);
      if (maxWidth) width = Math.min(width, maxWidth);
      const style = input.style;
      style.width = width + 'px';
      if (multiline) {
        const height = sizer.scrollHeight;
        style.height = height + 'px';
      }
    };
    return sync(), node.api.onChange.listen(sync);
  }, [str]);

  React.useEffect(() => {
    const input = inputRef.current;
    if (!input || !str) return;
    const unbind = bind(str, input, !!polling);
    return () => {
      unbind();
    };
  }, [str, polling]);

  const attr: React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & {ref: any} = {
    ref: (input: unknown) => {
      (inputRef as any).current = input;
      if (inp) inp(input as HTMLInputElement | HTMLTextAreaElement);
    },
    className: inputClass,
    style: {
      width: fullWidth ? '100%' : undefined,
      whiteSpace: wrap ? 'pre-wrap' : 'pre',
      display: fullWidth ? 'block' : 'inline-block',
    },
    onFocus,
    onBlur,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (!multiline || e.ctrlKey)) {
        if (onSubmit) onSubmit(e as any);
      } else if (e.key === 'Escape') {
        if (onCancel) onCancel(e as any);
      } else if (e.key === 'Tab') {
        if (onTab) onTab(e as any);
      }
      if (onKeyDown) onKeyDown(e as any);
    },
  };

  const input = multiline ? <textarea {...attr} /> : <input {...attr} />;

  const style: React.CSSProperties = {
    display: fullWidth ? 'block' : 'inline-block',
    width: fullWidth ? '100%' : undefined,
    overflowX: fullWidth ? 'auto' : undefined,
    whiteSpace: wrap ? 'pre-wrap' : 'pre',
  };

  return (
    <>
      {!!typebefore && !fullWidth && <span style={{color: theme.g(0.7), verticalAlign: 'top'}}>{typebefore}</span>}
      <span className={blockClass} style={style}>
        {input}
        <span
          ref={sizerRef}
          className={sizerClass}
          style={{width: fullWidth ? '100%' : undefined, whiteSpace: wrap ? 'pre-wrap' : 'pre'}}
        >
          <span ref={sizerValueRef} style={{visibility: 'hidden'}} />
          {'\u200b'}
          {!!typeahead && <span style={{color: theme.g(0.7)}}>{typeahead}</span>}
        </span>
      </span>
    </>
  );
};
