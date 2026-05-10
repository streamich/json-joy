import {lightTheme, drule} from 'nano-theme';
import * as React from 'react';
import {useStyles} from '../../../../styles/context';
import {NiceUiSizes} from '../../../../constants';

const blockClass = drule({
  bdrad: '8px',
  mar: '0 0 32px',
  pad: '32px',
  '&+p': {
    mart: '-32px',
  },
  [`@media(max-width: ${NiceUiSizes.BlogContentMaxWidth}px)`]: {
    pad: '16px',
  },
});

const contentsClass = drule({
  ...lightTheme.font.ui2.mid,
  fz: '10px',
  textTransform: 'uppercase',
  marb: '8px',
  [`@media(max-width: ${NiceUiSizes.BlogContentMaxWidth}px)`]: {
    bdb: 0,
  },
});

export interface Props {
  title: React.ReactNode;
  children: React.ReactNode;
}

const InlineCard: React.FC<Props> = ({title, children}) => {
  const styles = useStyles();
  return (
    <div className={blockClass({bd: `1px solid ${styles.g(0.9)}`})}>
      <div
        className={contentsClass({
          col: styles.g(0.5),
          bdb: `1px solid ${styles.g(0.92)}`,
        })}
      >
        {title}
      </div>
      {children}
    </div>
  );
};

export default InlineCard;
