import * as React from 'react';
import {theme, rule} from 'nano-theme';

const blockClass = rule({
  pad: 0,
  mar: 0,
  '&+&': {
    pad: '16px 0 0',
  },
});

const titleClass = rule({
  ...theme.font.ui2.bold,
  fz: '14px',
  w: '100%',
  pad: '4px 0 10px',
  mar: 0,
});

const descriptionClass = rule({
  ...theme.font.ui2.mid,
  fz: '12px',
  op: 0.75,
  w: '100%',
  pad: '8px 0 0',
  mar: 0,
});

export interface FormRowProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export const FormRow: React.FC<FormRowProps> = ({title, description, children}) => {
  return (
    <div className={blockClass}>
      {!!title && <div className={titleClass}>{title}</div>}
      {children}
      {!!description && <div className={descriptionClass}>{description}</div>}
    </div>
  );
};
