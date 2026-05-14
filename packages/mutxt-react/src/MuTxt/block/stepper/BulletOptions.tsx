import * as React from 'react';
import {ReactEditor, useSlateStatic} from 'slate-react';
import {Transforms} from 'slate';
import {ArgsPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ArgsPane';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {syncStore} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';
import {Dot} from '@jsonjoy.com/ui/lib/1-inline/Dot';
import type {MenuItem, Param} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import {BorderStyleIcon, type BorderStyleIconStyle} from './BorderStyleIcon';
import {getStepStateColors, pickGlyphColor, toHex} from './colors';
import {
  DEF_HALO,
  DEF_HALO_WIDTH,
  DEF_INDICATOR,
  DEF_LINE,
  DEF_LINE_WIDTH,
  DEF_RING,
  DEF_RING_WIDTH,
  DEF_STATE,
  LINE_STYLES,
  LINE_STYLE_LABEL,
  STEP_INDICATORS,
  STEP_INDICATOR_LABEL,
  STEP_STATES,
  STEP_STATE_LABEL,
  clampWidth,
  getLineStyle,
  getStepIndicator,
  getStepState,
} from './settings';
import type {LineStyle, StepIndicator, StepState} from './types';
import type {ListItemElement} from '../../types';
import NumberIcon__svg from 'iconista/lib/react/tabler/numbers';
import SymbolIcon__svg from 'iconista/lib/react/tabler_filled/alert-triangle';
import CharsIcon__svg from 'iconista/lib/react/tabler/letter-case';
import EraserIcon__svg from 'iconista/lib/react/tabler/eraser';

const NumberIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <NumberIcon__svg width={16} height={16} {...props} />;
const SymbolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SymbolIcon__svg width={16} height={16} {...props} />;
const CharsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CharsIcon__svg width={16} height={16} {...props} />;
const EraserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <EraserIcon__svg width={16} height={16} {...props} />;

const INDICATOR_ICONS: Record<StepIndicator, () => React.ReactNode> = {
  number: () => <NumberIcon />,
  symbol: () => <SymbolIcon />,
  chars: () => <CharsIcon />,
};

const StateIcon: React.FC<{state: StepState}> = ({state}) => {
  const styles = useStyles();
  const colors = getStepStateColors(styles, state);
  const glow = state === 'done' || state === 'warning' || state === 'error';
  return <Dot color={colors.line} size={10} glow={glow} />;
};

const STATE_ICONS: Record<StepState, () => React.ReactNode> = STEP_STATES.reduce(
  (acc, state) => {
    acc[state] = () => <StateIcon state={state} />;
    return acc;
  },
  {} as Record<StepState, () => React.ReactNode>,
);

const horizontalBorderIcon = (style: BorderStyleIconStyle) => () => <BorderStyleIcon style={style} />;
const verticalBorderIcon = (style: BorderStyleIconStyle) => () => (
  <BorderStyleIcon style={style} orientation="vertical" />
);

const RingRowIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" style={{display: 'block'}}>
    <circle cx={8} cy={8} r={4} fill="none" stroke="currentColor" strokeWidth={1.6} />
  </svg>
);

const HaloRowIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" style={{display: 'block'}}>
    <circle cx={8} cy={8} r={3} fill="none" stroke="currentColor" strokeWidth={0.9} />
    <circle cx={8} cy={8} r={6.4} fill="none" stroke="currentColor" strokeWidth={1.6} />
  </svg>
);

const ConnectorRowIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" style={{display: 'block'}}>
    <line x1={8} y1={2} x2={8} y2={14} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const BgRowIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" style={{display: 'block'}}>
    <circle cx={8} cy={8} r={5.5} fill="currentColor" opacity={0.35} />
  </svg>
);

const ColorRowIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" style={{display: 'block'}}>
    <text
      x="8"
      y="12"
      textAnchor="middle"
      fontSize="12"
      fontWeight="700"
      fill="currentColor"
    >
      A
    </text>
  </svg>
);

const renderRingRowIcon = () => <RingRowIcon />;
const renderHaloRowIcon = () => <HaloRowIcon />;
const renderConnectorRowIcon = () => <ConnectorRowIcon />;
const renderBgRowIcon = () => <BgRowIcon />;
const renderColorRowIcon = () => <ColorRowIcon />;
const renderCharsRowIcon = () => <CharsIcon />;
const renderEraserIcon = () => <EraserIcon />;

interface Defaultable<T> {
  def: boolean;
  value: T;
}

const isDefaultable = <T,>(v: unknown): v is Defaultable<T> =>
  !!v && typeof v === 'object' && 'def' in (v as object);

