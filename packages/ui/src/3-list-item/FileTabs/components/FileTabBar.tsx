import * as React from 'react';
import {HslColor, LinearRgbColor} from '../../../styles/color';
import {rule} from 'nano-theme';
import type {FileTabsState} from '../state';

const LITE_TEXT = new LinearRgbColor(1, 1, 1, .7);
const DARK_TEXT = new LinearRgbColor(0, 0, 0, .7);

const blockClass = rule({
  pd: '6px 8px 0',
  bdrad: '4px',
  pos: 'relative',
  d: 'flex',
  bxz: 'border-box',
  fld: 'row',
  ai: 'flex-end',
  w: '100%',
  h: '48px',
  ov: 'visible',
});

export interface FileTabBarProps {
  bg: HslColor;
  fg: HslColor;
  state: FileTabsState;
  children: React.ReactNode;
}

export const FileTabBar: React.FC<FileTabBarProps> = React.memo(({bg, fg, state, children}) => {
  const hover = bg.copy(0.02, 0.2, bg.l > 0.5 ? -0.08 : 0.08);
  const style: React.CSSProperties = {
    background: bg.toString(),
    '--filetabs-bg': bg.toString(),
    '--filetabs-bg-txt': bg.toLinearRgb().pickFirstAboveOrMax(3, [LITE_TEXT, DARK_TEXT]).toString(),
    '--filetabs-fg': fg.toString(),
    '--filetabs-fg-txt': fg.toLinearRgb().pickFirstAboveOrMax(3, [LITE_TEXT, DARK_TEXT]).toString(),
    '--filetabs-hover': hover.toString(),
    '--filetabs-hover-txt': hover.toLinearRgb().pickFirstAboveOrMax(3, [LITE_TEXT, DARK_TEXT]).toString(),
  } as any;

  return (
    <div ref={state.box.setEl} className={blockClass} style={style}>
      {children}
    </div>
  );
});
