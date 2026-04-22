import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {TICK_MARGIN, TIMELINE_HEIGHT} from '../constants';
import {useLogState} from '../../context';
import {useModelTick} from '../../../hooks/useModelTick';
import useMeasure from 'react-use/lib/useMeasure';
import useScratch from 'react-use/lib/useScratch';
import {Timestamp, type ITimestampStruct, type Patch} from 'json-joy/lib/json-crdt';
import {sidColor} from '../../../util/sidColor';
import type {Log} from 'json-joy/lib/json-crdt/log/Log';
import {css as tickCss} from './tick-css';

const startingTickWidth = 42;
const timelinePadding = 4;
const scrollHeight = 12;

const blockClass = rule({
  pd: '24px 8px 8px',
  mr: '-8px 0 0',
  us: 'none',
  bdrad: '4px',
  '&:focus': {
    out: 0,
  },
});

const barCss = {
  slots: rule({
    h: TIMELINE_HEIGHT + 'px',
    d: 'flex',
    bdrad: '3px',
    pad: '1px 0 1px 1px',
    bd: '1px solid var(--json-crdt-timeline-slots-border)',
    bg: 'var(--json-crdt-timeline-slots-bg)',
    '&:hover': {
      bd: '1px solid var(--json-crdt-timeline-slots-border-hover)',
    },
  }),
  scrollBed: rule({
    pos: 'relative',
    bxz: 'border-box',
    h: scrollHeight + 'px',
    w: '100%',
    mr: '1px 0 0',
    bdrad: '3px',
    bg: 'var(--json-crdt-timeline-scroll-bed-bg)',
    '&:hover': {
      bg: 'var(--json-crdt-timeline-scroll-bed-bg-hover)',
    },
  }),
  scrollHandle: rule({
    d: 'block',
    pos: 'absolute',
    bxz: 'border-box',
    h: scrollHeight + 'px',
    t: '0px',
    bdrad: '4px',
    cur: 'ew-resize',
    bg: 'var(--json-crdt-timeline-scroll-handle-bg)',
    '&:hover': {
      bg: 'var(--json-crdt-timeline-scroll-handle-bg-hover)',
    },
    '&:active': {
      bg: 'var(--json-crdt-timeline-scroll-handle-bg-active)',
    },
  }),
};

const scrubbingTickStyle: React.CSSProperties = {
  margin: '-150px 0',
  padding: '150px 0',
  zIndex: 99999999,
};

export interface Bar {
  log: Log<any>;
}

class PatchEntry {
  constructor (
    public readonly id: ITimestampStruct,
    public readonly patch: Patch,
    public readonly color: string,
  ) {}
}

