import type {SchemaBase} from '@jsonjoy.com/json-type';
import {Breadcrumb} from '@jsonjoy.com/ui/lib/3-list-item/Breadcrumbs/Breadcrumb';
import {Breadcrumbs} from '@jsonjoy.com/ui/lib/3-list-item/Breadcrumbs/Breadcrumbs';
import {rule} from 'nano-theme';
import * as React from 'react';
import {buildCrumbs, crumbLabel, useIsolation} from './isolation';

const block = rule({
  d: 'block',
  mr: '0 0 6px',
});

export interface IsolationBreadcrumbsProps {
  /** The true root schema the {@link pointer} is resolved against. */
  root: SchemaBase;
  /** Absolute JSON Pointer of the currently isolated node. */
  pointer: string;
}

/**
 * The first line shown while a node is isolated: a compact breadcrumb trail from
 * the root down to the isolated node. Clicking an ancestor crumb isolates *that*
 * ancestor; clicking the root crumb (or the implicit `''` it carries) clears
 * isolation and restores the full tree. The last crumb is the current node and
 * is rendered highlighted but inert.
 */
export const IsolationBreadcrumbs: React.FC<IsolationBreadcrumbsProps> = ({root, pointer}) => {
  const {isolate} = useIsolation();
  const crumbs = React.useMemo(() => buildCrumbs(root, pointer), [root, pointer]);
  const last = crumbs.length - 1;

  const nodes = crumbs.map((crumb, i) => {
    const current = i === last;
    return (
      <span key={crumb.pointer || 'root'} style={{cursor: current ? 'default' : 'pointer'}}>
        <Breadcrumb
          compact
          selected={current}
          onMouseDown={
            current
              ? undefined
              : (e) => {
                  e.preventDefault();
                  isolate(crumb.pointer);
                }
          }
        >
          {crumbLabel(crumb.schema)}
        </Breadcrumb>
      </span>
    );
  });

  return (
    <span className={block}>
      <Breadcrumbs compact crumbs={nodes} />
    </span>
  );
};
