import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {lineHeight} from './constants';

const blockClass = rule({
  d: 'inline-block',
  w: '100%',
  ov: 'hidden',
});

const columnClass = rule({
  d: 'inline-block',
  float: 'left',
  w: '13%',
  h: lineHeight + 'px',
  mar: '4px 4px 0 0',
  bdrad: '3px',
});

interface Props {
  columns?: number;
}

const TablePlaceholder: React.FC<Props> = ({columns = 3}) => {
  const theme = useTheme();
  const background = theme.g(0, 0.1);

  return (
    <span className={blockClass}>
      <span className={columnClass} style={{background}} />
      {columns > 1 ? <span className={columnClass} style={{background, width: '8%'}} /> : null}
      {columns > 2 ? <span className={columnClass} style={{background, width: '8%'}} /> : null}
      {columns > 3 ? <span className={columnClass} style={{background, width: '8%'}} /> : null}
      {columns > 4 ? <span className={columnClass} style={{background, width: '8%'}} /> : null}
      {columns > 5 ? <span className={columnClass} style={{background, width: '8%'}} /> : null}
      {columns > 6 ? <span className={columnClass} style={{background, width: '8%'}} /> : null}
      {columns > 7 ? <span className={columnClass} style={{background, width: '8%'}} /> : null}
    </span>
  );
};

export default TablePlaceholder;
