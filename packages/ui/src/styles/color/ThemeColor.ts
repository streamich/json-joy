import {HslColor} from './HslColor';

const DEFAULT_BG = HslColor.from('#fff')!;

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export type RoleName = 'surface' | 'border' | 'text' | 'solid';
export type StateName = 'resting' | 'hover' | 'active' | 'focus' | 'disabled';

type RoleSpec = readonly [contrast: number, satDelta: number, alpha?: number];

const ROLES: Record<RoleName, Record<StateName, RoleSpec>> = {
  surface: {resting: [.06, -.45], hover: [.10, -.35], active: [.14, -.25], focus: [.10, -.25], disabled: [.03, -.55]},
  border:  {resting: [.30, -.35], hover: [.45, -.20], active: [.60, -.10], focus: [.55,  .00], disabled: [.18, -.55]},
  text:    {resting: [.65, -.05], hover: [.75,  .00], active: [.85,  .05], focus: [.70,  .00], disabled: [.35, -.40]},
  solid:   {resting: [.55,  .05], hover: [.65,  .10], active: [.75,  .15], focus: [.60,  .10], disabled: [.25, -.40]},
};

export class ThemeColor {
  constructor(
    public readonly fg: HslColor,
    public readonly bg: HslColor = DEFAULT_BG,
  ) {}

  public isDarkTheme(): boolean {
    return this.bg.l < 0.5;
  }

  /**
   * @param contrast Contrast with background: 1 - highest, 0 - lowest.
   * @param alpha The alpha channel level.
   */
  public g(contrast: number = 1, alpha: number = this.fg.a): string {
    return this.col(contrast, alpha).toString();
  }

  public col(contrast: number = 0, alpha: number = this.fg.a): ThemeColor {
    const isDark = this.isDarkTheme();
    const bgL = this.bg.l;
    const fgS = this.fg.s;
    const lightness = isDark ? bgL + (1 - bgL) * contrast : bgL - bgL * contrast;
    const saturation = clamp(fgS + (isDark ? 1 : -1) * contrast * 0.5, 0, 1);
    // const saturation = fgS;
    const newHsl = new HslColor(this.fg.h, saturation, lightness, alpha);
    return new ThemeColor(newHsl, this.bg);
  }

  public toDarkTheme(bgDark: HslColor): ThemeColor {
    const dContrast = this.bg.l - this.fg.l;
    const newL = clamp(bgDark.l + dContrast, 0, 1);
    const newS = this.fg.s > 0.6 ? this.fg.s * 0.9 : this.fg.s;
    const newH = this.fg.h;
    return new ThemeColor(new HslColor(newH, newS, newL, this.fg.a), bgDark);
  }

  /** Resolve a named role/state to a concrete HslColor against this theme color's bg. */
  public role(name: RoleName, state: StateName = 'resting'): HslColor {
    const [contrast, satDelta, alpha] = ROLES[name][state];
    const isDark = this.isDarkTheme();
    const bgL = this.bg.l;
    const lightness = isDark ? bgL + (1 - bgL) * contrast : bgL - bgL * contrast;
    const saturation = clamp(this.fg.s + satDelta, 0, 1);
    return new HslColor(this.fg.h, saturation, lightness, alpha ?? this.fg.a);
  }

  public lerp(other: ThemeColor, t: number): ThemeColor {
    return new ThemeColor(this.fg.mix(other.fg, t), this.bg.mix(other.bg, t));
  }

  public toString(): string {
    return this.fg.toString();
  }
}
