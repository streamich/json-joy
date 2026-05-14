import * as React from 'react';
import {rule} from 'nano-theme';
import EmojiPicker, {Theme as EmojiPickerTheme, SkinTonePickerLocation, type EmojiClickData} from 'emoji-picker-react';
import {Input, type InputProps} from '../Input';
import {BasicButton} from '../BasicButton';
import {Popup} from '../../4-card/Popup';
import {usePopup} from '../../4-card/Popup/context';
import {ClickAway} from '../../utils/ClickAway';
import {Flex} from '../../3-list-item/Flex';
import {useStyles} from '../../styles/context';

const buttonInnerClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  fz: '20px',
  lh: 1,
  minW: '24px',
});

const stopPointerPropagation = (event: React.SyntheticEvent): void => {
  event.stopPropagation();
};

const preventPopupMouseDown = (event: React.MouseEvent): void => {
  event.preventDefault();
  event.stopPropagation();
};

interface EmojiPickerInnerProps {
  light: boolean;
  onSelect: (emoji: string) => void;
}

const EmojiPickerInner: React.FC<EmojiPickerInnerProps> = ({light, onSelect}) => {
  const popup = usePopup();
  const handleClickAway = React.useCallback(() => popup?.close(), [popup]);

  return (
    <ClickAway
      onMouseDown={stopPointerPropagation}
      onMouseUp={stopPointerPropagation}
      onClick={stopPointerPropagation}
      onClickAway={handleClickAway}
    >
      <EmojiPicker
        theme={light ? EmojiPickerTheme.LIGHT : EmojiPickerTheme.DARK}
        height={360}
        width={350}
        skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
        onEmojiClick={(data: EmojiClickData) => {
          onSelect(data.emoji);
          popup?.close();
        }}
      />
    </ClickAway>
  );
};

const takeLastCodePoint = (text: string): string => {
  if (!text) return '';
  const points = Array.from(text);
  return points[points.length - 1] ?? '';
};

const takeLastTwoCodePoints = (text: string): string => {
  if (!text) return '';
  const points = Array.from(text);
  return points.slice(-2).join('');
};

export interface InputCharProps extends Omit<InputProps, 'right' | 'type' | 'multiline'> {
  /**
   * Enable an emoji picker button on the right of the input.
   *
   * - `false` / unset: plain single-character input.
   * - `true`: input plus an emoji picker button on the right.
   * - `"only"`: hides the input — only the emoji picker button is rendered.
   */
  emoji?: boolean | 'only';
  /** Placeholder shown inside the emoji button when no value is set. */
  emojiPlaceholder?: string;
}

export const InputChar: React.FC<InputCharProps> = (props) => {
  const {emoji, emojiPlaceholder = '🙂', value = '', onChange, onFocus, disabled, readOnly, ...rest} = props;
  const styles = useStyles();

  const handleFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const input = event.target;
      requestAnimationFrame(() => {
        try {
          input.select();
        } catch {}
      });
      onFocus?.(event);
    },
    [onFocus],
  );

  const emojiOnly = emoji === 'only';
  const emojiEnabled = !!emoji;
  const locked = !!disabled || !!readOnly;

  const handleChange = React.useCallback(
    (text: string) => {
      const next = emojiEnabled ? takeLastTwoCodePoints(text) : takeLastCodePoint(text);
      onChange?.(next);
    },
    [emojiEnabled, onChange],
  );

  const handlePick = React.useCallback(
    (picked: string) => {
      onChange?.(picked);
    },
    [onChange],
  );

  const renderEmojiPicker = React.useCallback(
    () => <EmojiPickerInner light={!!styles.light} onSelect={handlePick} />,
    [handlePick, styles.light],
  );

  let button: React.ReactNode = null;
  if (emojiEnabled) {
    const buttonEl = (
      <BasicButton
        type="button"
        fill
        width={48}
        height={36}
        rounder
        disabled={locked}
        onMouseDown={locked ? undefined : preventPopupMouseDown}
      >
        <span className={buttonInnerClass}>{value || emojiPlaceholder}</span>
      </BasicButton>
    );
    button = locked ? buttonEl : <Popup renderContext={renderEmojiPicker}>{buttonEl}</Popup>;
  }

  if (emojiOnly) {
    return <span style={{display: 'inline-flex', alignItems: 'center'}}>{button}</span>;
  }

  return (
    <Flex style={{gap: 8, alignItems: 'center'}}>
      <Input
        {...rest}
        type="text"
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        onChange={handleChange}
        onFocus={handleFocus}
      />
      {button}
    </Flex>
  );
};
