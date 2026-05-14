import * as React from 'react';
import {rule} from 'nano-theme';
import {Key} from '@jsonjoy.com/ui/lib/1-inline/Key';
import {Tabs} from '@jsonjoy.com/ui/lib/3-list-item/Tabs';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {ModalOverlay} from '../chrome/ModalOverlay';
import {useMuTxt} from '../context';
import type {TranslitRule, TranslitScheme} from '../../translit/types';
import {useT} from 'use-t';
import EmptyIcon__svg from 'iconista/lib/react/tabler/language';

const EmptyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <EmptyIcon__svg width={32} height={32} {...props} />
);

const splitName = (name: string): [label: string, suffix: string | null] => {
  const m = /^(.+?)\s*\(([^)]+)\)\s*$/.exec(name);
  if (!m) return [name, null];
  return [m[1], m[2]];
};

const wrapperClass = rule({
  bxz: 'border-box',
  w: '100%',
  pd: '40px 48px 56px',
});

const introClass = rule({
  maxW: '720px',
  mar: '0 auto 32px',
  fz: '13px',
  lh: '1.5',
  textAlign: 'center',
});

const emptyClass = rule({
  d: 'flex',
  fld: 'column',
  ai: 'center',
  jc: 'center',
  textAlign: 'center',
  pd: '64px 16px',
  gap: '12px',
});

const emptyHeadingClass = rule({
  mar: 0,
  fz: '15px',
  fw: '600',
});

const emptyBodyClass = rule({
  mar: 0,
  maxW: '420px',
  fz: '13px',
  lh: '1.5',
});

const tabsWrapClass = rule({
  w: '100%',
  mar: '0 0 32px',
});

const contentsClass = rule({
  bxz: 'border-box',
  w: '100%',
  maxW: '1444px',
  mar: '0 auto',
});

const gridClass = rule({
  d: 'flex',
  fw: 'wrap',
  jc: 'center',
  ai: 'flex-start',
  gap: '36px 64px',
});

const groupClass = rule({
  miw: 0,
  bxz: 'border-box',
  flex: '0 1 360px',
  maxW: '360px',
});

const groupTitleClass = rule({
  mar: '0 0 10px',
});

const rowsContainerClass = rule({
  bxz: 'border-box',
  w: '100%',
  columnGap: '56px',
});

const rowClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '8px',
  pd: '4px 0',
  fz: '13.5px',
  lh: '1.25',
  breakInside: 'avoid',
  WebkitColumnBreakInside: 'avoid',
  pageBreakInside: 'avoid',
});

const inputCellClass = rule({
  fls: '0 0 auto',
  d: 'inline-flex',
  ai: 'center',
  gap: '4px',
});

const arrowCellClass = rule({
  fls: '0 0 auto',
  fz: '11px',
  pd: '0 6px',
});

const outputCellClass = rule({
  fls: '1 1 auto',
  textAlign: 'end',
  fz: '18px',
  fw: '500',
});

interface RuleGroup {
  title: string;
  rules: TranslitRule[];
}

const groupRules = (rules: readonly TranslitRule[]): RuleGroup[] => {
  const single: TranslitRule[] = [];
  const di: TranslitRule[] = [];
  const tri: TranslitRule[] = [];
  for (const r of rules) {
    if (r.in.length === 1) single.push(r);
    else if (r.in.length === 2) di.push(r);
    else tri.push(r);
  }
  const sortByIn = (a: TranslitRule, b: TranslitRule) => a.in.localeCompare(b.in);
  single.sort(sortByIn);
  di.sort(sortByIn);
  tri.sort(sortByIn);
  const groups: RuleGroup[] = [];
  if (single.length) groups.push({title: 'Single keys', rules: single});
  if (di.length) groups.push({title: 'Digraphs', rules: di});
  if (tri.length) groups.push({title: 'Trigraphs', rules: tri});
  return groups;
};

/** Pick how many sub-columns to flow rules into based on count. */
const subColumns = (count: number, charWidth: number): number => {
  if (charWidth >= 3) return count > 3 ? 2 : 1;
  if (charWidth >= 2) return count > 5 ? 2 : 1;
  if (count > 18) return 3;
  if (count > 9) return 2;
  return 1;
};

const RuleRow: React.FC<{rule: TranslitRule}> = ({rule}) => {
  const styles = useStyles();
  return (
    <div className={rowClass}>
      <span className={inputCellClass}>
        {[...rule.in].map((ch, i) => (
          <Key key={i}>{ch === ' ' ? '␠' : ch}</Key>
        ))}
      </span>
      <span className={arrowCellClass} style={{color: styles.g(0.5, 0.45)}}>
        {'→'}
      </span>
      <span className={outputCellClass} style={{color: styles.g(0.1, 0.95)}}>
        {rule.out || <em style={{opacity: 0.4, fontWeight: 'normal', fontSize: '12px'}}>(empty)</em>}
      </span>
    </div>
  );
};