const enumOpts = <V extends string>(
  values: readonly V[],
  label: Record<V, string>,
  icon?: (v: V) => () => React.ReactNode,
) =>
  values.map((v) => {
    const opt: MenuItem = {id: v, name: label[v]};
    if (icon) opt.icon = icon(v);
    return opt;
  });

const hasStyleOverrides = (e: ListItemElement): boolean =>
  e.stepCol !== undefined ||
  e.stepBg !== undefined ||
  e.ring !== undefined ||
  e.ringCol !== undefined ||
  e.ringWidth !== undefined ||
  e.halo !== undefined ||
  e.haloCol !== undefined ||
  e.haloWidth !== undefined ||
  e.line !== undefined ||
  e.lineCol !== undefined ||
  e.lineWidth !== undefined;

export interface BulletOptionsProps {
  element: ListItemElement;
  closePopup?: () => void;
}

/**
 * Side-popup configuration pane for a single stepper bullet. Mirrors edits to
 * the slate document in real time as the user picks values — no Apply step.
 */
export const BulletOptions: React.FC<BulletOptionsProps> = ({element, closePopup}) => {
  const editor = useSlateStatic();
  const styles = useStyles();
  const popup = usePopup();
  const onCancel = React.useCallback(() => {
    if (closePopup) closePopup();
    else popup?.close();
  }, [closePopup, popup]);

  const elementRef = React.useRef(element);
  elementRef.current = element;

  const item: MenuItem = React.useMemo(() => ({name: 'Step options', compact: true}), []);

  const resetStyles = React.useCallback(() => {
    const e = elementRef.current;
    try {
      const path = ReactEditor.findPath(editor, e);
      Transforms.unsetNodes(
        editor,
        [
          'stepCol',
          'stepBg',
          'ring',
          'ringCol',
          'ringWidth',
          'halo',
          'haloCol',
          'haloWidth',
          'line',
          'lineCol',
          'lineWidth',
        ],
        {at: path},
      );
    } catch {}
  }, [editor]);

  const setField = React.useCallback(
    <K extends keyof ListItemElement>(field: K, value: ListItemElement[K] | undefined) => {
      const e = elementRef.current;
      try {
        const path = ReactEditor.findPath(editor, e);
        if (value === undefined || value === '') {
          Transforms.unsetNodes(editor, field as string, {at: path});
        } else {
          Transforms.setNodes(editor, {[field]: value} as Partial<ListItemElement>, {at: path});
        }
      } catch {}
    },
    [editor],
  );

  const params: (Param | MenuItem)[] = React.useMemo(() => {
    const e = element;
    const list: (Param | MenuItem)[] = [];
    const state = getStepState(e.stepState);
    const colors = getStepStateColors(styles, state);
    const lineHex = toHex(colors.line);
    const bgHex = toHex(colors.bg);
    const resolvedBg = e.stepBg ?? colors.bg;
    const autoGlyph = e.stepBg ? pickGlyphColor(styles, resolvedBg, colors.glyph) : colors.glyph;
    const colHex = toHex(autoGlyph);
    const indicator = getStepIndicator(e.stepIndicator);
    const indicatorIsChars = indicator === 'chars';

    const ringHasSubControls = e.ring !== undefined && e.ring !== 'none';
    const haloHasSubControls = e.halo !== undefined && e.halo !== 'none';
    const lineHasSubControls = e.line !== undefined && e.line !== 'none';
    const stylesCollapsed = !hasStyleOverrides(e);

    list.push({name: 'Behavior', heading: true, collapsible: true});
    list.push({
      kind: 'select',
      id: 'stepState',
      name: 'State',
      default: state,
      options: enumOpts(STEP_STATES, STEP_STATE_LABEL, (v) => STATE_ICONS[v]),
    });
    list.push({
      kind: 'select',
      id: 'stepIndicator',
      name: 'Indicator',
      defaultable: true,
      default: DEF_INDICATOR,
      initialDef: !e.stepIndicator,
      initialValue: e.stepIndicator ?? DEF_INDICATOR,
      options: enumOpts(STEP_INDICATORS, STEP_INDICATOR_LABEL, (v) => INDICATOR_ICONS[v]),
    });
    list.push({
      kind: 'char',
      id: 'stepChar',
      name: 'Chars',
      icon: renderCharsRowIcon,
      optional: true,
      length: 2,
      emoji: true,
      placeholder: '',
      default: e.stepChar ?? '',
      visible: syncStore(indicatorIsChars),
    });

    list.push({name: 'Styles', heading: true, collapsible: true, initialCollapsed: stylesCollapsed});
    list.push({
      kind: 'color',
      id: 'stepCol',
      name: 'Color',
      icon: renderColorRowIcon,
      defaultable: true,
      default: colHex,
      alpha: true,
      initialDef: e.stepCol === undefined,
      initialValue: e.stepCol ? toHex(e.stepCol) : colHex,
    });
    list.push({
      kind: 'color',
      id: 'stepBg',
      name: 'Background',
      icon: renderBgRowIcon,
      defaultable: true,
      default: bgHex,
      alpha: true,
      initialDef: e.stepBg === undefined,
      initialValue: e.stepBg ? toHex(e.stepBg) : bgHex,
    });

    list.push({name: 'sep-bg', innerSep: true});
    list.push({
      kind: 'enum',
      id: 'ring',
      name: 'Ring',
      icon: renderRingRowIcon,
      defaultable: true,
      default: DEF_RING,
      initialDef: e.ring === undefined,
      initialValue: e.ring ?? DEF_RING,
      options: enumOpts(LINE_STYLES, LINE_STYLE_LABEL, horizontalBorderIcon),
    });
    list.push({
      kind: 'color',
      id: 'ringCol',
      name: 'Ring color',
      defaultable: true,
      default: lineHex,
      alpha: true,
      initialDef: e.ringCol === undefined,
      initialValue: e.ringCol ? toHex(e.ringCol) : lineHex,
      visible: syncStore(ringHasSubControls),
    });
    list.push({
      kind: 'num',
      id: 'ringWidth',
      name: 'Ring width',
      defaultable: true,
      default: DEF_RING_WIDTH,
      min: 0,
      max: 6,
      step: 1,
      decimals: 0,
      dragSensitivity: 0.03,
      initialDef: e.ringWidth === undefined,
      initialValue: e.ringWidth ?? DEF_RING_WIDTH,
      visible: syncStore(ringHasSubControls),
    });

    list.push({name: 'sep-ring', innerSep: true});
    list.push({
      kind: 'enum',
      id: 'halo',
      name: 'Halo',
      icon: renderHaloRowIcon,
      defaultable: true,
      default: DEF_HALO,
      initialDef: e.halo === undefined,
      initialValue: e.halo ?? DEF_HALO,
      options: enumOpts(LINE_STYLES, LINE_STYLE_LABEL, horizontalBorderIcon),
    });
    list.push({
      kind: 'color',
      id: 'haloCol',
      name: 'Halo color',
      defaultable: true,
      default: lineHex,
      alpha: true,
      initialDef: e.haloCol === undefined,
      initialValue: e.haloCol ? toHex(e.haloCol) : lineHex,
      visible: syncStore(haloHasSubControls),
    });
    list.push({
      kind: 'num',
      id: 'haloWidth',
      name: 'Halo width',
      defaultable: true,
      default: DEF_HALO_WIDTH,
      min: 0,
      max: 6,
      step: 1,
      decimals: 0,
      dragSensitivity: 0.03,
      initialDef: e.haloWidth === undefined,
      initialValue: e.haloWidth ?? DEF_HALO_WIDTH,
      visible: syncStore(haloHasSubControls),
    });

    list.push({name: 'sep-halo', innerSep: true});
    list.push({
      kind: 'enum',
      id: 'line',
      name: 'Connector',
      icon: renderConnectorRowIcon,
      defaultable: true,
      default: DEF_LINE,
      initialDef: e.line === undefined,
      initialValue: e.line ?? DEF_LINE,
      options: enumOpts(LINE_STYLES, LINE_STYLE_LABEL, verticalBorderIcon),
    });
    list.push({
      kind: 'color',
      id: 'lineCol',
      name: 'Connector color',
      defaultable: true,
      default: lineHex,
      alpha: true,
      initialDef: e.lineCol === undefined,
      initialValue: e.lineCol ? toHex(e.lineCol) : lineHex,
      visible: syncStore(lineHasSubControls),
    });
    list.push({
      kind: 'num',
      id: 'lineWidth',
      name: 'Connector width',
      defaultable: true,
      default: DEF_LINE_WIDTH,
      min: 0,
      max: 6,
      step: 1,
      decimals: 0,
      dragSensitivity: 0.03,
      initialDef: e.lineWidth === undefined,
      initialValue: e.lineWidth ?? DEF_LINE_WIDTH,
      visible: syncStore(lineHasSubControls),
    });

    list.push({name: 'Label', heading: true, collapsible: true, initialCollapsed: true});
    list.push({
      kind: 'str',
      id: 'stepTitle',
      name: 'Title',
      optional: true,
      placeholder: 'Shipping information',
      default: e.stepTitle ?? '',
    });
    list.push({
      kind: 'str',
      id: 'stepDesc',
      name: 'Description',
      optional: true,
      placeholder: 'Brief sub-text',
      default: e.stepDesc ?? '',
    });

    list.push({name: 'Actions', heading: true, collapsible: true, initialCollapsed: true});
    list.push({
      kind: 'btn',
      id: 'reset',
      name: 'Reset styles',
      buttonLabel: 'Reset',
      buttonIcon: renderEraserIcon,
      danger: true,
      confirm: true,
      confirmLabel: 'Reset all style overrides?',
      confirmActionLabel: 'Reset',
      onClick: resetStyles,
    });

    return list;
  }, [element, styles, resetStyles]);

  const onChange = React.useCallback(
    (_list: [string, unknown][], map: Record<string, unknown>) => {
      const state = getStepState(map.stepState as string);
      setField('stepState', state === DEF_STATE ? undefined : state);

      const indRaw = map.stepIndicator;
      let indicatorValue: StepIndicator | undefined;
      if (isDefaultable<string>(indRaw)) {
        indicatorValue = indRaw.def ? undefined : getStepIndicator(indRaw.value);
      } else {
        const v = getStepIndicator(indRaw as string);
        indicatorValue = v === DEF_INDICATOR ? undefined : v;
      }
      setField('stepIndicator', indicatorValue);

      const charsRaw = (map.stepChar as string | undefined) ?? '';
      const chars = Array.from(charsRaw).slice(0, 2).join('');
      setField('stepChar', chars ? chars : undefined);

      setField('stepCol', readDefaultableColor(map.stepCol));
      setField('stepBg', readDefaultableColor(map.stepBg));

      // Style group: when style is in default mode, only clear the style
      // itself. Keep the previously-stored color/width so the values come
      // back when the user re-enables the override.
      applyStyleGroup(map, 'ring', setField);
      applyStyleGroup(map, 'halo', setField, 'haloCol', 'haloWidth');
      applyStyleGroup(map, 'line', setField, 'lineCol', 'lineWidth');

      setField('stepTitle', readOptionalStr(map.stepTitle));
      setField('stepDesc', readOptionalStr(map.stepDesc));
    },
    [setField],
  );

  return (
    <ArgsPane item={item} params={params} onCancel={onCancel} onChange={onChange} minWidth={303} />
  );
};

