import type {HrLineStyle} from '../../../types';

export const DEFAULT_HR_STROKE_WIDTH = 1;
export const DEFAULT_HR_LINE_WIDTH = 100;
export const DEFAULT_HR_LINE_STYLE: HrLineStyle = 'solid';
export const DEFAULT_HR_BLOCK_HEIGHT = 32;

export const HR_STROKE_WIDTH_MIN = 0;
export const HR_STROKE_WIDTH_MAX = 12;
export const HR_LINE_WIDTH_MIN = 1;
export const HR_LINE_WIDTH_MAX = 100;
export const HR_BLOCK_HEIGHT_MIN = 8;
export const HR_BLOCK_HEIGHT_MAX = 500;

export const HR_LINE_STYLES: HrLineStyle[] = ['solid', 'dashed', 'dotted', 'squiggly'];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const numberOrDefault = (value: number | undefined, fallback: number, min: number, max: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return clamp(Math.round(value), min, max);
};

export const getHrStrokeWidth = (value?: number): number =>
  numberOrDefault(value, DEFAULT_HR_STROKE_WIDTH, HR_STROKE_WIDTH_MIN, HR_STROKE_WIDTH_MAX);

export const getHrLineWidth = (value?: number): number =>
  numberOrDefault(value, DEFAULT_HR_LINE_WIDTH, HR_LINE_WIDTH_MIN, HR_LINE_WIDTH_MAX);

export const getHrBlockHeight = (value?: number): number =>
  numberOrDefault(value, DEFAULT_HR_BLOCK_HEIGHT, HR_BLOCK_HEIGHT_MIN, HR_BLOCK_HEIGHT_MAX);

export const getHrLineStyle = (value?: HrLineStyle): HrLineStyle =>
  value && HR_LINE_STYLES.includes(value) ? value : DEFAULT_HR_LINE_STYLE;

export const getStoredHrStrokeWidth = (value: number): number | undefined => {
  const next = getHrStrokeWidth(value);
  return next === DEFAULT_HR_STROKE_WIDTH ? undefined : next;
};

export const getStoredHrLineWidth = (value: number): number | undefined => {
  const next = getHrLineWidth(value);
  return next === DEFAULT_HR_LINE_WIDTH ? undefined : next;
};

export const getStoredHrBlockHeight = (value: number): number | undefined => {
  const next = getHrBlockHeight(value);
  return next === DEFAULT_HR_BLOCK_HEIGHT ? undefined : next;
};

export const getStoredHrLineStyle = (value: HrLineStyle): HrLineStyle | undefined => {
  const next = getHrLineStyle(value);
  return next === DEFAULT_HR_LINE_STYLE ? undefined : next;
};
