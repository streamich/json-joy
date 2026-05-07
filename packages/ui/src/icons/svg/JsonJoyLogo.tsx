import {rule, drule} from 'nano-theme';
import * as React from 'react';
import {useStyles} from '../../styles/context';

const brand = ['#E44A28', '#985DF7', '#EE69B1', '#F6A832', '#5FCC8A', '#58B9F8'];

const shape1Class = drule({
  'a:hover &, svg:hover &': {
    fill: brand[0],
  },
});

const shape2Class = drule({
  'a:hover &, svg:hover &': {
    fill: brand[1],
  },
});

const shape3Class = drule({
  'a:hover &, svg:hover &': {
    fill: brand[2],
  },
});

const shape4Class = drule({
  'a:hover &, svg:hover &': {
    fill: brand[3],
  },
});

const shape5Class = drule({
  'a:hover &, svg:hover &': {
    fill: brand[4],
  },
});

const shape6Class = drule({
  'a:hover &, svg:hover &': {
    fill: brand[5],
  },
});

export interface Props {
  size?: number;
  color?: boolean;
}

const SvgFF: React.FC<Props> = ({size = 36, color = false}) => {
  const styles = useStyles();

  // const grey1 = '#bababa';
  // const grey2 = '#d9d9d9';

  const grey1 = styles.g(0.8);
  const grey2 = styles.g(0.7);

  return (
    <svg width={size} viewBox="0 0 92 57" fill="none">
      <path
        className={shape1Class({fill: grey2})}
        style={{fill: color ? brand[0] : void 0}}
        d="M0 34H23V57C10.2975 57 0 46.7025 0 34Z"
      />
      <path
        className={shape2Class({fill: grey1})}
        style={{fill: color ? brand[1] : void 0}}
        d="M46 31.5H23V57C35.7025 57 46 46.7025 46 34V31.5Z"
      />
      <rect
        className={shape3Class({fill: grey1})}
        style={{fill: color ? brand[2] : void 0}}
        x="23"
        width="23"
        height="34"
      />
      <path
        className={shape4Class({fill: grey2})}
        style={{fill: color ? brand[3] : void 0}}
        d="M46 34H69V57C56.2975 57 46 46.7025 46 34Z"
      />
      <path
        className={shape5Class({fill: grey1})}
        style={{fill: color ? brand[4] : void 0}}
        d="M92 31H69V57C81.7025 57 92 46.7025 92 34V31Z"
      />
      <rect
        className={shape6Class({fill: grey1})}
        style={{fill: color ? brand[5] : void 0}}
        x="69"
        width="23"
        height="34"
      />
    </svg>
  );
};

export default SvgFF;