const readOptionalStr = (raw: unknown): string | undefined => {
  if (typeof raw !== 'string') return undefined;
  return raw.trim() ? raw : undefined;
};

const readDefaultableColor = (raw: unknown): string | undefined => {
  if (isDefaultable<string>(raw)) {
    if (raw.def) return undefined;
    const v = String(raw.value ?? '').trim();
    return v ? toHex(v) : undefined;
  }
  if (typeof raw === 'string' && raw.trim()) return toHex(raw.trim());
  return undefined;
};

type StyleKey = 'ring' | 'halo' | 'line';

const styleColField = (key: StyleKey): 'ringCol' | 'haloCol' | 'lineCol' =>
  key === 'ring' ? 'ringCol' : key === 'halo' ? 'haloCol' : 'lineCol';

const styleWidthField = (key: StyleKey): 'ringWidth' | 'haloWidth' | 'lineWidth' =>
  key === 'ring' ? 'ringWidth' : key === 'halo' ? 'haloWidth' : 'lineWidth';

const applyStyleGroup = (
  map: Record<string, unknown>,
  key: StyleKey,
  setField: <K extends keyof ListItemElement>(f: K, v: ListItemElement[K] | undefined) => void,
  colField: 'ringCol' | 'haloCol' | 'lineCol' = styleColField(key),
  widthField: 'ringWidth' | 'haloWidth' | 'lineWidth' = styleWidthField(key),
): void => {
  const styleRaw = map[key];
  let style: LineStyle | undefined;
  let overridden = false;
  if (isDefaultable<string>(styleRaw)) {
    overridden = !styleRaw.def;
    if (overridden) style = getLineStyle(styleRaw.value, 'solid');
  } else if (typeof styleRaw === 'string') {
    overridden = true;
    style = getLineStyle(styleRaw, 'solid');
  }
  setField(key, style);
  if (!overridden) return;

  const colorRaw = map[colField];
  let color: string | undefined;
  if (isDefaultable<string>(colorRaw)) {
    color = colorRaw.def ? undefined : toHexOrUndefined(colorRaw.value);
  } else if (typeof colorRaw === 'string' && colorRaw.trim()) {
    color = toHex(colorRaw.trim());
  }
  setField(colField, color);

  const widthRaw = map[widthField];
  let width: (0 | 1 | 2 | 3 | 4 | 5 | 6) | undefined;
  if (isDefaultable<number>(widthRaw)) {
    width = widthRaw.def ? undefined : clampWidth(widthRaw.value);
  } else if (typeof widthRaw === 'number') {
    width = clampWidth(widthRaw);
  }
  setField(widthField, width);
};

const toHexOrUndefined = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  return trimmed ? toHex(trimmed) : undefined;
};
