import EmojiPicker, {type EmojiClickData, Theme as EmojiPickerTheme, SkinTonePickerLocation} from 'emoji-picker-react';
import {rule} from 'nano-theme';
import * as React from 'react';
import {useT} from 'use-t';
import {BasicButton} from '../../../2-inline-block/BasicButton';
import {Input} from '../../../2-inline-block/Input';
import {useSpacingTrace} from '../../../context/traces';
import {useStyles} from '../../../styles/context';
import {ClickAway} from '../../../utils/ClickAway';
import {Popup} from '../../Popup';
import {usePopup} from '../../Popup/context';
import type {ParamChar} from '../../StructuralMenu/types';
import {AutoValue} from './AutoValue';
import {DefaultableToggle} from './DefaultableToggle';

export interface DefaultableCharValue {
  def: boolean;
  value: string;
}

export interface ArgCharProps {
  param: ParamChar;
  value: string | DefaultableCharValue;
  focus?: boolean;
  onChange: (value: string | DefaultableCharValue) => void;
  onEnter?: React.KeyboardEventHandler;
  /** Fill the available width (reveal editor); otherwise a compact fixed box. */
  stretch?: boolean;
}

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

const readStructured = (v: unknown): DefaultableCharValue => {
  if (v && typeof v === 'object' && 'def' in (v as object)) {
    const s = v as DefaultableCharValue;
    return {def: !!s.def, value: String(s.value ?? '')};
  }
  return {def: false, value: typeof v === 'string' ? v : ''};
};

interface EmojiPickerInnerProps {
  light: boolean;
  onSelect: (emoji: string) => void;
}

const EmojiPickerInner: React.FC<EmojiPickerInnerProps> = ({light, onSelect}) => {
  const popup = usePopup();
  const handleClickAway = React.useCallback(() => popup?.close(), [popup]);
  return (
    <ClickAway onMouseDown={stopPointer} onMouseUp={stopPointer} onClick={stopPointer} onClickAway={handleClickAway}>
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

export const ArgChar: React.FC<ArgCharProps> = ({param, value, onChange, onEnter, focus, stretch}) => {
  const [t] = useT();
  const styles = useStyles();
  const size = useSpacingTrace(0.5) >= 0.7 ? -1 : -3;
  const emojiOnly = param.emoji === 'only';
  const emojiEnabled = !!param.emoji;
  const showInput = !emojiOnly;
  const showButton = emojiEnabled;
  const maxLen = param.length ?? (emojiEnabled ? 2 : 1);

  const defaultable = !!param.defaultable;
  const s = readStructured(value);
  const def = defaultable && s.def;

  const emit = (next: DefaultableCharValue) => {
    if (defaultable) onChange?.(next);
    else onChange?.(next.value);
  };
  const setText = (v: string) => emit({def: false, value: v});
  const enterCustom = () => emit({def: false, value: s.value});
  const revertToAuto = () => emit({def: true, value: s.value});

  // biome-ignore lint/correctness/useExhaustiveDependencies: setText/emit closure intentionally pinned by listed deps
  const handleTextChange = React.useCallback(
    (text: string) => {
      setText(takeLastCodePoints(text, maxLen));
    },
    [maxLen, onChange, defaultable, s.value],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: setText/emit closure intentionally pinned by listed deps
  const handlePick = React.useCallback((picked: string) => setText(picked), [onChange, defaultable, s.value]);

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

  const inputWidth = showButton ? Math.max(44, 32 + maxLen * 10) : Math.max(56, 44 + maxLen * 10);

  const customControl = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: showInput && showButton ? 4 : 0,
        margin: '-5px 0',
        width: stretch ? '100%' : undefined,
      }}
    >
      {showInput && (
        <span style={{width: stretch ? undefined : inputWidth, flex: stretch ? 1 : undefined}}>
          <Input
            size={size}
            type="text"
            value={s.value}
            placeholder={param.placeholder ?? ''}
            focus={focus}
            align="center"
            onChange={handleTextChange}
            onFocus={handleFocus}
            onEnter={onEnter}
          />
        </span>
      )}
      {showButton && (
        <Popup renderContext={renderEmojiPicker}>
          <BasicButton type="button" fill width={36} height={28} rounder onMouseDown={preventPopupMouseDown}>
            <span className={buttonInnerClass}>{s.value || param.placeholder || '🙂'}</span>
          </BasicButton>
        </Popup>
      )}
    </span>
  );

  const autoDisplay = (
    <AutoValue onClick={enterCustom}>
      <span style={{fontSize: 13}}>{t('auto')}</span>
    </AutoValue>
  );

  const right = defaultable ? (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, margin: '-5px 0'}}>
      {def ? (
        <>
          <DefaultableToggle def onClick={enterCustom} />
          {autoDisplay}
        </>
      ) : (
        <>
          <DefaultableToggle def={false} onClick={revertToAuto} />
          {customControl}
        </>
      )}
    </span>
  ) : (
    customControl
  );

  return right;
};
