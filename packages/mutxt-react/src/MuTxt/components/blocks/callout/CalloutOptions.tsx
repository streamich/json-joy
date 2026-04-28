import * as React from 'react';
import {rule} from 'nano-theme';
import EmojiPicker, {Theme as EmojiPickerTheme, type EmojiClickData} from 'emoji-picker-react';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {ColorPickerInput} from '@jsonjoy.com/ui/lib/4-card/ColorPicker/ColorPickerInput';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {ClickAway} from '@jsonjoy.com/ui/lib/utils/ClickAway';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {FormRow} from '@jsonjoy.com/ui/lib/3-list-item/FormRow';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';
import {useCalloutOptions} from './context';
import {useT} from 'use-t';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';

const blockClass = rule({
  bxz: 'border-box',
  d: 'flex',
  fld: 'column',
  gap: '12px',
  maxW: '400px',
});

const iconButtonInnerClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  fz: '20px',
  lh: 1,
  minW: '24px',
});

const colorSwatchClass = rule({
  d: 'inline-block',
  w: '14px',
  h: '14px',
  bdrad: '50%',
  border: '1px solid rgba(127,127,127,.4)',
  ml: '8px',
});

const stopInputKeyDown = (event: React.KeyboardEvent): void => {
  event.stopPropagation();
};

const preventPopupMouseDown = (event: React.MouseEvent): void => {
  event.preventDefault();
  event.stopPropagation();
};

const stopPointerPropagation = (event: React.SyntheticEvent): void => {
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
        onEmojiClick={(data: EmojiClickData) => {
          onSelect(data.emoji);
          popup?.close();
        }}
      />
    </ClickAway>
  );
};

export const CalloutOptions: React.FC = () => {
  const [t] = useT();
  const styles = useStyles();
  const state = useCalloutOptions();
  const icon = state.icon.use();
  const title = state.title.use();
  const color = state.color.use();

  const renderEmojiPicker = React.useCallback(
    () => <EmojiPickerInner light={!!styles.light} onSelect={state.setIcon} />,
    [state, styles.light],
  );

  const handleColorChange = React.useCallback(
    (next: HslColor) => {
      state.setColor(next.toRgb().hex());
    },
    [state],
  );

  return (
    <div className={blockClass}>
      <FormRow title={t('Icon')} description={t('Pick an emoji or type any character.')}>
        <Flex style={{gap: 8, alignItems: 'center'}}>
          <Input
            type="text"
            value={icon}
            placeholder={t('🙂 or any character')}
            onChange={(text) => {
              const lastChars = text.slice(-2);
              state.setIcon(lastChars);
            }}
            onKeyDown={stopInputKeyDown}
            onEnter={(event) => {
              event.preventDefault();
              event.stopPropagation();
              state.apply();
            }}
            onEsc={(event) => {
              event.preventDefault();
              event.stopPropagation();
              state.cancel();
            }}
          />
          <Popup renderContext={renderEmojiPicker}>
            <BasicButton type="button" fill width={48} height={36} rounder onMouseDown={preventPopupMouseDown}>
              <span className={iconButtonInnerClass}>{icon || '🙂'}</span>
            </BasicButton>
          </Popup>
        </Flex>
      </FormRow>

      <Separator />

      <Input
        type="text"
        value={title}
        label={t('Title')}
        placeholder={t('Note, Warning, Tip, ...')}
        onChange={state.setTitle}
        onKeyDown={stopInputKeyDown}
        onEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          state.apply();
        }}
        onEsc={(event) => {
          event.preventDefault();
          event.stopPropagation();
          state.cancel();
        }}
      />

      <Separator />

      <FormRow title={t('Accent color')}>
        <ColorPickerInput
          color={color}
          onChange={handleColorChange}
          noAlpha
        />
      </FormRow>
    </div>
  );
};
