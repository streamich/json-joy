import * as React from 'react';
import {rule} from 'nano-theme';
import {TICK_MARGIN, TIMELINE_HEIGHT} from '../constants';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import type {ITimestampStruct, Patch} from 'json-joy/lib/json-crdt';

const blockClass = rule({
  pos: 'relative',
});

const css = {
  block: blockClass,
  wrap: rule({
    pos: 'relative',
  }),
  item: rule({
    pos: 'relative',
    z: 1,
    h: TIMELINE_HEIGHT + 'px',
    w: 'var(--json-crdt-tick-width)',
    bxz: 'border-box',
    op: 0.6,
    marr: TICK_MARGIN + 'px',
    cur: 'pointer',
    '&:active:hover': {
      op: 1,
    },
  }),
  hoverable: rule({
    '&:hover': {
      w: 'calc(var(--json-crdt-tick-width) + 2px)',
      bdrad: '2px',
      op: 0.8,
      mar: '-5px 0 -5px -1px',
      h: TIMELINE_HEIGHT + 10 + 'px',
    },
  }),
  selected: rule({
    z: 2,
    w: 'calc(var(--json-crdt-tick-width) + 2px)',
    bdrad: '2px',
    op: 0.9,
    mar: '-4px 0 -4px -1px',
    h: TIMELINE_HEIGHT + 8 + 'px',
    out: '1px solid rgba(0,0,0,.8)',
  }),
  id: rule({
    pos: 'absolute',
    t: '-24px',
    l: '-4px',
    d: 'none',
    ws: 'nowrap',
    bdrad: '3px',
    z: 2,
    [`.${blockClass.trim()}:hover &`]: {
      d: 'block',
      z: 111,
    },
    bg: 'var(--json-crdt-tick-id-bg)',
  }),
  marker: rule({
    pos: 'absolute',
    t: '-22px',
    l: '-4px',
    ws: 'nowrap',
    bdrad: '3px',
    z: 1,
  }),
};

export interface TickProps {
  id: ITimestampStruct;
  patch?: Patch;
  selected?: boolean;
  marker?: string;
  color: string;
  noHover?: boolean;
  scrubbing?: boolean;
  onMouseUp?: (patch: Patch | undefined) => void;
  onMouseEnter?: (patch: Patch | undefined) => void;
}

export const Tick: React.FC<TickProps> = ({
  id,
  patch,
  selected,
  marker,
  color,
  noHover,
  scrubbing,
  onMouseUp,
  onMouseEnter,
}) => {
  return (
    <div
      className={css.wrap}
      style={{
        margin: scrubbing ? '-150px 0' : undefined,
        padding: scrubbing ? '150px 0' : undefined,
        zIndex: scrubbing ? 99999999 : undefined,
      }}
      onMouseUp={noHover || scrubbing || !onMouseUp ? undefined : () => onMouseUp(patch)}
      onMouseEnter={scrubbing && onMouseEnter ? () => onMouseEnter(patch) : undefined}
    >
      <div className={css.block}>
        <div
          className={css.item + (!noHover && !selected ? css.hoverable : '') + (selected ? css.selected : '')}
          style={{
            background: color,
          }}
        />
        <div className={css.id} style={{display: selected ? 'block' : undefined}}>
          <Code noBg size={-2}>
            {id.sid > 1000 ? '…' + (id.sid + '').slice(-4) : id.sid}.{id.time}
          </Code>
        </div>
        {!!marker && (
          <div className={css.marker}>
            <Code noBg size={-3} gray>
              {marker}
            </Code>
          </div>
        )}
      </div>
    </div>
  );
};
