import * as React from 'react';
import {type HslColor, LinearRgbColor} from '../../../styles/color';
import {rule} from 'nano-theme';
import {BasicButtonAdd} from '../../../2-inline-block/BasicButton/BasicButtonAdd';
import type {FileTabsState} from '../state';

const LITE_TEXT = new LinearRgbColor(1, 1, 1, 0.7);
const DARK_TEXT = new LinearRgbColor(0, 0, 0, 0.7);

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
  '-webkit-app-region': 'drag', // Drag for Electron app.
  '& button, & a, & input, & textarea, & select, & [role="button"], & [role="tablist"]': {
    '-webkit-app-region': 'no-drag',
  },
});

const mainClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'flex-end',
  fl: '1 1 auto',
  minWidth: 0,
  h: '100%',
  ov: 'visible',
});

const clusterClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'flex-end',
  fl: '0 1 auto',
  w: 'fit-content',
  minWidth: 0,
  maxWidth: '100%',
  h: '100%',
  ov: 'visible',
});

const tabsViewportClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'flex-end',
  fl: '1 1 auto',
  minWidth: 0,
  h: '100%',
  ov: 'visible',
});

const tabsMeasureClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'flex-end',
  minWidth: 0,
  h: '100%',
  ov: 'visible',
});

const addButtonClass = rule({
  h: '100%',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  fl: '0 0 auto',
  bdz: 'border-box',
  pd: '0 0 0 8px',
});

const beforeClass = rule({
  h: '100%',
  d: 'flex',
  ai: 'center',
  fl: '0 0 auto',
  bdz: 'border-box',
  pd: '0 8px 3px 0',
});

const afterClass = rule({
  h: '100%',
  d: 'flex',
  ai: 'center',
  bdz: 'border-box',
  pd: '0 0 3px 8px',
});

const trailingClass = rule({
  h: '100%',
  d: 'flex',
  fld: 'row',
  ai: 'center',
  fl: '0 0 auto',
  minWidth: 0,
  ov: 'visible',
  pd: '0 0 3px',
});

const rightClass = rule({
  h: '100%',
  d: 'flex',
  ai: 'center',
  jc: 'flex-end',
  fl: '0 0 auto',
  bdz: 'border-box',
  pd: '0 0 3px 12px',
});

const tabListClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'flex-end',
  minWidth: 0,
  h: '100%',
  ov: 'visible',
});

export interface FileTabBarProps {
  bg: HslColor;
  fg: HslColor;
  state: FileTabsState;
  tabs: React.ReactNode;
  before?: React.ReactNode;
  after?: React.ReactNode;
  right?: React.ReactNode;
  overlay?: React.ReactNode;
  style?: React.CSSProperties;
}

export const FileTabBar: React.FC<FileTabBarProps> = React.memo(
  ({bg, fg, state, tabs, before, after, right, overlay, style: _style}) => {
    const hover = bg.copy(0.02, 0.2, bg.l > 0.5 ? -0.08 : 0.08);
    const style: React.CSSProperties = {
      ..._style,
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
        <div className={mainClass}>
          {before ? <div className={beforeClass}>{before}</div> : null}
          <div ref={state.tabsBox.setEl} className={tabsViewportClass}>
            <div className={clusterClass}>
              <div className={tabsMeasureClass}>
                <div
                  role="tablist"
                  aria-orientation="horizontal"
                  aria-label="File tabs"
                  className={tabListClass}
                  onKeyDown={state.onKeyDown}
                >
                  {tabs}
                </div>
              </div>
              <div ref={state.trailingBox.setEl} className={trailingClass}>
                {!!state.onNewTab && (
                  <div className={addButtonClass}>
                    <BasicButtonAdd rounder onClick={state.addNew} />
                  </div>
                )}
                {after ? <div className={afterClass}>{after}</div> : null}
              </div>
            </div>
          </div>
        </div>
        {right ? <div className={rightClass}>{right}</div> : null}
        {overlay}
      </div>
    );
  },
);
