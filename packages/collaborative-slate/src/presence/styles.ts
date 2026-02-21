import {Colors} from '@jsonjoy.com/ui/lib/styles/color/Colors';

/** Generate a deterministic color from a string (e.g. peerId). */
export const generateColor = (str: string, alpha?: number): string =>
  new Colors().hash(str).setA(100 * (alpha ?? 1)) + '';

