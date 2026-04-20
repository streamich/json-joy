export const DEFAULT_CODE_BLOCK_WRAP_COLUMN = 80;
export const DEFAULT_CODE_BLOCK_SHOW_LINE_NUMBERS = true;

const roundPositive = (value: number | undefined, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.round(value));
};

export const getCodeBlockWrapColumn = (value?: number): number => {
  const nextValue = roundPositive(value, DEFAULT_CODE_BLOCK_WRAP_COLUMN);
  return nextValue > 0 ? nextValue : DEFAULT_CODE_BLOCK_WRAP_COLUMN;
};

export const getCodeBlockShowLineNumbers = (value?: boolean): boolean =>
  value === undefined ? DEFAULT_CODE_BLOCK_SHOW_LINE_NUMBERS : value;

export const getStoredCodeBlockWrapColumn = (value: number): number | undefined => {
  const nextValue = getCodeBlockWrapColumn(value);
  return nextValue === DEFAULT_CODE_BLOCK_WRAP_COLUMN ? undefined : nextValue;
};

export const getStoredCodeBlockShowLineNumbers = (value: boolean): boolean | undefined =>
  value === DEFAULT_CODE_BLOCK_SHOW_LINE_NUMBERS ? undefined : value;