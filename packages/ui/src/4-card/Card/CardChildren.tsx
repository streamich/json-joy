import * as React from 'react';
import {rule} from 'nano-theme';

const stackClass = rule({
  d: 'flex',
  flexDirection: 'column',
  gap: '8px',
  w: '100%',
  minW: 0,
});

const galleryClass = rule({
  d: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: '10px',
  w: '100%',
  minW: 0,
});

const checklistClass = rule({
  d: 'flex',
  flexDirection: 'column',
  gap: '4px',
  w: '100%',
  minW: 0,
});

export interface CardChildrenProps {
  children: React.ReactNode;
  /** `stack` = vertical list, `gallery` = responsive grid, `checklist` = tight rows. @default 'stack' */
  layout?: 'stack' | 'gallery' | 'checklist';
  className?: string;
  style?: React.CSSProperties;
}

export const CardChildren: React.FC<CardChildrenProps> = ({children, layout = 'stack', className, style}) => {
  const cls = layout === 'gallery' ? galleryClass : layout === 'checklist' ? checklistClass : stackClass;
  return (
    <div className={cls + (className ? ' ' + className : '')} style={style}>
      {children}
    </div>
  );
};
