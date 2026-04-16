import * as React from 'react';
import {HslColor, LinearRgbColor} from '../../../styles/color';
import {rule} from 'nano-theme';
import {BasicButtonAdd} from '../../../2-inline-block/BasicButton/BasicButtonAdd';
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

const addButtonClass = rule({
  // w: '32px',
  h: '100%',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  bdz: 'border-box',
  pd: '0 0 3px 8px',
});

const tabListClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'flex-end',
  flex: '1 1 auto',
  minWidth: 0,
  h: '100%',
  ov: 'visible',
});

export interface FileTabBarProps {
  bg: HslColor;
  fg: HslColor;
  state: FileTabsState;
  tabs: React.ReactNode;
  overlay?: React.ReactNode;
}

export const FileTabBar: React.FC<FileTabBarProps> = React.memo(({bg, fg, state, tabs, overlay}) => {
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
    <div ref={state.box.setEl} className={blockClass} style={style} onMouseLeave={state.unfreeze}>
      <div role="tablist" aria-orientation="horizontal" aria-label="File tabs" className={tabListClass} onKeyDown={state.onKeyDown}>
        {tabs}
      </div>
      <div className={addButtonClass}>
        <BasicButtonAdd rounder onClick={state.addNew} />
      </div>
      {overlay}
    </div>
  );
});
