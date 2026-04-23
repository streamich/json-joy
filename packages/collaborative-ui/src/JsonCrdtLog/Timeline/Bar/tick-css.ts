import {rule} from 'nano-theme';

const blockClass = rule({
  pos: 'relative',
});

export const css = {
  block: blockClass,
  wrap: rule({
    pos: 'relative',
  }),
  item: rule({
    pos: 'relative',
    z: 1,
    h: 'var(--json-crdt-timeline-height)',
    w: 'var(--json-crdt-tick-width)',
    bxz: 'border-box',
    op: 0.6,
    marr: '1px',
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
      h: 'calc(var(--json-crdt-timeline-height) + 10px)',
    },
  }),
  selected: rule({
    z: 2,
    w: 'calc(var(--json-crdt-tick-width) + 2px)',
    bdrad: '2px',
    op: 0.9,
    mar: '-4px 0 -4px -1px',
    h: 'calc(var(--json-crdt-timeline-height) + 8px)',
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
