import * as React from 'react';
import {drule, rule, useTheme} from 'nano-theme';
import {Ripple} from '@jsonjoy.com/ui/lib/misc/Ripple';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import type {EditableWidth} from '../types';

export const LABELS: Record<EditableWidth, string> = {
  narrow: 'Narrow',
  mid: 'Mid',
  wide: 'Wide',
};

const EDITABLE_WIDTH_VISUAL_RATIOS: Record<EditableWidth, number> = {
  narrow: 0.4,
  mid: 0.65,
  wide: 0.95,
};

const widthBtnClass = drule({
  d: 'inline-flex',
  fld: 'column',
  jc: 'space-around',
  ai: 'center',
  bdrad: '10px',
  cur: 'default',
  out: 0,
  bd: 0,
  bxz: 'border-box',
  us: 'none',
  minW: 0,
});

const widthBtnFrameClass = rule({
  pos: 'relative',
  d: 'flex',
  fld: 'column',
  jc: 'center',
  ai: 'center',
  bdrad: '2px',
  bxz: 'border-box',
});

const widthBtnBarClass = rule({
  bdrad: '1.5px',
});

const widthBtnLabelClass = rule({
  fz: '.65em',
  pdt: '.35em',
  op: 0.5,
});

export interface EditableWidthButtonProps {
  kind: EditableWidth;
  /** Fixed size in px. When omitted, the button stretches to fill its parent. */
  size?: number;
  active?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

export const EditableWidthButton: React.FC<EditableWidthButtonProps> = ({kind, size, active, onClick}) => {
  const theme = useTheme();
  const styles = useStyles();
  const stretch = size === undefined;
  const renderSize = size ?? 64;
  const ratio = EDITABLE_WIDTH_VISUAL_RATIOS[kind];
  const activeBg = styles.col.accent(0, 'bg-2');
  const className = widthBtnClass({
    w: stretch ? '100%' : renderSize + 'px',
    h: renderSize + 'px',
    flex: stretch ? '1 1 0' : void 0,
    bg: active ? activeBg : theme.g(0, 0.01),
    '&:hover': {bg: active ? activeBg : theme.g(0, 0.04)},
  });
  const frameSize = Math.round(renderSize * (stretch ? 0.78 : 0.7));
  const framePadding = Math.max(2, Math.round(frameSize * 0.06));
  const frameInner = frameSize - 2 * framePadding;
  const barColor = active ? theme.color.sem.accent[0] : theme.g(0, 0.55);
  const frameBorder = active ? theme.color.sem.accent[0] : theme.g(0, 0.18);
  const barHeight = Math.max(2, Math.round(frameSize * 0.07));
  const barGap = Math.max(1, Math.round(frameSize * 0.06));
  const barFull = Math.round(frameInner * ratio);
  const barShort = Math.max(barHeight * 2, Math.round(barFull * 0.6));
  const barStyle = (w: number): React.CSSProperties => ({
    width: w + 'px',
    height: barHeight + 'px',
    background: barColor,
    marginBottom: barGap + 'px',
  });
  const lastBarStyle: React.CSSProperties = {
    ...barStyle(barShort),
    marginBottom: 0,
  };
  return (
    <Ripple ms={1000}>
      <button type="button" className={className} onClick={onClick}>
        <span
          className={widthBtnFrameClass}
          style={{
            width: frameSize + 'px',
            height: Math.round(frameSize * 0.85) + 'px',
            border: '1px dashed ' + frameBorder,
            padding: framePadding + 'px',
          }}
        >
          <span
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: barFull + 'px',
            }}
          >
            <span className={widthBtnBarClass} style={barStyle(barFull)} />
            <span className={widthBtnBarClass} style={barStyle(barFull)} />
            <span className={widthBtnBarClass} style={lastBarStyle} />
          </span>
        </span>
        {renderSize > 32 && (
          <span
            className={widthBtnLabelClass}
            style={{color: active ? theme.color.sem.accent[0] : void 0}}
          >
            {LABELS[kind]}
          </span>
        )}
      </button>
    </Ripple>
  );
};
