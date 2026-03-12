import * as React from 'react';
import {rule, makeRule} from 'nano-theme';

const outerClass = rule({
  pos: 'relative',
  w: '100%',
});

/** The visual "tray" that holds the tabs – provides background + rounding. */
const trayClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'center',
  pd: '4px',
  bdrad: '10px',
  ov: 'hidden',
});

const useTrayBg = makeRule((theme) => ({
  bg: theme.g(0.95),
}));

/** Flex-grows to fill the tray and hides the native scroll bar. */
const scrollClass = rule({
  flex: '1 1 0',
  minWidth: 0,
  ovx: 'auto',
  // Hide scrollbar (Firefox)
  scrollbarWidth: 'none',
  // Hide scrollbar (WebKit / Blink)
  '&::-webkit-scrollbar': {
    d: 'none',
  },
});

/** Relative container inside the scroll area – the pill is placed here. */
const innerClass = rule({
  pos: 'relative',
  d: 'inline-flex',
  fld: 'row',
  ai: 'center',
  minWidth: '100%',
});

/** The animated background pill that slides to the active tab. */
const pillClass = rule({
  pos: 'absolute',
  bdrad: '7px',
  pointerEvents: 'none',
  zIndex: 0,
  trs: 'left .22s cubic-bezier(.4,0,.2,1), width .22s cubic-bezier(.4,0,.2,1), top .22s cubic-bezier(.4,0,.2,1), height .22s cubic-bezier(.4,0,.2,1)',
});

const usePillBg = makeRule((theme) => ({
  bg: theme.isLight ? '#fff' : theme.g(0.23),
  bxsh: '0 1px 3px rgba(0,0,0,.12), 0 0 0 0.5px rgba(0,0,0,.05)',
}));

const tabClass = rule({
  pos: 'relative',
  zIndex: 1,
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  pd: '5px 14px',
  bdrad: '7px',
  bd: 0,
  bg: 'transparent',
  cur: 'pointer',
  ws: 'nowrap',
  fls: 0,
  out: 0,
  '&:focus-visible': {out: 0},
  trs: 'color .15s ease',
  us: 'none',
});

const useTabBase = makeRule((theme) => ({
  ...theme.font.ui1.mid,
  fz: '13px',
  col: theme.g(0, 0.5),
  '&:hover': {
    col: theme.g(0, 0.82),
  },
}));

const useTabActive = makeRule((theme) => ({
  col: theme.g(0, 0.92),
  '&:hover': {
    col: theme.g(0, 1),
  },
}));

/** Scroll arrow button. */
const arrowClass = rule({
  fls: '0 0 auto',
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  w: '20px',
  h: '20px',
  bdrad: '50%',
  bd: 0,
  cur: 'pointer',
  fz: '15px',
  lh: 1,
  pd: 0,
  out: 0,
  '&:focus-visible': {out: 0},
  us: 'none',
});

const useArrow = makeRule((theme) => ({
  bg: theme.isLight ? 'rgba(255,255,255,.85)' : theme.g(0.18),
  bxsh: '0 1px 3px rgba(0,0,0,.2)',
  col: theme.g(0, 0.5),
  '&:hover': {
    col: theme.g(0, 0.88),
  },
}));

const arrowGapClass = rule({
  w: '4px',
  fls: '0 0 auto',
});

const contentClass = rule({
  w: '100%',
});

export interface TabItem {
  key: string;
  label: React.ReactNode;
  content?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Initial active tab key (uncontrolled). */
  defaultActive?: string;
  /** Controlled active tab key. */
  active?: string;
  onChange?: (key: string) => void;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActive,
  active: activeProp,
  onChange,
  style,
  contentStyle,
}) => {
  const trayBg = useTrayBg();
  const pillBg = usePillBg();
  const tabBase = useTabBase();
  const tabActiveCls = useTabActive();
  const arrowDyn = useArrow();

  // Uncontrolled state
  const [internal, setInternal] = React.useState<string>(
    () => defaultActive ?? items[0]?.key ?? '',
  );
  const active = activeProp !== undefined ? activeProp : internal;

  // Pill geometry
  const [pill, setPill] = React.useState<React.CSSProperties>({left: 0, top: 0, width: 0, height: 0});

  // Whether the arrow buttons should show
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  // Move the pill to match the currently active tab button.
  const movePill = React.useCallback((key: string) => {
    const el = tabRefs.current.get(key);
    if (!el) return;
    setPill({
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
  }, []);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  // Place pill synchronously after every relevant render (before paint).
  React.useLayoutEffect(() => {
    movePill(active);
    checkScroll();
  }, [active, movePill, checkScroll]);

  // Update arrow visibility on scroll.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, {passive: true});
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  // Re-check when the container resizes (e.g. window resize).
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      movePill(active);
      checkScroll();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, movePill, checkScroll]);

  const handleClick = (key: string) => {
    if (activeProp === undefined) setInternal(key);
    onChange?.(key);
    // Scroll the clicked tab into view after potential layout update.
    requestAnimationFrame(() => {
      tabRefs.current.get(key)?.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
    });
  };

  const scrollBy = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({left: dir * 120, behavior: 'smooth'});
  };

  const activeItem = items.find((i) => i.key === active);

  return (
    <div className={outerClass} style={style}>
      <div className={trayClass + trayBg}>
        {canLeft && (
          <>
            <button
              className={arrowClass + arrowDyn}
              onClick={() => scrollBy(-1)}
              type="button"
              aria-label="Scroll tabs left"
              style={{outline: 'none'}}
            >
              ‹
            </button>
            <div className={arrowGapClass} />
          </>
        )}

        <div ref={scrollRef} className={scrollClass}>
          <div className={innerClass}>
            {/* Sliding pill background */}
            <div className={pillClass + pillBg} style={pill} />

            {items.map((item) => (
              <button
                key={item.key}
                ref={(el) => {
                  if (el) tabRefs.current.set(item.key, el);
                  else tabRefs.current.delete(item.key);
                }}
                className={tabClass + tabBase + (item.key === active ? tabActiveCls : '')}
                onClick={() => handleClick(item.key)}
                type="button"
                style={{outline: 'none'}}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {canRight && (
          <>
            <div className={arrowGapClass} />
            <button
              className={arrowClass + arrowDyn}
              onClick={() => scrollBy(1)}
              type="button"
              aria-label="Scroll tabs right"
              style={{outline: 'none'}}
            >
              ›
            </button>
          </>
        )}
      </div>

      {activeItem?.content !== undefined && (
        <div className={contentClass} style={contentStyle}>
          {activeItem.content}
        </div>
      )}
    </div>
  );
};
