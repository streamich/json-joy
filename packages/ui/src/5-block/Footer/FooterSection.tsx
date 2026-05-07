import * as React from 'react';
import {makeRule, rule, m2} from 'nano-theme';

const sectionClass = rule({
  pad: '36px 0 0',
  w: '190px',
});

const useSectionHeadingClass = makeRule((t) => ({
  ...t.font.ui2.bold,
  fz: '10px',
  col: t.g(0.5),
  textTransform: 'uppercase',
}));

const useSectionListClass = makeRule((t) => ({
  listStyle: 'none',
  pad: '14px 0 0',
  mar: 0,
  li: {
    ...t.font.ui2.mid,
    fw: 500,
    d: 'flex',
    fz: '14px',
    h: '36px',
    alignItems: 'center',
    p: {
      pad: 0,
      mar: 0,
      a: {
        pad: '3px 0',
        col: t.g(0.3),
        bdb: '1px solid transparent',
        '&:hover': {
          col: t.g(0.1),
          bdb: `1px solid ${t.g(0.7)}`,
        },
      },
    },
    [`@media (max-width: ${m2}px)`]: {
      h: '24px',
    },
  },
}));

export interface FooterSectionProps {
  title: React.ReactNode;
  children: React.ReactNode | React.ReactNode[];
}

export const FooterSection: React.FC<FooterSectionProps> = ({title, children}) => {
  const sectionHeadingClass = useSectionHeadingClass();
  const sectionListClass = useSectionListClass();
  const list = children instanceof Array ? children : [children];

  return (
    <div className={sectionClass}>
      <div className={sectionHeadingClass}>{title}</div>
      <ul className={sectionListClass}>
        {list.map((child, i) => (
          <li key={i}>
            <p>{child}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
