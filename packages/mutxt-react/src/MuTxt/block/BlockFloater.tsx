import * as React from 'react';
import {rule} from 'nano-theme';
import {ExpandableToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/ExpandableToolbar';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {useClickAway} from '@jsonjoy.com/ui/lib/hooks/useClickAway';
import {useMuTxt} from '../context';

/** Time after the last scroll event before the handle fades back in. */
const SCROLL_FADE_RESUME_MS = 150;

const handleClass = rule({
  trs: 'opacity .25s ease',
});

export interface BlockFloaterProps {}

export const BlockFloater: React.FC<BlockFloaterProps> = () => {
  const mutxt = useMuTxt();
  const state = mutxt.block;
  const cursor = mutxt.cursor.use();
  const readOnly = mutxt.readOnly.use();
  const dismissed = state.dismissed.use();
  const omniOpen = mutxt.omni.open.use();
  const availableWidth = mutxt.sizer.width.use();
  const desiredWidth = mutxt.sizer.content.use();
  mutxt.version.use();
  mutxt.scrollVersion.use();
  mutxt.editableBox.use();
  mutxt.wnd.use();

  const width = Math.min(availableWidth, desiredWidth);
  const transparent = width > 900;

  const handleRef = React.useRef<HTMLDivElement | null>(null);
  const clickAwayRef = useClickAway(
    React.useCallback(() => {
      state.dismissed.next(true);
    }, [state]),
  );

  const composedRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      handleRef.current = el;
      clickAwayRef(el);
    },
    [clickAwayRef],
  );

  React.useEffect(() => {
    let resumeTimer: number | null = null;
    let isFaded = false;
    const onScroll = () => {
      const el = handleRef.current;
      if (el && !isFaded) {
        isFaded = true;
        el.style.opacity = '0';
      }
      if (resumeTimer !== null) clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        resumeTimer = null;
        isFaded = false;
        const el = handleRef.current;
        if (el) {
          el.style.opacity = '';
        }
      }, SCROLL_FADE_RESUME_MS);
    };
    const unsubscribe = mutxt.scroll.scrollTop$.subscribe(onScroll);
    return () => {
      unsubscribe();
      if (resumeTimer !== null) clearTimeout(resumeTimer);
    };
  }, [mutxt]);

  if (readOnly || !cursor || mutxt.api.hasSelection()) return;
  if (dismissed) return;
  if (omniOpen) return;
  if (!state.currentBlockFormat()) return;
  const point = state.point();
  if (!point) return;
  if (!state.isInViewport(point)) return;

  const menu = state.menu.build();
  if (!menu) return;

  return (
    <PositionAtPoint point={point} animate>
      <div ref={composedRef} className={handleClass} onMouseDown={(e) => e.preventDefault()}>
        <ExpandableToolbar
          pane={
            {
              transparent,
              compact: true,
            } as any
          }
          compact
          menu={menu}
        />
      </div>
    </PositionAtPoint>
  );
};
