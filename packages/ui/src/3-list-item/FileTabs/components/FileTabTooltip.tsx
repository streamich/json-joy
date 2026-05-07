import * as React from 'react';
import {makeRule, rule} from 'nano-theme';
import {ZINDEX} from '../../../constants';
import {Separator} from '../../../3-list-item/Separator';
import type {FileTabsState} from '../state';

const TOOLTIP_WIDTH = 220;
const TOOLTIP_GAP = 8;
const SHOW_DELAY_MS = 400;

const useTooltipClass = makeRule((t) => {
  const shade = t.isLight ? 0 : 1;
  return {
    pos: 'fixed',
    z: ZINDEX.TOOLTIP,
    pe: 'none',
    us: 'none',
    bg: 'var(--filetabs-fg)',
    col: 'var(--filetabs-fg-txt)',
    bdrad: '8px',
    bxz: 'border-box',
    minW: `${TOOLTIP_WIDTH}px`,
    maxW: 'calc(min(90vw, 600px))',
    bxsh: `${t.g(shade, 0.25)} 0px 4px 8px -2px, ${t.g(shade, 0.08)} 0px 0px 0px 1px`,
    pd: '8px 12px',
  };
});

const nameClass = rule({
  fw: 600,
  fz: '13px',
  lh: '1.4',
  ov: 'hidden',
  ws: 'nowrap',
  textOverflow: 'ellipsis',
});

const descClass = rule({
  fz: '13px',
  op: '.75',
  pdt: '4px',
  lh: '1.45',
  ws: 'normal',
  wordBreak: 'break-word',
  maxHeight: '80px',
  ov: 'hidden',
});

const iconRowClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '6px',
  mb: '4px',
});

const sepClass = rule({
  mr: '8px 0',
});

const cardClass = rule({
  fz: '12px',
});

export interface FileTabTooltipProps {
  state: FileTabsState;
}

export const FileTabTooltip: React.FC<FileTabTooltipProps> = ({state}) => {
  const tooltipClass = useTooltipClass();
  const hovered = state.hovered.use();
  const tabs = state.tabs.use();
  const drag = state.drag.use();
  const box = state.box.use();
  const [cx, setCx] = React.useState(0);
  React.useEffect(() => {
    if (!hovered) return;
    const onMove = (e: MouseEvent) => setCx(e.clientX);
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [hovered]);

  // Delayed visibility so tooltip only appears after hovering for a moment
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!hovered) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, [hovered?.[0]]); // only reset delay when the tab ID changes

  if (!visible || !hovered || drag) return null;

  const [id] = hovered;
  const item = tabs.find((t) => (t.id ?? t.name) === id);
  if (!item) return null;

  const bottom = box[1] + box[3];
  const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
  const left = Math.max(8, Math.min(cx - TOOLTIP_WIDTH / 2, vw - TOOLTIP_WIDTH - 8));
  const top = bottom + TOOLTIP_GAP;
  const name = item.display?.() ?? item.name ?? item.id;
  const description = item.note?.() ?? item.description;
  const hasIcon = !!item.icon;
  const hasCard = !!item.card;

  return (
    <div className={tooltipClass} style={{left, top}}>
      {hasIcon && (
        <div className={iconRowClass}>
          {item.icon!()}
          <span className={nameClass}>{name}</span>
        </div>
      )}
      {!hasIcon && <div className={nameClass}>{name}</div>}
      {!!description && <div className={descClass}>{description}</div>}
      {hasCard && (
        <>
          <div className={sepClass}>
            <Separator />
          </div>
          <div className={cardClass}>{item.card!()}</div>
        </>
      )}
    </div>
  );
};
