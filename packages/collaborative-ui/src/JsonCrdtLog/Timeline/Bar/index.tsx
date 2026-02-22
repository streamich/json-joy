import * as React from 'react';
import type {Log} from 'json-joy/lib/json-crdt/log/Log';
import {drule, useTheme} from 'nano-theme';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {TICK_MARGIN, TIMELINE_HEIGHT} from '../constants';
import {Tick} from './Tick';
import {useLogState} from '../../context';
import {useModelTick} from '../../../hooks/useModelTick';
import useMeasure from 'react-use/lib/useMeasure';
import useScratch from 'react-use/lib/useScratch';
import {Timestamp} from 'json-joy/lib/json-crdt';

const startingTickWidth = 42;
const timelinePadding = 4;
const scrollHeight = 12;

const css = {
  block: drule({
    pd: '24px 8px 8px',
    mr: '-8px 0 0',
    us: 'none',
    bdrad: '4px',
    '&:focus': {
      out: 0,
    },
  }),
  slots: drule({
    h: TIMELINE_HEIGHT + 'px',
    d: 'flex',
    bdrad: '3px',
    pad: '1px 0 1px 1px',
  }),
  scrollBed: drule({
    pos: 'relative',
    bxz: 'border-box',
    h: scrollHeight + 'px',
    w: '100%',
    mr: '1px 0 0',
    bdrad: '3px',
  }),
  scrollHandle: drule({
    d: 'block',
    pos: 'absolute',
    bxz: 'border-box',
    h: scrollHeight + 'px',
    w: '111px',
    t: '0px',
    l: '0pxd',
    bdrad: '4px',
    cur: 'ew-resize',
  }),
};

export interface Bar {
  log: Log<any>;
}

