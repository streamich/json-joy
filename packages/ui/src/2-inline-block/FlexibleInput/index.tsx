import {rule, useTheme} from 'nano-theme';
import * as React from 'react';
import {copyStyles} from './util';

const blockClass = rule({
  d: 'inline-block',
  pos: 'relative',
});

const inputClass = rule({
  d: 'inline-block',
  va: 'bottom',
  bxz: 'border-box',
  ov: 'hidden',
  pd: 0,
  mr: 0,
  bd: 0,
  bg: 0,
  out: 0,
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
  pe: 'none',
  us: 'none',
  bxz: 'border-box',
  bd: 0,
  t: 0,
  l: 0,
  ws: 'pre',
});

export interface FlexibleInputProps {
  /** Ref to the input element. */
  inp?: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;

  /** Value to display, when used as a controlled component. */
  value?: string;

  /**
   * Initial value to display, when used as an uncontrolled component (used
   * together with {@link FlexibleInputProps.uncontrolled}).
   */
  defaultValue?: string;

  /**
   * Whether the value is *not* controlled by React. When `true`, the `value`
   * prop is ignored and the underlying element manages its own value — this is
   * the mode to use when the value is driven externally, for example by a
   * `<CollaborativeInput>` CRDT binding. Use the imperative {@link
   * FlexibleInputHandle.resize} method to re-measure after such external
   * changes.
   */
  uncontrolled?: boolean;

  /** Whether the input is multiline. */
  multiline?: boolean;

  /** Whether to wrap text to a new line when it exceeds the available width. */
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

  /** Callback for when the value changes. */
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

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

/** Imperative API exposed through a `ref` to {@link FlexibleInput}. */
export interface FlexibleInputHandle {
  /** The underlying `<input>` or `<textarea>` element. */
  readonly input: HTMLInputElement | HTMLTextAreaElement | null;

  /**
   * Re-measure the element against its current value and resize it. Call this
   * after the value has been changed externally (i.e. not through user input),
   * for example when the value is driven by a CRDT binding.
   */
  resize: () => void;

  /** Focus the input element. */
  focus: () => void;
}

export const FlexibleInput = React.forwardRef<FlexibleInputHandle, FlexibleInputProps>((props, ref) => {
  const {
    inp,
    value,
    defaultValue,
    uncontrolled,
    multiline,
    wrap,
    fullWidth,
    typebefore = '',
    typeahead = '',
    extraWidth,
    minWidth = 8,
    maxWidth,
    focus,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onSubmit,
    onCancel,
    onTab,
  } = props;
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const sizerRef = React.useRef<HTMLSpanElement>(null);
  const sizerValueRef = React.useRef<HTMLSpanElement>(null);
  const theme = useTheme();

  const resize = React.useCallback(() => {
    const input = inputRef.current;
    const sizer = sizerRef.current;
    if (!input || !sizer) return;
    // Mirror the element's *actual* value into the sizer, so that resizing
    // works regardless of whether the value is controlled by React or driven
    // externally.
    const sizerValue = sizerValueRef.current;
    if (sizerValue) sizerValue.textContent = input.value;
    const style = input.style;
    if (fullWidth) {
      style.width = '100%';
    } else {
      let width = sizer.scrollWidth;
      if (extraWidth) width += extraWidth;
      if (minWidth) width = Math.max(width, minWidth);
      if (maxWidth) width = Math.min(width, maxWidth);
      style.width = width + 'px';
    }
    if (multiline) style.height = sizer.scrollHeight + 'px';
  }, [fullWidth, extraWidth, minWidth, maxWidth, multiline]);

  const focusFn = React.useCallback(() => inputRef.current?.focus(), []);

  React.useImperativeHandle(
    ref,
    () => ({
      get input() {
        return inputRef.current;
      },
      resize,
      focus: focusFn,
    }),
    [resize, focusFn],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  React.useLayoutEffect(() => {
    const input = inputRef.current;
    const sizer = sizerRef.current;
    if (!input || !sizer) return;
    if (focus) input.focus();
    copyStyles(input, sizer, [
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when the rendered text/layout changes
  React.useLayoutEffect(() => {
    resize();
  }, [resize, value, typeahead, wrap]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    resize();
    if (onChange) onChange(e);
  };

  const attr: React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & {ref: React.RefCallback<any>} = {
    ref: (el) => {
      inputRef.current = el;
      if (inp) inp(el);
    },
    className: inputClass,
    style: {
      width: fullWidth ? '100%' : undefined,
      display: fullWidth ? 'block' : 'inline-block',
      whiteSpace: wrap ? 'pre-wrap' : 'pre',
    },
    onChange: handleChange,
    onFocus,
    onBlur,
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (!multiline || e.ctrlKey)) {
        if (onSubmit) onSubmit(e);
      } else if (e.key === 'Escape') {
        if (onCancel) onCancel(e);
      } else if (e.key === 'Tab') {
        if (onTab) onTab(e);
      }
      if (onKeyDown) onKeyDown(e);
    },
  };

  const elementValue = uncontrolled ? undefined : value;
  const input = multiline ? (
    <textarea {...attr} value={elementValue} defaultValue={uncontrolled ? defaultValue : undefined} />
  ) : (
    <input {...attr} value={elementValue} defaultValue={uncontrolled ? defaultValue : undefined} />
  );

  return (
    <>
      {!!typebefore && !fullWidth && <span style={{color: theme.g(0.7), verticalAlign: 'top'}}>{typebefore}</span>}
      <span className={blockClass} style={fullWidth ? {display: 'block', width: '100%', overflowX: 'auto'} : undefined}>
        {input}
        <span
          ref={sizerRef}
          className={sizerClass}
          style={{width: fullWidth ? '100%' : undefined, whiteSpace: wrap ? 'pre-wrap' : 'pre'}}
        >
          {/* Content is filled imperatively in `resize()` from the live element value. */}
          <span ref={sizerValueRef} style={{visibility: 'hidden'}} />
          {'\u200b'}
          {!!typeahead && <span style={{color: theme.g(0.7)}}>{typeahead}</span>}
        </span>
      </span>
    </>
  );
});

FlexibleInput.displayName = 'FlexibleInput';
