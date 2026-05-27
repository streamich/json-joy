import * as React from 'react';
import {lightTheme, drule, rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {MiniTitle} from '../../3-list-item/MiniTitle';
import {Line} from '../../3-list-item/Line';

const sectionClass = rule({
  pad: '36px 0 0',
  w: '100%',
  maxW: '190px',
  minW: 0,
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
    minHeight: '36px',
    alignItems: 'center',
    minWidth: 0,
    p: {
      pad: 0,
      mar: 0,
      minWidth: 0,
      maxWidth: '100%',
      a: {
        pad: '3px 0',
        bdb: '1px solid transparent',
      },
    },
  },
});

const toggleClass = rule({
  ...lightTheme.font.ui2.mid,
  d: 'inline-flex',
  ai: 'center',
  gap: '4px',
  fw: 600,
  fz: '13px',
  bg: 'transparent',
  bd: 0,
  pad: '3px 0',
  mar: 0,
  cur: 'pointer',
  ff: 'inherit',
  '&:hover': {textDecoration: 'underline'},
});

export interface FooterSectionProps {
  title: React.ReactNode;
  children: React.ReactNode | React.ReactNode[];
  /**
   * When set, only the first N items are shown; the rest are visually hidden
   * behind a "See all" toggle. All items stay rendered in the DOM (for SEO).
   */
  collapseAfter?: number;
}

export const FooterSection: React.FC<FooterSectionProps> = ({title, children, collapseAfter}) => {
  const styles = useStyles();
  const [expanded, setExpanded] = React.useState(false);
  const list = children instanceof Array ? children : [children];
  const collapsible = typeof collapseAfter === 'number' && list.length > collapseAfter;

  return (
    <div className={sectionClass}>
      {/* <div className={sectionHeadingClass({col: styles.g(0.5)})}>{title}</div> */}
      <MiniTitle contrast>{title}</MiniTitle>
      {/* <Separator /> */}
      <Line strokeWidth={1} style="squiggly" color={styles.neutral.fg.pct(0, -0.22, 0.44, -0.3) + ''} />
      <ul
        className={sectionListClass({
          li: {
            p: {
              a: {
                col: styles.g(0.2),
                '&:hover': {
                  col: styles.g(0.05),
                  bdb: `1px solid ${styles.g(0.7)}`,
                },
              },
            },
          },
        })}
      >
        {list.map((child, i) => (
          <li key={i} style={collapsible && !expanded && i >= collapseAfter! ? {display: 'none'} : undefined}>
            <p>{child}</p>
          </li>
        ))}
        {collapsible && (
          <li>
            <p>
              <button
                type="button"
                className={toggleClass}
                style={{color: styles.g(0.35)}}
                onClick={() => setExpanded((e) => !e)}
              >
                {expanded ? 'Show less' : `See all ${list.length}`}
              </button>
            </p>
          </li>
        )}
      </ul>
    </div>
  );
};
