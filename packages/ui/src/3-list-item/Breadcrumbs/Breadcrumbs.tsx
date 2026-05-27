import * as React from 'react';
import {rule} from 'nano-theme';
import {SetNamedTrace} from '../../context/traces';

export const hidePreviewAt = 900;

const blockClass = rule({
  d: 'flex',
  flw: 'wrap',
  alignItems: 'center',
  fz: '16px',
  us: 'none',
});

const separatorClass = rule({
  d: 'inline-block',
  pad: '0 8px',
  lh: 1,
  op: 0.4,
});

export interface BreadcrumbsProps {
  crumbs: React.ReactNode[];
  compact?: boolean;
  /** Render in greyscale, darken on hover instead of using the brand link color. */
  dim?: boolean;
  style?: React.CSSProperties;
}

const Body: React.FC<BreadcrumbsProps> = ({crumbs, compact, style}) => (
  <nav className={blockClass} style={{...style, fontSize: compact ? '12px' : void 0}} aria-label="Breadcrumb">
    {crumbs.map((item, index) => {
      const isLast = index === crumbs.length - 1;
      return (
        <React.Fragment key={index}>
          {item}
          {!isLast && (
            <span
              className={separatorClass}
              style={{padding: compact ? '0 2px' : void 0, fontSize: compact ? '11px' : void 0}}
            >
              /
            </span>
          )}
        </React.Fragment>
      );
    })}
  </nav>
);

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({dim, ...rest}) => {
  if (!dim) return <Body {...rest} />;
  return (
    <SetNamedTrace name="subtle" value={true}>
      <Body {...rest} />
    </SetNamedTrace>
  );
};
