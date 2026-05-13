import type {MathElement, MathLang, MathSize} from '../../../types';

export const DEF_SIZE: MathSize = 'L';
export const DEF_LANG: MathLang = 'latex';

export const MATH_SIZES: MathSize[] = ['L', 'M', 'S'];
export const MATH_SIZE_LABEL: Record<MathSize, string> = {
  L: 'Display',
  M: 'Text',
  S: 'Small',
};

export const getMathSize = (value?: string): MathSize => {
  if (value === 'L' || value === 'M' || value === 'S') return value;
  return DEF_SIZE;
};

export const getStoredMathSize = (value: MathSize): MathSize | undefined =>
  value === DEF_SIZE ? undefined : value;

export const getMathLang = (value?: string): MathLang => {
  if (value === 'latex' || value === 'asciimath' || value === 'mathml') return value;
  return DEF_LANG;
};

export const getStoredMathLang = (value: MathLang): MathLang | undefined =>
  value === DEF_LANG ? undefined : value;

export const MATH_SIZE_PADDING: Record<MathSize, string> = {
  L: '4px 16px',
  M: '2px 12px',
  S: '1px 10px',
};

export const MATH_SIZE_FONT: Record<MathSize, string> = {
  L: '1.3em',
  M: '1.3em',
  S: '1.15em',
};

export const mathSizeToLatexStylePrefix = (size: MathSize): string => {
  if (size === 'M') return '\\scriptstyle ';
  if (size === 'S') return '\\scriptscriptstyle ';
  return '';
};

export const mathSizeToSpanMode = (size: MathSize): 'textstyle' | 'displaystyle' => {
  if (size === 'L') return 'displaystyle';
  return 'textstyle';
};

export const mathSizeToFieldDefaultMode = (size: MathSize): 'math' | 'inline-math' => {
  if (size === 'L') return 'math';
  return 'inline-math';
};

export type MathElementMeta = Pick<MathElement, 'caption' | 'size'>;
