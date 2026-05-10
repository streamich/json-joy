import * as React from 'react';
import {lightTheme, drule, rule, m2} from 'nano-theme';
import {useStyles} from '../../styles/context';

const sectionClass = rule({
  pad: '36px 0 0',
  w: '190px',
});

const sectionHeadingClass = drule({
  ...lightTheme.font.ui2.bold,
  fz: '10px',
  textTransform: 'uppercase',
});

const sectionListClass = drule({
  listStyle: 'none',
  pad: '14px 0 0',
  mar: 0,
  li: {
    ...lightTheme.font.ui2.mid,
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
        bdb: '1px solid transparent',
      },
    },
    [`@media (max-width: ${m2}px)`]: {
      h: '24px',
    },
  },
});

export interface FooterSectionProps {
  title: React.ReactNode;
  children: React.ReactNode | React.ReactNode[];
}

export const FooterSection: React.FC<FooterSectionProps> = ({title, children}) => {
  const styles = useStyles();
  const list = children instanceof Array ? children : [children];

  return (
    <div className={sectionClass}>
      <div className={sectionHeadingClass({col: styles.g(0.5)})}>{title}</div>
      <ul
        className={sectionListClass({
          li: {
            p: {
              a: {
                col: styles.g(0.3),
                '&:hover': {
                  col: styles.g(0.1),
                  bdb: `1px solid ${styles.g(0.7)}`,
                },
              },
            },
          },
        })}
      >
        {list.map((child, i) => (
          <li key={i}>
            <p>{child}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
