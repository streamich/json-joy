import * as React from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {rule, useTheme} from 'nano-theme';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {useLogState} from '../../context';
import {useModelTick} from '../../../hooks/useModelTick';
import useMeasure from 'react-use/lib/useMeasure';
import useScratch from 'react-use/lib/useScratch';
import {Timestamp, type ITimestampStruct, type Patch} from 'json-joy/lib/json-crdt';
import {sidColor} from '../../../util/sidColor';
import {css as tickCss} from './tick-css';
import type {Log} from 'json-joy/lib/json-crdt/log/Log';

const startingTickWidth = 42;
const timelinePadding = 4;
const scrollHeight = 12;
const TICK_MARGIN = 1;

const startTickColor = sidColor(0);
const tickItemClassNameStatic = tickCss.item;
const tickItemClassNameHoverable = tickCss.item + ' ' + tickCss.hoverable;
const selectedTickItemClassName = tickCss.item + ' ' + tickCss.selected;
const scrubbingTickStyle: React.CSSProperties = {
  margin: '-150px 0',
  padding: '150px 0',
  zIndex: 99999999,
};
const tickIndexAttribute = 'data-tick-index';

interface PatchEntry {
  id: ITimestampStruct;
  patch: Patch;
  color: string;
}

interface VisibleTick {
  id: ITimestampStruct;
  patch?: Patch;
  color: string;
  selected: boolean;
  marker?: string;
}

const getTickElement = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(`[${tickIndexAttribute}]`);
};

const getTickIndex = (target: EventTarget | null): number | null => {
  const tickElement = getTickElement(target);
  if (!tickElement) return null;
  const index = Number(tickElement.dataset.tickIndex);
  return Number.isInteger(index) ? index : null;
};

const renderTickNode = (
  tick: VisibleTick,
  index: number,
  tickWrapStyle: React.CSSProperties | undefined,
  tickItemClassName: string,
): React.ReactNode => (
  <div key={index} data-tick-index={index} className={tickCss.wrap} style={tickWrapStyle}>
    <div className={tickCss.block}>
      <div className={tick.selected ? selectedTickItemClassName : tickItemClassName} style={{background: tick.color}} />
      <div className={tickCss.id} style={{display: tick.selected ? 'block' : undefined}}>
        <Code noBg size={-2}>
          {tick.id.sid > 1000 ? '…' + (tick.id.sid + '').slice(-4) : tick.id.sid}.{tick.id.time}
        </Code>
      </div>
      {!!tick.marker && (
        <div className={tickCss.marker}>
          <Code noBg size={-3} gray>
            {tick.marker}
          </Code>
        </div>
      )}
    </div>
  </div>
);

const blockClass = rule({
  pd: '24px 8px 8px',
  mr: '-8px 0 0',
  us: 'none',
  bdrad: '4px',
  '&:focus': {
    out: 0,
  },
});

const slotsClass = rule({
  h: 'var(--json-crdt-timeline-height)',
  d: 'flex',
  bdrad: '3px',
  pad: '1px 0 1px 1px',
  bd: '1px solid var(--json-crdt-timeline-slots-border)',
  bg: 'var(--json-crdt-timeline-slots-bg)',
  '&:hover': {
    bd: '1px solid var(--json-crdt-timeline-slots-border-hover)',
  },
});

const scrollBedClass = rule({
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
});

const scrollHandleClass = rule({
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
});

export interface Bar {
  log: Log<any>;
}

