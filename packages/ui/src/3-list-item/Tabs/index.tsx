import * as React from 'react';
import {lightTheme, rule, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const outerClass = rule({
  pos: 'relative',
  w: '100%',
});

const trayClass = drule({
  d: 'flex',
  fld: 'row',
  ai: 'center',
  pd: '5px',
  bdrad: '10px',
  ov: 'hidden',
});

const scrollClass = rule({
  flex: '1 1 0',
  minWidth: 0,
  ovx: 'auto',
  pd: '6px',
  mr: '-6px',
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
const pillClass = drule({
  pos: 'absolute',
  bdrad: '7px',
  pointerEvents: 'none',
  zIndex: 0,
  trs: 'left .22s ease, width .22s cubic-bezier(.4,0,.2,1), top .22s cubic-bezier(.4,0,.2,1), height .22s cubic-bezier(.4,0,.2,1)',
});

const tabClass = drule({
  ...lightTheme.font.ui1.mid,
  fz: '13px',
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

/** Scroll arrow button. */
const arrowClass = drule({
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
  spread?: boolean;
  muted?: boolean;
  onChange?: (key: string) => void;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActive,
  active: activeProp,
  spread,
  muted,
  onChange,
  style,
  contentStyle,
}) => {
  const styles = useStyles();
  const light = styles.light;

  const trayBg = muted ? (light ? styles.g(0.98) : styles.g(0.92)) : light ? styles.g(0.95) : styles.g(0.83);
  const trayCls = trayClass({bg: trayBg});
  const pillCls = pillClass({
    bg: light ? '#fff' : styles.g(0.78),
    bxsh: light
      ? '0 2px 5px rgba(0,0,0,.14), 0 1px 1.5px rgba(0,0,0,.08), 0 0 0 0.5px rgba(0,0,0,.06)'
      : '0 2px 5px rgba(0,0,0,.4), 0 1px 1.5px rgba(0,0,0,.3), 0 0 0 0.5px rgba(255,255,255,.08)',
  });
  const tabBaseCls = tabClass({
    col: styles.g(0, 0.5),
    '&:hover': {col: styles.g(0, 0.82)},
    '&:active': {tr: 'scale(.97)'},
  });
  const tabActiveCls = tabClass({
    col: styles.g(0, 0.92),
    '&:hover': {col: styles.g(0, 1)},
    '&:active': {tr: 'scale(.97)'},
  });
  const arrowCls = arrowClass({
    bg: light ? 'rgba(255,255,255,.85)' : styles.g(0.82),
    bxsh: light ? '0 1px 3px rgba(0,0,0,.2)' : '0 1px 3px rgba(0,0,0,.5)',
    col: styles.g(0, 0.5),
    '&:hover': {col: styles.g(0, 0.88)},
  });

  // Uncontrolled state
  const [internal, setInternal] = React.useState<string>(() => defaultActive ?? items[0]?.key ?? '');
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

  /**
   * Scroll the active tab into view if it's currently outside the visible
   * range of the scroll container. No-op when the tab is already visible.
   */
  const scrollActiveIntoView = React.useCallback(
    (behavior: ScrollBehavior) => {
      const tab = tabRefs.current.get(active);
      const scroll = scrollRef.current;
      if (!tab || !scroll) return;
      const left = tab.offsetLeft;
      const right = left + tab.offsetWidth;
      const viewLeft = scroll.scrollLeft;
      const viewRight = viewLeft + scroll.clientWidth;
      if (left < viewLeft) scroll.scrollTo({left, behavior});
      else if (right > viewRight) scroll.scrollTo({left: right - scroll.clientWidth, behavior});
    },
    [active],
  );

  const isFirstRender = React.useRef(true);

  // Place pill synchronously after every relevant render (before paint).
  React.useLayoutEffect(() => {
    movePill(active);
    // Ensure the active tab is visible. Instant on first mount so the user
    // never sees the wrong tab framed.
    scrollActiveIntoView(isFirstRender.current ? 'auto' : 'smooth');
    isFirstRender.current = false;
    checkScroll();
  }, [active, movePill, scrollActiveIntoView, checkScroll]);

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
  };

  const scrollBy = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({left: dir * 120, behavior: 'smooth'});
  };

  const activeItem = items.find((i) => i.key === active);

  return (
    <div className={outerClass} style={style}>
      <div className={trayCls}>
        {canLeft && (
          <>
            <button
              className={arrowCls}
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
          <div className={innerClass} style={{justifyContent: spread ? 'space-between' : undefined}}>
            {/* Sliding pill background */}
            <div className={pillCls} style={pill} />

            {items.map((item) => (
              <button
                key={item.key}
                ref={(el) => {
                  if (el) tabRefs.current.set(item.key, el);
                  else tabRefs.current.delete(item.key);
                }}
                className={item.key === active ? tabActiveCls : tabBaseCls}
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
              className={arrowCls}
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