export const Bar: React.FC<Bar> = ({log}) => {
  const state = useLogState();
  const scroll = useBehaviorSubject(state.timelineScroll$);
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
  const scratchStartScroll = React.useRef(scroll);
  const [ref, {width}] = useMeasure<HTMLDivElement>();
  useModelTick(log.end);
  const pinned = useBehaviorSubject(state.pinned$);
  const theme = useTheme();
  const wheelTimeout = React.useRef<any>(undefined);
  // biome-ignore lint: manual dependency list
  const moveScrollByPx = React.useCallback(
    (dx: unknown): number => {
      if (!width) return 0;
      if (typeof dx !== 'number') return 0;
      const totalPatches = log.patches.size();
      const TICK_WIDTH = Math.max(3, 100 - totalPatches);
      const slotWidth = TICK_WIDTH + TICK_MARGIN;
      const scrollBedWidth = width;
      const slotListViewportWidth = width - timelinePadding;
      const slotBedWidth = totalPatches * slotWidth;
      const scrollHandleRatio = slotListViewportWidth / slotBedWidth;
      const scrollHandleWidth = scrollHandleRatio * scrollBedWidth;
      const scrollRunway = scrollBedWidth - scrollHandleWidth;
      const dScroll = dx / scrollRunway;
      const currentScroll = scratchStartScroll.current;
      let newScroll = scrollRef.current + dScroll;
      if (newScroll < 0) newScroll = 0;
      if (newScroll > 1) newScroll = 1;
      if (newScroll === currentScroll) return 0;
      state.setTimelineScroll(newScroll);
      return newScroll - currentScroll;
    },
    [log, width],
  );
  const [scratchSlotsRef] = useScratch({
    onScratch: ({dx}) => {
      if (typeof dx === 'number' && Math.abs(dx) > 8 && isMouseDown.current) {
        isScrubbing.current = true;
        setForceUpdate((x) => x + 1);
      }
    },
  });
  const [scratchRef, {isScratching}] = useScratch({
    onScratchStart: () => {
      scratchStartScroll.current = scroll;
    },
    onScratch: ({dx}) => {
      moveScrollByPx(dx);
    },
  });

  const startTime = React.useMemo(() => {
    return log.start().clock.time - 1;
  }, [log]);

  // Block the body from scrolling (or any other element)
  React.useEffect(() => {
    const cancelWheel = (e: MouseEvent) => wheelTimeout.current && e.preventDefault();
    const body = document.body;
    body.addEventListener('wheel', cancelWheel, {passive: false});
    return () => body.removeEventListener('wheel', cancelWheel);
  }, []);

  const isScrolling = !!wheelTimeout.current || isScratching;
  const totalPatches = log.patches.size() + 1;
  const tickWidth = totalPatches > 5000 ? 2 : Math.max(3, startingTickWidth - totalPatches);
  const slotWidth = tickWidth + TICK_MARGIN;
  const scrollBedWidth = width;
  const slotListViewportWidth = width - timelinePadding;
  const slotsPerViewport = width ? Math.floor(slotListViewportWidth / slotWidth) : 0;
  const slotBedWidth = log.patches.size() * slotWidth;
  const scrollHandleRatio = slotListViewportWidth / slotBedWidth;
  const scrollHandleWidth = scrollHandleRatio * scrollBedWidth;
  const scrollRunway = scrollBedWidth - scrollHandleWidth;
  const slotsFitInViewport = totalPatches <= slotsPerViewport;
  const slotIndexOffset = slotsFitInViewport ? 0 : Math.floor(scroll * (totalPatches - slotsPerViewport));

  const items: React.ReactNode[] = [];
  const rulerInterval = totalPatches > 1000 || log.end.clock.time > 9999 ? 25 : 10;
  if (slotIndexOffset <= 0) {
    items.push(
      <Tick
        key={'start'}
        id={new Timestamp(0, startTime)}
        selected={pinned === 'start'}
        marker={'.' + startTime}
        tickWidth={tickWidth}
        noHover={isScrolling}
        scrubbing={isScrubbing.current}
      />,
    );
  }
  let i = 1;
  log.patches.forEach(({v: patch}) => {
    const id = patch.getId();
    if (!id) return;
    if (i >= slotIndexOffset && i < slotIndexOffset + slotsPerViewport) {
      const tenth = i % rulerInterval === 0;
      items.push(
        <Tick
          key={id.sid + '.' + id.time}
          id={id}
          patch={patch}
          selected={pinned === patch}
          marker={tenth ? '.' + id.time : undefined}
          tickWidth={tickWidth}
          noHover={isScrolling}
          scrubbing={isScrubbing.current}
        />,
      );
    }
    i++;
  });

  const scrollBed = (
    <div
      className={css.scrollBed({
        display: slotsFitInViewport ? 'none' : 'block',
        bg: theme.g(0.98),
        '&:hover': {
          bg: theme.g(0.97),
        },
      })}
    >
      {scrollHandleRatio < 1 && (
        <div
          ref={scratchRef}
          className={css.scrollHandle({
            bg: theme.g(0.92),
            '&:hover': {
              bg: theme.g(0.88),
            },
            '&:active': {
              bg: theme.g(0.82),
            },
          })}
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
      className={css.block()}
      style={{
        overflow: isScrubbing.current ? undefined : 'hidden',
      }}
      onWheel={(e) => {
        const dx = e.deltaY || e.deltaX;
        const didMove = !!moveScrollByPx(dx);
        if (didMove) {
          clearTimeout(wheelTimeout.current);
          wheelTimeout.current = setTimeout(() => {
            setForceUpdate((x) => x + 1);
            wheelTimeout.current = null;
          }, 300);
        }
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
        className={css.slots({
          bd: `1px solid ${theme.g(0.9)}`,
          bg: theme.g(0.99),
          '&:hover': {
            bd: `1px solid ${theme.g(0.7)}`,
          },
        })}
      >
        {width ? items : null}
      </div>
      {scrollBed}
    </div>
  );
};
