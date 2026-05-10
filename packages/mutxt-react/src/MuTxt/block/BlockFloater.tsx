import * as React from 'react';
import {isMobile} from '@jsonjoy.com/ui';
import {rule} from 'nano-theme';
import {ExpandableToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/ExpandableToolbar';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {useClickAway} from '@jsonjoy.com/ui/lib/hooks/useClickAway';
import {useMuTxt} from '../context';

const handleClass = rule({
  trs: 'opacity .25s ease',
});

export type BlockFloaterProps = {};

export const BlockFloater: React.FC<BlockFloaterProps> = isMobile
  ? () => null
  : () => {
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

      const syncFloaterPosition = React.useCallback((): void => {
        const handle = handleRef.current;
        if (!handle) return;
        const el = handle.parentElement;
        if (!el) return;
        const s = el.style;
        const next = state.point();
        if (!next || !state.isInViewport(next)) {
          if (s.display !== 'none') s.display = 'none';
          return;
        }
        const {x, y, dx, dy} = next;
        const desiredLeft = dx >= 0 ? x + 'px' : '';
        const desiredRight = dx >= 0 ? '' : window.innerWidth - x + 'px';
        const desiredTop = dy >= 0 ? y + 'px' : '';
        const desiredBottom = dy >= 0 ? '' : window.innerHeight - y + 'px';
        if (s.display === 'none') s.display = '';
        if (s.left !== desiredLeft) s.left = desiredLeft;
        if (s.right !== desiredRight) s.right = desiredRight;
        if (s.top !== desiredTop) s.top = desiredTop;
        if (s.bottom !== desiredBottom) s.bottom = desiredBottom;
      }, [state]);

      React.useEffect(() => {
        const id = window.setInterval(syncFloaterPosition, 1000);
        return () => window.clearInterval(id);
      }, [syncFloaterPosition]);

      React.useEffect(() => {
        let resumeTimer: number | null = null;
        const onScroll = () => {
          const handle = handleRef.current;
          if (handle) {
            if (handle.style.opacity !== '0') handle.style.opacity = '0';
            const el = handle.parentElement;
            if (el && el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
          }
          if (resumeTimer !== null) clearTimeout(resumeTimer);
          resumeTimer = window.setTimeout(() => {
            resumeTimer = null;
            syncFloaterPosition();
            const handle = handleRef.current;
            if (!handle) return;
            const el = handle.parentElement;
            if (el) el.style.visibility = '';
            window.requestAnimationFrame(() => {
              const handle = handleRef.current;
              if (handle) handle.style.opacity = '';
            });
          }, 350);
        };
        const unsubscribe = mutxt.scroll.scrollTop$.subscribe(onScroll);
        return () => {
          unsubscribe();
          if (resumeTimer !== null) clearTimeout(resumeTimer);
        };
      }, [mutxt, syncFloaterPosition]);

      if (readOnly || !cursor || mutxt.api.hasSelection()) return;
      if (dismissed || omniOpen || !state.currentBlockFormat()) return;
      const point = state.point();
      if (!point || !state.isInViewport(point)) return;

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
