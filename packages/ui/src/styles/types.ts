import type {ColorTheme} from './color/types';
import type {FontTheme} from './font/types';

export interface StyleTheme {
  light?: boolean;
  font?: FontTheme;
  color?: ColorTheme;
}
