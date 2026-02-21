import * as React from 'react';
import {rule} from 'nano-theme';

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
  op: 0.4,
});

export interface BreadcrumbsProps {
  crumbs: React.ReactNode[];
  compact?: boolean;
  style?: React.CSSProperties;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({crumbs, compact, style}) => {
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: breadcrumb landmark pattern
    <div className={blockClass} style={{...style, fontSize: compact ? '12px' : void 0}} aria-label="breadcrumb">
      {crumbs.map((item, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: index is positionally stable
          <React.Fragment key={index}>
            {item}
            {!isLast && (
              <span className={separatorClass} style={{padding: compact ? '0 2px' : void 0}}>
                /
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