const RuleGroupSection: React.FC<{group: RuleGroup}> = ({group}) => {
  const charWidth = group.rules[0]?.in?.length ?? 1;
  const cols = subColumns(group.rules.length, charWidth);
  return (
    <section className={groupClass}>
      <div className={groupTitleClass}>
        <MiniTitle component="div" contrast>
          {group.title}
        </MiniTitle>
      </div>
      <Separator />
      <Space />
      <div className={rowsContainerClass} style={{columnCount: cols}}>
        {group.rules.map((r) => (
          <RuleRow key={r.in} rule={r} />
        ))}
      </div>
    </section>
  );
};

const FinalForms: React.FC<{scheme: TranslitScheme}> = ({scheme}) => {
  const [t] = useT();
  const styles = useStyles();

  if (!scheme.finalForms || !Object.keys(scheme.finalForms).length) return null;
  const entries = Object.entries(scheme.finalForms);

  return (
    <section className={groupClass}>
      <div className={groupTitleClass}>
        <MiniTitle component="div" contrast>
          {t('Final forms')}
        </MiniTitle>
      </div>
      <Separator />
      <Space />
      {entries.map(([from, to]) => (
        <div key={from} className={rowClass}>
          <span className={outputCellClass} style={{color: styles.g(0.4, 0.6), textAlign: 'start'}}>
            {from}
          </span>
          <span className={arrowCellClass} style={{color: styles.g(0.5, 0.45)}}>
            {'→'}
          </span>
          <span className={outputCellClass} style={{color: styles.g(0.1, 0.95)}}>
            {to}
          </span>
        </div>
      ))}
      <div style={{fontSize: '11px', color: styles.g(0.5, 0.55), margin: '6px 0 0'}}>
        {t('Applied to the previous glyph at word boundaries.')}
      </div>
    </section>
  );
};

const EmptyState: React.FC = () => {
  const [t] = useT();
  const styles = useStyles();

  return (
    <div className={emptyClass} style={{color: styles.g(0.4, 0.6)}}>
      <span style={{color: styles.g(0.5, 0.5)}}>
        <EmptyIcon />
      </span>
      <h3 className={emptyHeadingClass} style={{color: styles.g(0.2, 0.85)}}>
        {t('Transliteration is off')}
      </h3>
      <p className={emptyBodyClass}>{t('Pick a language above to view its phonetic map and turn the mode on.')}</p>
    </div>
  );
};

const Body: React.FC<{scheme: TranslitScheme}> = ({scheme}) => {
  const styles = useStyles();
  const groups = React.useMemo(() => groupRules(scheme.rules), [scheme]);

  return (
    <>
      <p className={introClass} style={{color: styles.g(0.3, 0.7)}}>
        Type these ASCII keys to enter <strong>{scheme.name}</strong>. Multi-character sequences are matched
        longest-first — e.g. typing <code>s</code> then <code>h</code> rewrites the previous letter when <code>sh</code>{' '}
        matches a digraph rule.
      </p>
      <div className={gridClass}>
        {groups.map((group) => (
          <RuleGroupSection key={group.title} group={group} />
        ))}
        <FinalForms scheme={scheme} />
      </div>
    </>
  );
};

const OFF_TAB_KEY = 'off';

export const TranslitMapModal: React.FC = () => {
  const mutxt = useMuTxt();
  const openId = mutxt.translit.mapOpen.use();
  const activeMode = mutxt.translit.active.use();
  const close = React.useCallback(() => mutxt.translit.closeMap(), [mutxt]);
  const schemes = mutxt.translit.list();
  if (!openId) return null;
  const active = mutxt.translit.schemes.get(openId) ?? schemes[0];
  if (!active) return null;
  const langCounts = new Map<string, number>();
  for (const s of schemes) langCounts.set(s.language, (langCounts.get(s.language) ?? 0) + 1);
  const tabItems = [
    {key: OFF_TAB_KEY, label: 'Off'},
    ...schemes.map((scheme) => {
      const ambiguous = (langCounts.get(scheme.language) ?? 0) > 1;
      const [label, suffix] = splitName(scheme.name);
      return {
        key: scheme.id,
        label: ambiguous && suffix ? `${label} (${suffix})` : label,
      };
    }),
  ];

  const activeTab = activeMode ?? OFF_TAB_KEY;

  return (
    <ModalOverlay open={true} title="Transliteration" onClose={close}>
      <div className={wrapperClass}>
        <div className={tabsWrapClass}>
          <Tabs
            items={tabItems}
            active={activeTab}
            onChange={(id) => {
              if (id === OFF_TAB_KEY) {
                mutxt.translit.off();
                return;
              }
              mutxt.translit.mapOpen.set(id);
              mutxt.translit.on(id);
            }}
            spread
            muted
          />
        </div>
        <div className={contentsClass}>{activeTab === OFF_TAB_KEY ? <EmptyState /> : <Body scheme={active} />}</div>
      </div>
    </ModalOverlay>
  );
};
