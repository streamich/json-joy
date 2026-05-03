import * as React from 'react';
import {rule} from 'nano-theme';
import {Key} from '@jsonjoy.com/ui/lib/1-inline/Key';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {ModalOverlay} from '../ModalOverlay';
import {useMuTxt} from '../../context';
import {remap} from '../../util/keys';
import {SHORTCUT_GROUPS, type ShortcutSpec} from './data';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';

const wrapperClass = rule({
  bxz: 'border-box',
  w: '100%',
  pd: '40px 48px 56px',
});

const gridClass = rule({
  columnWidth: '280px',
  columnGap: '56px',
});

const groupClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '0',
  miw: 0,
  mar: '0 0 48px',
  breakInside: 'avoid',
  WebkitColumnBreakInside: 'avoid',
  pageBreakInside: 'avoid',
});

const groupTitleClass = rule({
  mar: '0 0 10px',
});

const rowClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '12px',
  pd: '4px 0',
  fz: '13px',
  lh: '1.25',
});

const labelClass = rule({
  fls: '1 1 auto',
  miw: 0,
  ov: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const keysClass = rule({
  fls: '0 0 auto',
  d: 'inline-flex',
  ai: 'center',
  gap: '2px',
});

const renderKey = (raw: string): string => {
  const mapped = remap[raw] ?? raw;
  return mapped.length === 1 ? mapped.toUpperCase() : mapped;
};

const ShortcutKeys: React.FC<{spec: ShortcutSpec}> = ({spec}) => {
  const styles = useStyles();
  if (spec.display) return <span className={keysClass}><Key>{spec.display}</Key></span>;
  const keys = spec.keys ?? [];
  const plusStyle: React.CSSProperties = {color: styles.g(0.5, 0.45)};
  return (
    <span className={keysClass}>
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={plusStyle}>+</span>}
          <Key>{renderKey(k)}</Key>
        </React.Fragment>
      ))}
    </span>
  );
};

const ShortcutRow: React.FC<{spec: ShortcutSpec}> = ({spec}) => {
  const styles = useStyles();
  return (
    <div className={rowClass}>
      <span className={labelClass} style={{color: styles.g(0.2, 0.85)}}>
        {spec.label}
      </span>
      <ShortcutKeys spec={spec} />
    </div>
  );
};

export const KeyboardShortcutsModal: React.FC = () => {
  const mutxt = useMuTxt();
  const open = mutxt.shortcutsOpen.use();
  const close = React.useCallback(() => mutxt.shortcutsOpen.set(false), [mutxt]);

  return (
    <ModalOverlay open={open} title="Keyboard shortcuts" onClose={close}>
      <div className={wrapperClass}>
        <div className={gridClass}>
          {SHORTCUT_GROUPS.map((group) => (
            <section key={group.title} className={groupClass}>
              <div className={groupTitleClass}>
                <MiniTitle component="div" contrast>
                  {group.title}
                </MiniTitle>
              </div>
              <Separator />
              <Space />
              {group.shortcuts.map((spec) => (
                <ShortcutRow key={spec.label} spec={spec} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </ModalOverlay>
  );
};
