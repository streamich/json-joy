import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {rule} from 'nano-theme';
import * as React from 'react';
import {useSyncStore} from '../../hooks/useSyncStore';
import type {VirtualAlign, VirtualWindow} from '.';
import {Marker, ScrollArea, ScrollRail, ScrollState, Thumb, useVirtual, VirtualViewport} from '.';

const meta: Meta = {
  title: '4. Card/ScrollArea/Virtual',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const ROW_H = 28;

const rowClass = rule({
  d: 'flex',
  alignItems: 'center',
  bxz: 'border-box',
  pad: '0 12px',
  fz: '13px',
  font: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  whiteSpace: 'nowrap',
});

const frameStyle: React.CSSProperties = {
  width: 460,
  height: 420,
  border: '1px solid #ccc',
  borderRadius: 6,
  overflow: 'hidden',
};

const Row: React.FC<{index: number; height?: number}> = ({index, height = ROW_H}) => (
  <div
    className={rowClass}
    style={{
      height,
      background: index % 2 ? 'rgba(0,0,0,0.035)' : 'transparent',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}
  >
    <span style={{color: '#999', width: 88, flexShrink: 0}}>#{index.toLocaleString()}</span>
    <span>Row {index} — lorem ipsum dolor sit amet consectetur</span>
  </div>
);

/** Live badge reading the window's rendered range — shows how few rows are mounted. */
const Stats: React.FC<{win: VirtualWindow; total: number}> = ({win, total}) => {
  const range = useSyncStore(win.range$);
  const firstVisible = useSyncStore(win.firstVisible$);
  const mounted = Math.max(0, range.end - range.start + 1);
  return (
    <div style={{font: '12px ui-monospace, monospace', color: '#555', marginBottom: 8}}>
      {total.toLocaleString()} rows · <b>{mounted}</b> mounted in DOM · range [{range.start}, {range.end}] · first
      visible #{firstVisible}
    </div>
  );
};

const useWindow = (): [VirtualWindow | null, (win: VirtualWindow) => void] => {
  const [win, setWin] = React.useState<VirtualWindow | null>(null);
  return [win, setWin];
};

/**
 * One million rows. The API is index-based (`count` + `children(index)`), so no
 * array is materialized — a million rows costs zero up-front allocation. Only
 * `visible + 2·overscan` rows are ever in the DOM; the native scrollbar/thumb is
 * exact because the canvas div carries the real `scrollHeight`.
 */
export const OneMillionRows: StoryObj = {
  render: () => {
    const COUNT = 1_000_000;
    const [win, windowRef] = useWindow();
    return (
      <div>
        {win && <Stats win={win} total={COUNT} />}
        <ScrollArea alwaysVisible railWidth={12} style={frameStyle}>
          <VirtualViewport count={COUNT} rowHeight={ROW_H} overscan={8} windowRef={windowRef}>
            {(index) => <Row key={index} index={index} />}
          </VirtualViewport>
          <ScrollRail>
            <Thumb />
          </ScrollRail>
        </ScrollArea>
      </div>
    );
  },
};

/** A more typical 100k-row list. */
export const HundredThousandRows: StoryObj = {
  render: () => {
    const COUNT = 100_000;
    const [win, windowRef] = useWindow();
    return (
      <div>
        {win && <Stats win={win} total={COUNT} />}
        <ScrollArea alwaysVisible railWidth={12} style={frameStyle}>
          <VirtualViewport count={COUNT} rowHeight={ROW_H} windowRef={windowRef}>
            {(index) => <Row key={index} index={index} />}
          </VirtualViewport>
          <ScrollRail>
            <Thumb />
          </ScrollRail>
        </ScrollArea>
      </div>
    );
  },
};

/** Imperative `scrollToIndex(index, align)` driving the native scroll position. */
export const ScrollToIndex: StoryObj = {
  render: () => {
    const COUNT = 50_000;
    const [win, windowRef] = useWindow();
    const [index, setIndex] = React.useState(25_000);
    const [align, setAlign] = React.useState<VirtualAlign>('center');
    const aligns: VirtualAlign[] = ['start', 'center', 'end', 'nearest'];
    return (
      <div>
        <div style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, font: '13px sans-serif'}}>
          <label>
            index{' '}
            <input
              type="number"
              value={index}
              min={0}
              max={COUNT - 1}
              onChange={(e) => setIndex(Math.max(0, Math.min(COUNT - 1, Number(e.target.value) || 0)))}
              style={{width: 90}}
            />
          </label>
          <select value={align} onChange={(e) => setAlign(e.target.value as VirtualAlign)}>
            {aligns.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => win?.scrollToIndex(index, align)}>
            scrollToIndex
          </button>
          <button type="button" onClick={() => win?.scrollToIndex(Math.floor(Math.random() * COUNT), 'center')}>
            random
          </button>
        </div>
        {win && <Stats win={win} total={COUNT} />}
        <ScrollArea alwaysVisible railWidth={12} style={frameStyle}>
          <VirtualViewport count={COUNT} rowHeight={ROW_H} windowRef={windowRef}>
            {(i) => <Row key={i} index={i} />}
          </VirtualViewport>
          <ScrollRail>
            <Thumb />
            <Marker position={index / (COUNT - 1)} color="#e5484d" />
          </ScrollRail>
        </ScrollArea>
      </div>
    );
  },
};

