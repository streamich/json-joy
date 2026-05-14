import * as React from 'react';
import {rule} from 'nano-theme';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {ContextPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {ColorSwatch} from '@jsonjoy.com/ui/lib/2-inline-block/ColorSwatch';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {MARK_SLOTS, MARK_SLOT_LABEL, markSlotBg, markSlotFg} from '../util/palette';
import {getActiveMarkColor, setMarkColor} from '../behavior/color';
import type {MuTxtState} from '../state/MuTxtState';
import type {MarkColor, MenuItem} from '../types';

const RecentMarkIcon: React.FC<{slot: MarkColor}> = ({slot}) => {
  const styles = useStyles();
  const dark = !styles.light;
  return <ColorSwatch kind="plain" size={20} color={markSlotBg(slot, dark)} textColor={markSlotFg(slot, dark)} />;
};

/** Builds a recents-menu item that re-applies a specific highlight slot. */
const buildRecentMarkItem = (slot: MarkColor, mutxt: MuTxtState): MenuItem => ({
  id: 'recent-mark-' + slot,
  name: MARK_SLOT_LABEL[slot] + ' highlight',
  text: 'mark highlight ' + MARK_SLOT_LABEL[slot] + ' background color',
  icon: () => <RecentMarkIcon slot={slot} />,
  onSelect: () => {
    setMarkColor(mutxt.editor, slot);
    mutxt.sync(false);
  },
});

const containerClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'center',
  gap: '4px',
  pd: '8px',
});

export interface MarkSwatchPanelProps {
  mutxt: MuTxtState;
}

export const MarkSwatchPanel: React.FC<MarkSwatchPanelProps> = ({mutxt}) => {
  const popup = usePopup();
  const styles = useStyles();
  const dark = !styles.light;
  mutxt.version.use();

  React.useEffect(() => {
    mutxt.inline.setPopupOpen(true);
    return () => mutxt.inline.setPopupOpen(false);
  }, [mutxt]);
  const current = getActiveMarkColor(mutxt.editor);
  const activeSlot: MarkColor | undefined = current === true ? 'yellow' : current;

  const apply = (slot: MarkColor) => {
    const isToggleOff = slot === activeSlot;
    setMarkColor(mutxt.editor, isToggleOff ? undefined : slot);
    mutxt.sync(false);
    if (!isToggleOff) mutxt.inline.menu.addRecent(buildRecentMarkItem(slot, mutxt));
    popup?.close();
  };

  const preventMouseDown = (e: React.MouseEvent) => e.preventDefault();

  return (
    <ContextPane>
      <div className={containerClass} onMouseDown={preventMouseDown}>
        {MARK_SLOTS.map((slot) => (
          <ColorSwatch
            key={slot}
            kind="plain"
            size={24}
            color={markSlotBg(slot, dark)}
            textColor={markSlotFg(slot, dark)}
            active={slot === activeSlot}
            tooltip={{renderTooltip: () => MARK_SLOT_LABEL[slot]}}
            onClick={() => apply(slot)}
          />
        ))}
      </div>
    </ContextPane>
  );
};
