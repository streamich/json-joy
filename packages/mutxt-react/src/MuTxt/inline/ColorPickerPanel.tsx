import * as React from 'react';
import {rule} from 'nano-theme';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {ContextPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {ColorSwatch} from '@jsonjoy.com/ui/lib/2-inline-block/ColorSwatch';
import {ColorPicker} from '@jsonjoy.com/ui/lib/4-card/ColorPicker';
import {InputColor} from '@jsonjoy.com/ui/lib/2-inline-block/InputColor';
import {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {Tabs} from '@jsonjoy.com/ui/lib/3-list-item/Tabs';
import {
  QUICK_PALETTE,
  QUICK_PALETTE_COLS,
  RECOMMEND_PALETTE,
  TEXT_PALETTE,
  isValidColor,
  normalizeHex,
} from '../util/palette';
import {collectDocumentColors, getActiveBg, getActiveFg, setBg, setFg} from '../behavior/color';
import {FONT_FAMILIES} from '../behavior/font';
import type {MuTxtState} from '../state/MuTxtState';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {useT} from 'use-t';

const PANEL_WIDTH = 410;

const containerClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '14px',
  pd: '12px',
  w: PANEL_WIDTH + 'px',
});

const tabsCenterClass = rule({
  d: 'flex',
  jc: 'center',
  pd: '12px 0 0',
});

const tabsInlineClass = rule({
  d: 'inline-block',
});

const sectionClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '12px',
});

const sectionLabelClass = rule({
  fz: '11px',
  fw: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});

const gridClass = rule({
  d: 'grid',
  gap: '6px',
});

const pickerSectionClass = rule({
  d: 'flex',
  ai: 'stretch',
  gap: '12px',
});

const previewBoxClass = rule({
  d: 'flex',
  fld: 'column',
  ai: 'center',
  jc: 'center',
  gap: '8px',
  bdrad: '8px',
  pd: '12px',
  flex: 1,
  minW: 0,
  minH: '128px',
  fz: '14px',
  fw: 500,
  textAlign: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

const actionRowClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '8px',
});

const actionInputClass = rule({
  flex: 1,
  minW: 0,
});

const tabContentClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '14px',
});

export interface ColorPickerPanelProps {
  mutxt: MuTxtState;
  /** Which mark the menu item primarily targets. */
  kind: 'fg' | 'bg';
}

