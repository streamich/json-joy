import {Color} from './Color';
import {theme as ltheme} from './theme/light';
import {theme as dtheme} from './theme/dark';
import type {
  ColorHue,
  ColorScaleStep,
  ColorTheme,
  ColorScaleStepMnemonic,
  ColorPalette,
  ColorSpecifier,
  ColorAdjustments,
  ColorMapping,
  ColorScales,
} from './types';
import {hash} from '../util';

const gray: ColorHue = [0, 0];

const STEP_MAP: Record<ColorScaleStepMnemonic, ColorScaleStep> = {
  'bg-1': 0,
  'bg-2': 1,
  'el-1': 2,
  'el-2': 3,
  'el-3': 4,
  'border-1': 5,
  'border-2': 6,
  'border-3': 7,
  'solid-1': 8,
  'solid-2': 9,
  'txt-1': 10,
  'txt-2': 11,
};

export class Colors {
  public readonly light: boolean;
  public readonly scales: ColorScales;

  constructor(public theme: ColorTheme = {palette: {}}) {
    this.light = theme.light ?? true;
    this.scales = {...(this.light ? ltheme.scales! : dtheme.scales!), ...theme.scales};
  }

  public stepNum(step: number | ColorScaleStep | ColorScaleStepMnemonic): ColorScaleStep {
    return typeof step === 'number' ? ((step % 12) as ColorScaleStep) : (STEP_MAP[step] ?? 1);
  }

  public readonly col = ([type, index = 0, step = 8, adj]: ColorSpecifier): Color => {
    const palette = this.theme.palette;
    const colors = palette[type] ?? palette.brand ?? palette.neutral ?? [gray];
    const wrappedIndex = index % colors.length;
    const color = colors[wrappedIndex];
    const options = color[2];
    const stepIndex = this.stepNum(step);
    const scaleL = options?.scales?.L ?? this.scales.L!;
    const scaleXS = options?.scales?.xS ?? this.scales.xS!;
    const scaleDH = options?.scales?.dH ?? this.scales.dH!;
    const xS = scaleXS[stepIndex];
    const dH = scaleDH[stepIndex];
    const H = color[0] + dH;
    let S = color[1] * xS;
    let L = scaleL[stepIndex];
    let A = 100;
    if (adj) {
      S += adj.dS ?? 0;
      A = adj.A ?? A;
      const adjL = adj.L;
      if (adjL) L = adjL;
      else {
        const dL = adj.dL;
        if (dL) L += this.light ? dL : -dL;
      }
    }
    return new Color(H, S, L, A, this.light);
  };

  public readonly get = (
    type: keyof ColorPalette,
    step: ColorScaleStep | ColorScaleStepMnemonic = 8,
    index: number = 0,
    adj?: ColorAdjustments,
  ): string => this.col([type, index, step, adj]) + '';

  public readonly accent = (
    index: number = 0,
    step: ColorScaleStep | ColorScaleStepMnemonic = 8,
    adj?: ColorAdjustments,
  ): string => this.get('accent', step, index, adj) + '';

  public readonly g = (
    step: ColorScaleStep | ColorScaleStepMnemonic = 8,
    adj?: ColorAdjustments,
    index: number = 0,
  ): string => this.get('neutral', step, index, adj) + '';

  private _map = new Map<keyof ColorMapping, Color>();

  public mapped(name: keyof ColorMapping): Color {
    const cache = this._map;
    let col = cache.get(name);
    if (col) return col;
    const specifier = this.theme.mapping?.[name] ?? ltheme.mapping![name]!;
    col = this.col(specifier);
    cache.set(name, col);
    return col;
  }

  public readonly map = (name: keyof ColorMapping): string => this.mapped(name) + '';

  public readonly hash = (str: string): Color => {
    const int = hash(str);
    const H = int % 360;
    const S = 0.22;
    const L = this.scales.L![6];
    return new Color(H, S, L, 100, this.light);
  };
}
