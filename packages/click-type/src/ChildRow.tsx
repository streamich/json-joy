import {rule} from 'nano-theme';
import * as React from 'react';
import {bareContext, hideToggleContext} from './context';
import {rowBox} from './css';
import {TypeHoverable} from './TypeHoverable';

/** A child row, nudged 4px right — for value-section members (array elements, map/fn entries, bin). */
const childIndent = rule({
  d: 'block',
  lh: '1.7',
  pdl: '4px',
});

const childLabel = rule({
  d: 'inline-block',
  mrr: '6px',
  va: 'top',
  col: 'var(--ct-label)',
  '&::after': {content: '":"'},
});

export interface ChildRowProps {
  /** Optional label rendered before the child (e.g. `items`, `req`, `[0]`). */
  label?: React.ReactNode;
  /** JSON Pointer of the value, used for the row's hoverable region. */
  pointer: string;
  children: React.ReactNode;
}

/**
 * A labeled line inside a composite type's children list (array elements, map
 * entries, fn req/res). The whole `label: value` row is a single hoverable
 * region; the value renders bare ({@link bareContext}) so it doesn't add a
 * second overlapping region, and its collapse triangle is hidden (it would
 * float next to the label). Unlabeled rows just render the value as its own node.
 */
export const ChildRow: React.FC<ChildRowProps> = ({label, pointer, children}) => {
  const labelled = label !== undefined && label !== '';
  if (!labelled) return <span className={childIndent}>{children}</span>;
  return (
    <span className={childIndent}>
      <TypeHoverable pointer={pointer}>
        <span className={rowBox}>
          <span className={childLabel}>{label}</span>
          <bareContext.Provider value={true}>
            <hideToggleContext.Provider value={true}>{children}</hideToggleContext.Provider>
          </bareContext.Provider>
        </span>
      </TypeHoverable>
    </span>
  );
};