export const ColorPickerPanel: React.FC<ColorPickerPanelProps> = ({mutxt, kind}) => {
  const [t] = useT();
  const popup = usePopup();
  const styles = useStyles();
  mutxt.version.use();
  const recent = mutxt.inline.recentColors.use();
  const editorFont = mutxt.font.use();
  const editorFontFamily = FONT_FAMILIES[editorFont];

  React.useEffect(() => {
    mutxt.inline.setPopupOpen(true);
    return () => mutxt.inline.setPopupOpen(false);
  }, [mutxt]);

  const activeFg = getActiveFg(mutxt.editor);
  const activeBg = getActiveBg(mutxt.editor);
  const activeForKind = kind === 'fg' ? activeFg : activeBg;

  const [tab, setTab] = React.useState<'presets' | 'custom'>('presets');
  const initial = activeForKind || (kind === 'fg' ? '#1A1A1A' : '#FFFFFF');
  const [pickerColor, setPickerColor] = React.useState<HslColor>(HslColor.from(initial) ?? new HslColor(0, 0, 0));
  const [pickerInput, setPickerInput] = React.useState<string>(
    normalizeHex(HslColor.from(initial)?.toRgb().hex() || initial),
  );

  const docColors = React.useMemo(
    () => collectDocumentColors(mutxt.editor, kind, 10),
    // biome-ignore lint/correctness/useExhaustiveDependencies: re-scan on version change
    [mutxt.editor, kind, mutxt.version.use()],
  );

  const closePopup = () => popup?.close();

  const applyFg = (color: string | undefined) => {
    setFg(mutxt.editor, color);
    if (color) mutxt.inline.pushRecentColor(color);
    mutxt.sync(false);
  };
  const applyBg = (color: string | undefined) => {
    setBg(mutxt.editor, color);
    if (color) mutxt.inline.pushRecentColor(color);
    mutxt.sync(false);
  };
  const applyCombo = (combo: {fg: string; bg: string}) => {
    setFg(mutxt.editor, combo.fg);
    setBg(mutxt.editor, combo.bg);
    mutxt.inline.pushRecentColor(combo.fg);
    mutxt.inline.pushRecentColor(combo.bg);
    mutxt.sync(false);
  };

  const onTextSwatch = (c: string) => {
    applyFg(c);
    closePopup();
  };
  const onBgSwatch = (c: string) => {
    applyBg(c);
    closePopup();
  };
  const onComboSwatch = (combo: {fg: string; bg: string}) => {
    applyCombo(combo);
    closePopup();
  };

  const onPickerChange = (color: HslColor) => {
    setPickerColor(color);
    setPickerInput(normalizeHex(color.toRgb().hex()));
  };
  const onPickerInputChange = (value: string) => {
    setPickerInput(value);
    if (isValidColor(value)) {
      const c = HslColor.from(value);
      if (c) setPickerColor(c);
    }
  };
  const onPickerCommit = () => {
    if (!isValidColor(pickerInput)) return;
    const hex = normalizeHex(pickerInput);
    if (kind === 'fg') applyFg(hex);
    else applyBg(hex);
    closePopup();
  };

  const previewBg = kind === 'bg' ? pickerColor.toString() : styles.g(0, 0.04);
  const previewFg = kind === 'fg' ? pickerColor.toString() : styles.g(0.15);

  const preventMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT') e.preventDefault();
  };

  const presetsContent = (
    <div className={tabContentClass}>
      {kind === 'fg' ? (
        <div className={sectionClass}>
          <MiniTitle>{t('Text')}</MiniTitle>
          <div
            className={gridClass}
            style={{gridTemplateColumns: `repeat(${QUICK_PALETTE_COLS}, 32px)`, justifyContent: 'space-between'}}
          >
            {TEXT_PALETTE.map((c) => (
              <ColorSwatch
                key={'text-' + c}
                kind="fg"
                color={c}
                active={activeFg === c}
                tooltip={{renderTooltip: () => c}}
                onClick={() => onTextSwatch(c)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {kind === 'bg' ? (
        <div className={sectionClass}>
          <MiniTitle>{t('Background')}</MiniTitle>
          <div
            className={gridClass}
            style={{gridTemplateColumns: `repeat(${QUICK_PALETTE_COLS}, 32px)`, justifyContent: 'space-between'}}
          >
            {QUICK_PALETTE.map((c) => (
              <ColorSwatch
                key={'bg-' + c}
                kind="bg"
                color={c}
                active={activeBg === c}
                tooltip={{renderTooltip: () => c}}
                onClick={() => onBgSwatch(c)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className={sectionClass}>
        <MiniTitle>{t('Combination')}</MiniTitle>
        <div
          className={gridClass}
          style={{gridTemplateColumns: `repeat(${QUICK_PALETTE_COLS}, 32px)`, justifyContent: 'space-between'}}
        >
          {RECOMMEND_PALETTE.map((combo, idx) => (
            <ColorSwatch
              key={'rec-' + idx}
              kind="fgbg"
              color={combo.bg}
              textColor={combo.fg}
              active={activeFg === combo.fg && activeBg === combo.bg}
              tooltip={{renderTooltip: () => `Text ${combo.fg} on ${combo.bg}`}}
              onClick={() => onComboSwatch(combo)}
            />
          ))}
        </div>
      </div>

      {recent.length > 0 || docColors.length > 0 ? (
        <div className={sectionClass}>
          {recent.length > 0 ? (
            <>
              <MiniTitle>{t('Recent')}</MiniTitle>
              <div
                className={gridClass}
                style={{gridTemplateColumns: `repeat(${QUICK_PALETTE_COLS}, 32px)`, justifyContent: 'space-between'}}
              >
                {recent.map((c) => (
                  <ColorSwatch
                    key={'recent-' + c}
                    kind={kind === 'fg' ? 'fg' : 'bg'}
                    color={c}
                    active={activeForKind === c}
                    tooltip={{renderTooltip: () => c}}
                    onClick={() => (kind === 'fg' ? onTextSwatch(c) : onBgSwatch(c))}
                  />
                ))}
              </div>
            </>
          ) : null}
          {docColors.length > 0 ? (
            <>
              <MiniTitle>{t('In document')}</MiniTitle>
              <div
                className={gridClass}
                style={{gridTemplateColumns: `repeat(${QUICK_PALETTE_COLS}, 32px)`, justifyContent: 'space-between'}}
              >
                {docColors.map((c) => (
                  <ColorSwatch
                    key={'doc-' + c}
                    kind={kind === 'fg' ? 'fg' : 'bg'}
                    color={c}
                    active={activeForKind === c}
                    tooltip={{renderTooltip: () => c}}
                    onClick={() => (kind === 'fg' ? onTextSwatch(c) : onBgSwatch(c))}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const customContent = (
    <div className={tabContentClass}>
      <MiniTitle>{t('Pick a color')}</MiniTitle>
      <div className={pickerSectionClass}>
        <ColorPicker color={pickerColor} onChange={onPickerChange} noAlpha style={{width: 200}} />
        <div
          className={previewBoxClass}
          style={{
            background: previewBg,
            color: previewFg,
            border: `1px solid ${styles.g(0, 0.12)}`,
            fontFamily: editorFontFamily,
          }}
        >
          <div style={{fontSize: '42px', width: '100%', lineHeight: 1}}>Ag</div>
          <div style={{fontSize: '11px', opacity: 0.85}}>Sphinx of black quartz</div>
        </div>
      </div>
      <div className={actionRowClass}>
        <div className={actionInputClass}>
          <InputColor
            value={pickerInput}
            onChange={onPickerInputChange}
            onEnter={(e) => {
              e.preventDefault();
              onPickerCommit();
            }}
            placeholder="#hex"
          />
        </div>
        <BasicButton
          type="button"
          width={'auto'}
          height={32}
          rounder
          fill
          positive
          disabled={!isValidColor(pickerInput)}
          onClick={onPickerCommit}
        >
          {t('Apply')}
        </BasicButton>
      </div>
    </div>
  );

  return (
    <ContextPane>
      <div className={containerClass} onMouseDown={preventMouseDown}>
        {tab === 'presets' ? presetsContent : customContent}
        <div style={{padding: '4px 0', margin: '0 -12px'}}>
          <Separator />
          <div className={tabsCenterClass}>
            <div className={tabsInlineClass}>
              <Tabs
                active={tab}
                onChange={(key) => setTab(key as 'presets' | 'custom')}
                items={[
                  {key: 'presets', label: t('Presets')},
                  {key: 'custom', label: t('Custom')},
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </ContextPane>
  );
};
