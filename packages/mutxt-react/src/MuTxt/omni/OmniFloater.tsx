import * as React from 'react';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ContextMenu';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {useClickAway} from '@jsonjoy.com/ui/lib/hooks/useClickAway';
import {useMuTxt} from '../context';

export interface OmniFloaterProps {}

export const OmniFloater: React.FC<OmniFloaterProps> = () => {
  const mutxt = useMuTxt();
  const omni = mutxt.omni;
  const open = omni.open.use();
  const point = omni.point.use();
  const mode = omni.mode.use();

  const clickAwayRef = useClickAway(React.useCallback(() => omni.close(), [omni]));

  React.useEffect(() => {
    if (!open) return;
    const close = () => omni.close();
    const unsubScroll = mutxt.scroll.scrollTop$.subscribe(close);
    const unsubWnd = mutxt.wnd.subscribe(close);
    return () => {
      unsubScroll();
      unsubWnd();
    };
  }, [open, mutxt, omni]);

  if (!open || !point) return null;

  const menu = omni.menu.build();
  const minWidth = mode === 'palette' ? 480 : 320;

  return (
    <PositionAtPoint point={point} animate>
      <div
        ref={clickAwayRef}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).tagName !== 'INPUT') e.preventDefault();
          e.stopPropagation();
        }}
      >
        <ContextMenu inset showSearch menu={{...menu, minWidth}} onEsc={omni.close} />
      </div>
    </PositionAtPoint>
  );
};
