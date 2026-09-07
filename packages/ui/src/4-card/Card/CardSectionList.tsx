import * as React from 'react';
import {rule} from 'nano-theme';
import {Eyebrow} from '../../1-inline/Eyebrow';
import {PropertyRow} from './PropertyRow';

/**
 * One entry in a {@link CardSectionList}. A `field` is a labeled value row; a
 * `promoted` section is a *hoisted inner thing* — a labeled eyebrow group whose
 * own `sections` render beneath it (the design's `promote` embed mode, recursive).
 */
export interface CardSection {
  id?: string;
  /** Eyebrow label — the field name, or (for `promoted`) the field's *role*. */
  label?: React.ReactNode;
  /** Value / body. An editor node when the field is under edit. */
  content?: React.ReactNode;
  /** Leading field icon. */
  icon?: React.ReactNode;
  /** `field` = one property row; `promoted` = an eyebrow group of nested sections. @default 'field' */
  kind?: 'field' | 'promoted';
  /** Child sections (promoted recursion). */
  sections?: CardSection[];
  /** Trailing per-row control (e.g. a Download button). */
  action?: React.ReactNode;
  /** The field is editable in place (hover affordance + chevron). */
  editable?: boolean;
  onActivate?: () => void;
}

const listClass = rule({
  d: 'flex',
  flexDirection: 'column',
  w: '100%',
  minW: 0,
});

const gridClass = rule({
  d: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: '18px',
  w: '100%',
  minW: 0,
});

const groupClass = rule({
  d: 'flex',
  flexDirection: 'column',
  gap: '4px',
  pd: '4px 0',
});

const groupHeadClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '8px',
});

const groupBodyClass = rule({
  d: 'flex',
  flexDirection: 'column',
  pl: '2px',
});

export interface CardSectionListProps {
  sections: CardSection[];
  /** `grid` lays field rows out in two columns (the property-card key/value grid). @default 'list' */
  variant?: 'list' | 'grid';
  className?: string;
  style?: React.CSSProperties;
}

const renderSection = (section: CardSection, key: React.Key): React.ReactNode => {
  if (section.kind === 'promoted') {
    return (
      <div className={groupClass} key={key}>
        <div className={groupHeadClass}>
          {section.label !== undefined && <Eyebrow>{section.label}</Eyebrow>}
          {section.action !== undefined && section.action !== null && section.action}
        </div>
        {section.content !== undefined && section.content !== null && <div>{section.content}</div>}
        {!!section.sections?.length && (
          <div className={groupBodyClass}>
            {section.sections.map((child, i) => renderSection(child, child.id ?? i))}
          </div>
        )}
      </div>
    );
  }
  return (
    <PropertyRow
      key={key}
      icon={section.icon}
      label={section.label}
      action={section.action}
      editable={section.editable}
      onActivate={section.onActivate}
    >
      {section.content}
    </PropertyRow>
  );
};

export const CardSectionList: React.FC<CardSectionListProps> = ({sections, variant = 'list', className, style}) => {
  // The two-column grid only applies to flat field rows; promoted groups still
  // span the full width so their nested lists stay readable.
  const hasPromoted = sections.some((s) => s.kind === 'promoted');
  const useGrid = variant === 'grid' && !hasPromoted;
  return (
    <div className={(useGrid ? gridClass : listClass) + (className ? ' ' + className : '')} style={style}>
      {sections.map((section, i) => renderSection(section, section.id ?? i))}
    </div>
  );
};