/** Static variable row heights via a memoized `rowHeight(index)` function. */
export const VariableHeights: StoryObj = {
  render: () => {
    const COUNT = 20_000;
    const [win, windowRef] = useWindow();
    // Memoized so the window is not rebuilt on every render.
    const rowHeight = React.useCallback((index: number) => ROW_H + (index % 7) * 12, []);
    return (
      <div>
        {win && <Stats win={win} total={COUNT} />}
        <ScrollArea alwaysVisible railWidth={12} style={frameStyle}>
          <VirtualViewport count={COUNT} rowHeight={rowHeight} windowRef={windowRef}>
            {(index) => <Row key={index} index={index} height={rowHeight(index)} />}
          </VirtualViewport>
          <ScrollRail>
            <Thumb />
          </ScrollRail>
        </ScrollArea>
      </div>
    );
  },
};

// Deterministic wrapping paragraph whose rendered height is unknown upfront.
const WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(
    ' ',
  );
const paraFor = (i: number): string => {
  const n = 5 + ((i * 37) % 45); // 5..49 words, varies per row
  const out: string[] = [];
  for (let k = 0; k < n; k++) out.push(WORDS[(i + k) % WORDS.length]);
  return out.join(' ');
};

/**
 * Dynamic measured heights: `rowHeight` is omitted, so each row's real height is
 * discovered by a `ResizeObserver`, seeded from `estimateHeight`. Heights here
 * depend on how the text wraps — unknowable upfront. Scrolling stays smooth and
 * the native thumb settles as rows are measured; corrections above the viewport
 * are scroll-anchored so the content never jumps.
 */
export const MeasuredHeights: StoryObj = {
  render: () => {
    const COUNT = 10_000;
    const [win, windowRef] = useWindow();
    return (
      <div>
        {win && <Stats win={win} total={COUNT} />}
        <ScrollArea alwaysVisible railWidth={12} style={frameStyle}>
          <VirtualViewport count={COUNT} estimateHeight={64} overscan={6} windowRef={windowRef}>
            {(i) => (
              <div
                key={i}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                  font: '13px/1.5 ui-sans-serif, system-ui, sans-serif',
                  background: i % 2 ? 'rgba(0,0,0,0.03)' : 'transparent',
                }}
              >
                <b style={{color: '#999', marginRight: 6}}>#{i}</b>
                {paraFor(i)}
              </div>
            )}
          </VirtualViewport>
          <ScrollRail>
            <Thumb />
          </ScrollRail>
        </ScrollArea>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Headless `useVirtual` demo — the consumer owns the canvas + row DOM, exactly
// as the file Tree does. Validates that the core stands alone (no component).

const scrollerWrapClass = rule({
  fl: '1',
  pos: 'relative',
  ov: 'hidden',
});

const scrollerClass = rule({
  w: '100%',
  h: '100%',
  bxz: 'border-box',
  ovy: 'scroll',
  scrollbarWidth: 'none',
  MsOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    d: 'none',
  },
});

// Tree-ish shape derived purely from the index — no materialized node array.
const rowDepth = (i: number): number => (i % 11 === 0 ? 0 : 1 + (i % 5));
const rowName = (i: number): string => (rowDepth(i) === 0 ? `folder-${i}` : `file-${i}.ts`);

/**
 * The headless path: a tree-like list that renders its own rows from
 * {@link useVirtual} and reveals a random node with `scrollToIndex`. Indent
 * guides and keys are owned by the consumer, as the real file Tree requires.
 */
export const HeadlessTree: StoryObj = {
  render: () => {
    const COUNT = 200_000;
    const state = React.useMemo(() => new ScrollState({alwaysVisible: true}), []);
    const v = useVirtual(state, {count: COUNT, rowHeight: ROW_H, overscan: 6});
    const [selected, setSelected] = React.useState(-1);
    const reveal = () => {
      const id = Math.floor(Math.random() * COUNT);
      setSelected(id);
      v.scrollToIndex(id, 'nearest');
    };
    const slice: React.ReactNode[] = [];
    for (let i = v.range.start; i <= v.range.end; i++) {
      const depth = rowDepth(i);
      slice.push(
        <div
          key={i}
          className={rowClass}
          style={{
            height: ROW_H,
            paddingLeft: 8 + depth * 16,
            background: i === selected ? 'rgba(229,72,77,0.18)' : i % 2 ? 'rgba(0,0,0,0.035)' : 'transparent',
          }}
        >
          <span style={{color: '#999', marginRight: 8}}>{depth === 0 ? '▸' : '·'}</span>
          {rowName(i)}
        </div>,
      );
    }
    return (
      <div>
        <div style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, font: '13px sans-serif'}}>
          <button type="button" onClick={reveal}>
            reveal random node
          </button>
          <span style={{font: '12px ui-monospace, monospace', color: '#555'}}>
            {COUNT.toLocaleString()} nodes · {v.range.end - v.range.start + 1} mounted · first visible #{v.firstVisible}
            {selected >= 0 ? ` · selected #${selected}` : ''}
          </span>
        </div>
        <ScrollArea state={state} alwaysVisible railWidth={12} style={frameStyle}>
          <div className={scrollerWrapClass}>
            <div ref={state.setViewport} className={scrollerClass}>
              <div style={{position: 'relative', height: v.totalHeight}}>
                <div style={{transform: `translateY(${v.offsetTop}px)`}}>{slice}</div>
              </div>
            </div>
          </div>
          <ScrollRail>
            <Thumb />
          </ScrollRail>
        </ScrollArea>
      </div>
    );
  },
};