export const Bar: React.FC<Bar> = ({log}) => {
  const state = useLogState();
  const scroll = useBehaviorSubject(state.timelineScroll$);
  const pinned = useBehaviorSubject(state.pinned$);
  const [, setForceUpdate] = React.useState(0);
  const isMouseDown = React.useRef(false);
  const isScrubbing = React.useRef(false);
  React.useEffect(() => {
    const body = document.body;
    const listener = () => {
      if (isMouseDown.current) {
        isMouseDown.current = false;
        isScrubbing.current = false;
        setForceUpdate((x) => x + 1);
      }
    };
    body.addEventListener('mouseup', listener);
    return () => {
      body.removeEventListener('mouseup', listener);
    };
  }, []);
  const scrollRef = React.useRef(scroll);
  scrollRef.current = scroll;
  const pinnedRef = React.useRef(pinned);
  pinnedRef.current = pinned;
  const [ref, {width}] = useMeasure<HTMLDivElement>();
  useModelTick(log.end);
  const theme = useTheme();
  const wheelTimeout = React.useRef<number | null>(null);
  const wheelRaf = React.useRef<number | null>(null);
  const pendingWheelDx = React.useRef(0);
  const patchCount = log.patches.size();
  const totalPatches = patchCount + 1;
  const tickWidth = totalPatches > 5000 ? 2 : Math.max(3, startingTickWidth - totalPatches);
  const slotWidth = tickWidth + TICK_MARGIN;
  const scrollBedWidth = width;
  const slotListViewportWidth = Math.max(0, width - timelinePadding);
  const slotsPerViewport = width ? Math.max(1, Math.floor(slotListViewportWidth / slotWidth)) : 0;
  const slotBedWidth = patchCount * slotWidth;
  const scrollHandleRatio = slotBedWidth > 0 ? slotListViewportWidth / slotBedWidth : 1;
  const scrollHandleWidth = slotBedWidth > 0 ? Math.min(scrollBedWidth, scrollHandleRatio * scrollBedWidth) : scrollBedWidth;
  const scrollRunway = Math.max(0, scrollBedWidth - scrollHandleWidth);
  const slotsFitInViewport = !width || totalPatches <= slotsPerViewport;
  const slotIndexOffset = slotsFitInViewport ? 0 : Math.floor(scroll * (totalPatches - slotsPerViewport));
  const patchEntries = React.useMemo<PatchEntry[]>(() => {
    const entries: PatchEntry[] = [];
    log.patches.forEach(({v: patch}) => {
      const id = patch.getId();
      if (!id) return;
      entries.push(new PatchEntry(id, patch, sidColor(id.sid)));
    });
    return entries;
  }, [log, patchCount]);
  const tickIdBg = theme.g(1, 0.9);
  const slotsBorderColor = theme.g(0.9);
  const slotsBorderHoverColor = theme.g(0.7);
  const slotsBg = theme.g(0.99);
  const scrollBedBg = theme.g(0.98);
  const scrollBedHoverBg = theme.g(0.97);
  const scrollHandleBg = theme.g(0.92);
  const scrollHandleHoverBg = theme.g(0.88);
  const scrollHandleActiveBg = theme.g(0.82);

  const moveScrollByPx = React.useCallback(
    (dx: unknown): number => {
      if (!width || slotsFitInViewport || scrollRunway <= 0) return 0;
      if (typeof dx !== 'number') return 0;
      const dScroll = dx / scrollRunway;
      const currentScroll = scrollRef.current;
      let newScroll = currentScroll + dScroll;
      if (newScroll < 0) newScroll = 0;
      if (newScroll > 1) newScroll = 1;
      if (newScroll === currentScroll) return 0;
      state.setTimelineScroll(newScroll);
      return newScroll - currentScroll;
    },
    [scrollRunway, slotsFitInViewport, state, width],
  );
  const scheduleWheelScroll = React.useCallback(
    (dx: number) => {
      pendingWheelDx.current += dx;
      if (wheelRaf.current !== null) return;
      wheelRaf.current = requestAnimationFrame(() => {
        wheelRaf.current = null;
        const delta = pendingWheelDx.current;
        pendingWheelDx.current = 0;
        const didMove = !!moveScrollByPx(delta);
        if (!didMove) return;
        if (wheelTimeout.current !== null) window.clearTimeout(wheelTimeout.current);
        wheelTimeout.current = window.setTimeout(() => {
          setForceUpdate((x) => x + 1);
          wheelTimeout.current = null;
        }, 120);
      });
    },
    [moveScrollByPx],
  );
  const [scratchSlotsRef] = useScratch({
    onScratch: ({dx}) => {
      if (typeof dx === 'number' && Math.abs(dx) > 8 && isMouseDown.current && !isScrubbing.current) {
        isScrubbing.current = true;
        setForceUpdate((x) => x + 1);
      }
    },
  });
  const [scratchRef, {isScratching}] = useScratch({
    onScratch: ({dx}) => {
      moveScrollByPx(dx);
    },
  });

  const startTime = React.useMemo(() => {
    return log.start().clock.time - 1;
  }, [log]);
  const startId = React.useMemo(() => new Timestamp(0, startTime), [startTime]);

  // Block the body from scrolling (or any other element)
  React.useEffect(() => {
    const cancelWheel = (e: MouseEvent) => wheelTimeout.current && e.preventDefault();
    const body = document.body;
    body.addEventListener('wheel', cancelWheel, {passive: false});
    return () => body.removeEventListener('wheel', cancelWheel);
  }, []);

  React.useEffect(() => {
    return () => {
      if (wheelTimeout.current !== null) window.clearTimeout(wheelTimeout.current);
      if (wheelRaf.current !== null) cancelAnimationFrame(wheelRaf.current);
    };
  }, []);

  const handleTickMouseUp = React.useCallback(
    (patch: Patch | undefined) => {
      const pinned = pinnedRef.current;
      if (!patch) {
        state.pin(pinned === 'start' ? null : 'start');
        return;
      }
      state.pin(pinned === patch ? null : patch);
    },
    [state],
  );

  const handleTickMouseEnter = React.useCallback(
    (patch: Patch | undefined) => {
      const pinned = pinnedRef.current;
      if (!patch) {
        if (pinned !== 'start') state.pin('start');
        return;
      }
      if (pinned !== patch) state.pin(patch);
    },
    [state],
  );

  const isScrolling = !!wheelTimeout.current || isScratching;
  const tickWrapStyle = isScrubbing.current ? scrubbingTickStyle : undefined;
  const tickItemClassName = isScrolling ? tickCss.item : tickCss.item + ' ' + tickCss.hoverable;
  const selectedTickItemClassName = tickCss.item + ' ' + tickCss.selected;
  const canHandleTickMouseUp = !isScrolling && !isScrubbing.current;
  const canHandleTickMouseEnter = isScrubbing.current;
  const barStyle = {
    overflow: isScrubbing.current ? undefined : 'hidden',
    '--json-crdt-tick-id-bg': tickIdBg,
    '--json-crdt-tick-width': tickWidth + 'px',
    '--json-crdt-timeline-slots-border': slotsBorderColor,
    '--json-crdt-timeline-slots-border-hover': slotsBorderHoverColor,
    '--json-crdt-timeline-slots-bg': slotsBg,
    '--json-crdt-timeline-scroll-bed-bg': scrollBedBg,
    '--json-crdt-timeline-scroll-bed-bg-hover': scrollBedHoverBg,
    '--json-crdt-timeline-scroll-handle-bg': scrollHandleBg,
    '--json-crdt-timeline-scroll-handle-bg-hover': scrollHandleHoverBg,
    '--json-crdt-timeline-scroll-handle-bg-active': scrollHandleActiveBg,
  } as React.CSSProperties;

  const items: React.ReactNode[] = [];
  const renderTick = (
    id: ITimestampStruct,
    color: string,
    selected: boolean,
    marker?: string,
    patch?: Patch,
  ): React.ReactNode => (
    <div
      key={items.length}
      className={tickCss.wrap}
      style={tickWrapStyle}
      onMouseUp={canHandleTickMouseUp ? () => handleTickMouseUp(patch) : undefined}
      onMouseEnter={canHandleTickMouseEnter ? () => handleTickMouseEnter(patch) : undefined}
    >
      <div className={tickCss.block}>
        <div
          className={selected ? selectedTickItemClassName : tickItemClassName}
          style={{background: color}}
        />
        <div className={tickCss.id} style={{display: selected ? 'block' : undefined}}>
          <Code noBg size={-2}>
            {id.sid > 1000 ? '…' + (id.sid + '').slice(-4) : id.sid}.{id.time}
          </Code>
        </div>
        {!!marker && (
          <div className={tickCss.marker}>
            <Code noBg size={-3} gray>
              {marker}
            </Code>
          </div>
        )}
      </div>
    </div>
  );
  const rulerInterval = totalPatches > 1000 || log.end.clock.time > 9999 ? 25 : 10;
  if (slotIndexOffset <= 0) {
    items.push(renderTick(startId, sidColor(0), pinned === 'start', '.' + startTime));
  }

  if (slotsPerViewport) {
    const start = Math.max(0, slotIndexOffset - 1);
    const end = Math.min(patchEntries.length, slotIndexOffset + slotsPerViewport - 1);
    for (let i = start; i < end; i++) {
      const entry = patchEntries[i];
      const patchIndex = i + 1;
      const tenth = patchIndex % rulerInterval === 0;
      const {id, patch, color} = entry;
      items.push(renderTick(id, color, pinned === patch, tenth ? '.' + id.time : undefined, patch));
    }
  }

  const scrollBed = slotsFitInViewport ? null : (
    <div className={barCss.scrollBed}>
      {scrollHandleRatio < 1 && (
        <div
          ref={scratchRef}
          className={barCss.scrollHandle}
          style={{
            left: scrollRunway * scroll,
            width: scrollHandleWidth,
          }}
        />
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      // biome-ignore lint: allow tabIndex
      tabIndex={0}
      className={blockClass}
      style={barStyle}
      onWheel={(e) => {
        const dx = e.deltaY || e.deltaX;
        if (dx) scheduleWheelScroll(dx);
      }}
      onMouseDown={() => {
        isMouseDown.current = true;
        setForceUpdate((x) => x + 1);
      }}
      onKeyDown={(e) => {
        switch (e.code) {
          case 'ArrowUp':
          case 'ArrowRight': {
            state.next();
            break;
          }
          case 'ArrowDown':
          case 'ArrowLeft': {
            state.prev();
            break;
          }
        }
      }}
    >
      <div
        ref={scratchSlotsRef}
        className={barCss.slots}
      >
        {width ? items : null}
      </div>
      {scrollBed}
    </div>
  );
};
