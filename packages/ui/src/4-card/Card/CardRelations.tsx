import * as React from 'react';
import {rule} from 'nano-theme';
import {Eyebrow} from '../../1-inline/Eyebrow';

const wrapClass = rule({
  d: 'flex',
  flexDirection: 'column',
  gap: '8px',
  w: '100%',
  minW: 0,
});

const rowClass = rule({
  d: 'flex',
  ai: 'center',
  flexWrap: 'wrap',
  gap: '6px',
  minW: 0,
});

const groupClass = rule({
  d: 'flex',
  flexDirection: 'column',
  gap: '5px',
  minW: 0,
});

/** One labeled group of relations (e.g. "Assignees", "Attachments"). */
export interface RelationGroup {
  label?: React.ReactNode;
  items: React.ReactNode;
}

export interface CardRelationsProps {
  children?: React.ReactNode;
  /** Or, relations grouped by role — each with an eyebrow label above its row. */
  groups?: RelationGroup[];
  className?: string;
  style?: React.CSSProperties;
}

export const CardRelations: React.FC<CardRelationsProps> = ({children, groups, className, style}) => {
  if (groups?.length) {
    return (
      <div className={wrapClass + (className ? ' ' + className : '')} style={style}>
        {groups.map((group, i) => (
          <div className={groupClass} key={i}>
            {group.label !== undefined && group.label !== null && <Eyebrow>{group.label}</Eyebrow>}
            <div className={rowClass}>{group.items}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={rowClass + (className ? ' ' + className : '')} style={style}>
      {children}
    </div>
  );
};
