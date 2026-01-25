import * as React from 'react';
import {rule, drule, useTheme} from 'nano-theme';
import {TICK_MARGIN, TIMELINE_HEIGHT} from '../constants';
import type {ITimestampStruct, Patch} from 'json-joy/lib/json-crdt';
import {Code} from 'nice-ui/lib/1-inline/Code';
import {useLogState} from '../../context';
import {sidColor} from '../../../util/sidColor';

const blockClass = rule({
  pos: 'relative',
});

const css = {
  wrap: rule({
    pos: 'relative',
  }),
  block: blockClass,
  item: drule({
    pos: 'relative',
    z: 1,
    h: TIMELINE_HEIGHT + 'px',
    bxz: 'border-box',
    op: 0.6,
    marr: TICK_MARGIN + 'px',
    cur: 'pointer',
    '&:active:hover': {
      op: 1,
    },
  }),
  selected: rule({
    z: 2,
    bdrad: '2px',
    op: 0.9,
    mar: '-4px 0 -4px -1px',
    h: TIMELINE_HEIGHT + 8 + 'px',
    out: '1px solid rgba(0,0,0,.8)',
  }),
  id: drule({
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
  tickWidth: number;
  noHover?: boolean;
  scrubbing?: boolean;
}

export const Tick: React.FC<TickProps> = ({id, patch, selected, marker, tickWidth, noHover, scrubbing}) => {
  const state = useLogState();
  const theme = useTheme();

  const color = sidColor(id.sid);

  return (
    <div
      className={css.wrap}
      style={{
        margin: scrubbing ? '-150px 0' : undefined,
        padding: scrubbing ? '150px 0' : undefined,
        zIndex: scrubbing ? 99999999 : undefined,
      }}
      onMouseUp={
        noHover || scrubbing
          ? undefined
          : () => {
              state.pin(
                patch
                  ? state.pinned$.getValue() === patch
                    ? null
                    : patch
                  : state.pinned$.getValue() === 'start'
                    ? null
                    : 'start',
              );
            }
      }
      onMouseEnter={
        scrubbing
          ? () => {
              if (!patch) {
                if (state.pinned$.getValue() !== 'start') state.pin('start');
              } else {
                if (state.pinned$.getValue() !== patch) state.pin(patch);
              }
            }
          : undefined
      }
    >
      <div className={css.block}>
        <div
          key={id.sid + '.' + id.time}
          className={
            css.item({
              w: tickWidth + (selected ? 2 : 0) + 'px',
              '&:hover': noHover
                ? {}
                : {
                    w: tickWidth + 2 + 'px',
                    bdrad: '2px',
                    op: 0.8,
                    mar: '-5px 0 -5px -1px',
                    h: TIMELINE_HEIGHT + 10 + 'px',
                  },
            }) + (selected ? css.selected : '')
          }
          style={{
            background: color,
          }}
        />
        <div
          className={css.id({
            bg: theme.g(1, 0.9),
          })}
          style={{display: selected ? 'block' : undefined}}
        >
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
