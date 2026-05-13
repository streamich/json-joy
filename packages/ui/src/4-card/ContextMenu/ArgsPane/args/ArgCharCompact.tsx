import * as React from 'react';
import {useT} from 'use-t';
import {rule} from 'nano-theme';
import {ContextItem} from '../../ContextItem';
import {Input} from '../../../../2-inline-block/Input';
import {BasicButton} from '../../../../2-inline-block/BasicButton';
import {Popup} from '../../../Popup';
import {usePopup} from '../../../Popup/context';
import {ClickAway} from '../../../../utils/ClickAway';
import {useStyles} from '../../../../styles/context';
import EmojiPicker, {
  Theme as EmojiPickerTheme,
  SkinTonePickerLocation,
  type EmojiClickData,
} from 'emoji-picker-react';
import {OptionalBadge} from './OptionalBadge';
import type {ArgCharProps} from './ArgChar';

const stopPointer = (e: React.SyntheticEvent): void => {
  e.stopPropagation();
};

const preventPopupMouseDown = (e: React.MouseEvent): void => {
  e.preventDefault();
  e.stopPropagation();
};

const buttonInnerClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  fz: '17px',
  lh: 1,
  minW: '20px',
});

const takeLastCodePoints = (text: string, n: number): string => {
  if (!text || n <= 0) return '';
  const points = Array.from(text);
  return points.slice(-n).join('');
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
      onMouseDown={stopPointer}
      onMouseUp={stopPointer}
      onClick={stopPointer}
      onClickAway={handleClickAway}
    >
      <EmojiPicker
        theme={light ? EmojiPickerTheme.LIGHT : EmojiPickerTheme.DARK}
        height={420}
        width={400}
        skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
        onEmojiClick={(data: EmojiClickData) => {
          onSelect(data.emoji);
          popup?.close();
        }}
      />
    </ClickAway>
  );
};

export const ArgCharCompact: React.FC<ArgCharProps> = ({param, value, onChange, focus}) => {
  const [t] = useT();
  const styles = useStyles();
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');
  const emojiOnly = param.emoji === 'only';
  const emojiEnabled = !!param.emoji;
  const showInput = !emojiOnly;
  const showButton = emojiEnabled;
  const maxLen = param.length ?? (emojiEnabled ? 2 : 1);

  const handleTextChange = React.useCallback(
    (text: string) => {
      onChange(takeLastCodePoints(text, maxLen));
    },
    [maxLen, onChange],
  );

  const handlePick = React.useCallback((picked: string) => onChange(picked), [onChange]);

  const handleFocus = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const input = event.target;
    requestAnimationFrame(() => {
      try {
        input.select();
      } catch {}
    });
  }, []);

  const renderEmojiPicker = React.useCallback(
    () => <EmojiPickerInner light={!!styles.light} onSelect={handlePick} />,
    [handlePick, styles.light],
  );

  const inputWidth = showButton
    ? Math.max(44, 32 + maxLen * 10)
    : Math.max(56, 44 + maxLen * 10);
  const inputEl = showInput && (
    <span style={{width: inputWidth}}>
      <Input
        size={-3}
        type="text"
        value={value}
        placeholder={param.placeholder ?? ''}
        focus={focus}
        align="center"
        onChange={handleTextChange}
        onFocus={handleFocus}
      />
    </span>
  );

  const buttonEl = showButton && (
    <Popup renderContext={renderEmojiPicker}>
      <BasicButton
        type="button"
        fill
        width={36}
        height={28}
        rounder
        onMouseDown={preventPopupMouseDown}
      >
        <span className={buttonInnerClass}>{value || param.placeholder || '🙂'}</span>
      </BasicButton>
    </Popup>
  );

  const right = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: showInput && showButton ? 4 : 0,
        margin: '-5px -8px -5px 0',
      }}
    >
      {inputEl}
      {buttonEl}
    </span>
  );

  return (
    <ContextItem icon={param.icon?.()} control inset right={right}>
      <span>
        {label}
        {param.optional && <OptionalBadge />}
      </span>
    </ContextItem>
  );
};