export const Bar: React.FC<Bar> = ({log}) => {
  const state = useLogState();
  const scroll = useBehaviorSubject(state.timelineScroll$);
  const pinned = useBehaviorSubject(state.pinned$);
  const view = useBehaviorSubject(state.view$);
  const [, setForceUpdate] = useState(0);
  const isMouseDown = useRef(false);
  const isScrubbing = useRef(false);
  useEffect(() => {
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
  const scrollRef = useRef(scroll);
  scrollRef.current = scroll;
  const pinnedRef = useRef(pinned);
  pinnedRef.current = pinned;
  const rootElementRef = useRef<HTMLDivElement | null>(null);
  const [measureRef, {width}] = useMeasure<HTMLDivElement>();
  useModelTick(log.end);
  const theme = useTheme();
  const wheelTimeout = useRef<number | null>(null);
  const wheelRaf = useRef<number | null>(null);
  const pendingWheelDx = useRef(0);
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
  const patchEntries = useMemo<PatchEntry[]>(() => {
    const entries: PatchEntry[] = [];
    log.patches.forEach(({v: patch}) => {
      const id = patch.getId();
      if (!id) return;
      entries.push({id, patch, color: sidColor(id.sid)});
    });
    return entries;
  }, [log, patchCount]);

  const moveScrollByPx = useCallback(
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
  const scheduleWheelScroll = useCallback(
    (dx: number) => {
      pendingWheelDx.current += dx;
      if (wheelRaf.current !== null) return;
      // wheelRaf.current = requestAnimationFrame(() => {
        wheelRaf.current = null;
        const delta = pendingWheelDx.current;
        pendingWheelDx.current = 0;
        !!moveScrollByPx(delta);
        // const didMove = !!moveScrollByPx(delta);
        // if (!didMove) return;
        // if (wheelTimeout.current !== null) window.clearTimeout(wheelTimeout.current);
        // wheelTimeout.current = window.setTimeout(() => {
        //   setForceUpdate((x) => x + 1);
          // wheelTimeout.current = null;
        // }, 40);
      // });
    },
    [moveScrollByPx],
  );
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      const absDeltaX = Math.abs(event.deltaX);
      const absDeltaY = Math.abs(event.deltaY);
      const dx = absDeltaX > absDeltaY ? event.deltaX : event.deltaY;
      if (!dx) return;
      event.preventDefault();
      scheduleWheelScroll(dx);
    },
    [scheduleWheelScroll],
  );
  const setRootRef = useCallback(
    (element: HTMLDivElement | null) => {
      rootElementRef.current = element;
      if (element) measureRef(element);
    },
    [measureRef],
  );
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
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
      }, [state]);
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
  useEffect(() => {
    const cancelWheel = (e: MouseEvent) => wheelTimeout.current && e.preventDefault();
    const body = document.body;
    body.addEventListener('wheel', cancelWheel, {passive: false});
    return () => body.removeEventListener('wheel', cancelWheel);
  }, []);

  useEffect(() => {
    const rootElement = rootElementRef.current;
    if (!rootElement) return;
    rootElement.addEventListener('wheel', handleWheel, {passive: false});
    return () => {
      rootElement.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  useEffect(() => {
    return () => {
      if (wheelTimeout.current !== null) window.clearTimeout(wheelTimeout.current);
      if (wheelRaf.current !== null) cancelAnimationFrame(wheelRaf.current);
    };
  }, []);

  const handleTickMouseUp = useCallback(
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

  const handleTickMouseEnter = useCallback(
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

  const tiny = view === 'tiny';
  const isScrolling = !!wheelTimeout.current || isScratching;
  const tickWrapStyle = isScrubbing.current ? scrubbingTickStyle : undefined;
  const tickItemClassName = isScrolling ? tickItemClassNameStatic : tickItemClassNameHoverable;
  const canHandleTickMouseUp = !isScrubbing.current;
  const canHandleTickMouseEnter = isScrubbing.current;
  const barStyle = React.useMemo(
    () =>
      ({
        overflow: tiny || isScrubbing.current ? undefined : 'hidden',
        overscrollBehaviorX: 'contain',
        '--json-crdt-timeline-height': tiny ? '4px' : '32px',
        '--json-crdt-tick-id-bg': theme.g(1, 0.9),
        '--json-crdt-tick-width': tickWidth + 'px',
        '--json-crdt-timeline-slots-border': theme.g(0.9),
        '--json-crdt-timeline-slots-border-hover': theme.g(0.7),
        '--json-crdt-timeline-slots-bg': theme.g(0.99),
        '--json-crdt-timeline-scroll-bed-bg': theme.g(0.98),
        '--json-crdt-timeline-scroll-bed-bg-hover': theme.g(0.97),
        '--json-crdt-timeline-scroll-handle-bg': theme.g(0.92),
        '--json-crdt-timeline-scroll-handle-bg-hover': theme.g(0.88),
        '--json-crdt-timeline-scroll-handle-bg-active': theme.g(0.82),
        paddingTop: tiny ? 12 : void 0,
      }) as React.CSSProperties,
    [theme, tickWidth, isScrubbing.current],
  );
  const rulerInterval = totalPatches > 1000 || log.end.clock.time > 9999 ? 25 : 10;
  const visibleTicks = React.useMemo<VisibleTick[]>(() => {
    const ticks: VisibleTick[] = [];
    if (slotIndexOffset <= 0) {
      ticks.push({id: startId, color: startTickColor, selected: pinned === 'start', marker: '.' + startTime});
    }
    if (slotsPerViewport) {
      const start = Math.max(0, slotIndexOffset - 1);
      const end = Math.min(patchEntries.length, slotIndexOffset + slotsPerViewport - 1);
      for (let i = start; i < end; i++) {
        const entry = patchEntries[i];
        const patchIndex = i + 1;
        ticks.push({
          id: entry.id,
          patch: entry.patch,
          color: entry.color,
          selected: pinned === entry.patch,
          marker: patchIndex % rulerInterval === 0 ? '.' + entry.id.time : undefined,
        });
      }
    }
    return ticks;
  }, [patchEntries, pinned, rulerInterval, slotIndexOffset, slotsPerViewport, startId, startTime]);
  const tickTargets = React.useMemo(() => visibleTicks.map((tick) => tick.patch), [visibleTicks]);
  const items = React.useMemo(
    () => visibleTicks.map((tick, index) => renderTickNode(tick, index, tickWrapStyle, tickItemClassName)),
    [tickItemClassName, tickWrapStyle, visibleTicks],
  );
  const handleSlotsMouseUp = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!canHandleTickMouseUp) return;
      const tickIndex = getTickIndex(event.target);
      if (tickIndex === null || tickIndex >= tickTargets.length) return;
      handleTickMouseUp(tickTargets[tickIndex]);
    },
    [canHandleTickMouseUp, handleTickMouseUp, tickTargets],
  );
  const handleSlotsMouseOver = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!canHandleTickMouseEnter) return;
      const tickElement = getTickElement(event.target);
      if (!tickElement) return;
      const relatedTickElement = getTickElement(event.relatedTarget);
      if (tickElement === relatedTickElement) return;
      const tickIndex = getTickIndex(tickElement);
      if (tickIndex === null || tickIndex >= tickTargets.length) return;
      handleTickMouseEnter(tickTargets[tickIndex]);
    },
    [canHandleTickMouseEnter, handleTickMouseEnter, tickTargets],
  );
  const scrollHandleStyle = React.useMemo(
    () => ({left: scrollRunway * scroll, width: scrollHandleWidth, height: view === 'tiny' ? 8 : void 0}),
    [scroll, scrollHandleWidth, scrollRunway, view],
  );

  const scrollBed = slotsFitInViewport ? null : (
    <div className={scrollBedClass} style={{height: view === 'tiny' ? 8 : void 0}}>
      {scrollHandleRatio < 1 && (
        <div
          ref={scratchRef}
          className={scrollHandleClass}
          style={scrollHandleStyle}
        />
      )}
    </div>
  );

  return (
    <div
      ref={setRootRef}
      // biome-ignore lint: allow tabIndex
      tabIndex={0}
      className={blockClass}
      style={barStyle}
      onMouseDown={() => {
        isMouseDown.current = true;
        setForceUpdate((x) => x + 1);
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={scratchSlotsRef}
        className={slotsClass}
        onMouseUp={handleSlotsMouseUp}
        onMouseOver={handleSlotsMouseOver}
      >
        {width ? items : null}
      </div>
      {scrollBed}
    </div>
  );
};
