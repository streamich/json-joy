import type {TocElement} from '../../../types';

export type TocMaxLevel = NonNullable<TocElement['maxLevel']>;

export const DEF_MAX_LEVEL: TocMaxLevel = 3;
export const DEF_INCLUDE_TITLE = true;
export const DEF_NUMBERED = true;

export const TOC_MAX_LEVELS: TocMaxLevel[] = [1, 2, 3, 4, 5, 6];

export const getTocMaxLevel = (value?: number): TocMaxLevel => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEF_MAX_LEVEL;
  const clamped = Math.min(6, Math.max(1, Math.round(value)));
  return clamped as TocMaxLevel;
};

export const getTocIncludeTitle = (value?: boolean): boolean =>
  typeof value === 'boolean' ? value : DEF_INCLUDE_TITLE;

export const getTocNumbered = (value?: boolean): boolean => (typeof value === 'boolean' ? value : DEF_NUMBERED);

export const getStoredTocMaxLevel = (value: TocMaxLevel): TocMaxLevel | undefined =>
  value === DEF_MAX_LEVEL ? undefined : value;

export const getStoredTocIncludeTitle = (value: boolean): boolean | undefined =>
  value === DEF_INCLUDE_TITLE ? undefined : value;

export const getStoredTocNumbered = (value: boolean): boolean | undefined =>
  value === DEF_NUMBERED ? undefined : value;
