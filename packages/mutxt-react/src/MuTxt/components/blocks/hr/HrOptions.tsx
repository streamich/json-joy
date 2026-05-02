import * as React from 'react';
import {rule} from 'nano-theme';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {Slider} from '@jsonjoy.com/ui/lib/2-inline-block/Slider';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {FormRow} from '@jsonjoy.com/ui/lib/3-list-item/FormRow';
import {Tabs} from '@jsonjoy.com/ui/lib/3-list-item/Tabs';
import {HrLine} from './HrLine';
import {useHrOptionsState} from './state';
import * as settings from './settings';
import type {HrLineStyle} from '../../../types';
import {useT} from 'use-t';

const PREVIEW_WIDTH = 24;

const blockClass = rule({
  bxz: 'border-box',
  d: 'flex',
  fld: 'column',
  gap: '12px',
  maxW: '500px',
});

const previewWrapClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  w: PREVIEW_WIDTH + 'px',
});

const STYLE_LABELS: Record<HrLineStyle, string> = {
  solid: 'Line',
  dashed: 'Dashed',
  dotted: 'Dotted',
  squiggly: 'Squiggly',
};

const stopInputKeyDown = (event: React.KeyboardEvent): void => {
  event.stopPropagation();
};

const renderStylePreview = (style: HrLineStyle): React.ReactNode => (
  <span className={previewWrapClass} aria-hidden="true">
    <HrLine strokeWidth={2} style={style} />
  </span>
);

const styleTabs = settings.HR_LINE_STYLES.map((style) => ({
  key: style,
  label: (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
      {renderStylePreview(style)}
      <span style={{fontSize: 12}}>{STYLE_LABELS[style]}</span>
    </span>
  ),
}));

export const HrOptions: React.FC = () => {
  const [t] = useT();
  const state = useHrOptionsState();
  const strokeWidth = state.strokeWidth.use();
  const lineWidth = state.lineWidth.use();
  const lineStyle = state.lineStyle.use();
  const blockHeight = state.blockHeight.use();
  const caption = state.caption.use();

  const handleStyleChange = React.useCallback((key: string) => state.setLineStyle(key as HrLineStyle), [state]);

  return (
    <div className={blockClass}>
      <Input
        type="text"
        value={caption}
        label={t('Caption (optional)')}
        placeholder={t('Between the lines')}
        onChange={state.setCaption}
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

      <FormRow title={t('Line style')} descriptionAbove description={t('Choose how the line is drawn.')}>
        <Tabs items={styleTabs} active={lineStyle} onChange={handleStyleChange} />
      </FormRow>

      <Separator />

      <FormRow title={t('Line stroke')} descriptionAbove description={t('Thickness of the line in pixels.')}>
        <Slider
          value={strokeWidth}
          min={settings.HR_STROKE_WIDTH_MIN}
          max={settings.HR_STROKE_WIDTH_MAX}
          step={1}
          showValue
          onChange={state.setStrokeWidth}
        />
      </FormRow>

      <Separator />

      <FormRow
        title={t('Line width')}
        descriptionAbove
        description={t('Horizontal extent of the line as a percentage.')}
      >
        <Slider
          value={lineWidth}
          min={settings.HR_LINE_WIDTH_MIN}
          max={settings.HR_LINE_WIDTH_MAX}
          step={1}
          showValue
          onChange={state.setLineWidth}
        />
      </FormRow>

      <Separator />

      <FormRow title={t('Block height')} descriptionAbove description={t('Vertical space taken by the separator.')}>
        <Slider
          value={blockHeight}
          min={settings.HR_BLOCK_HEIGHT_MIN}
          max={settings.HR_BLOCK_HEIGHT_MAX}
          step={1}
          showValue
          onChange={state.setBlockHeight}
        />
      </FormRow>
    </div>
  );
};
