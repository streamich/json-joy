import * as React from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import {Code} from '../../../1-inline/Code';
import {Highlight} from '../../../1-inline/Highlight';

interface Props {
  name: string;
  id?: string;
  ellipsis?: boolean;
  highlight?: string[];
}

export const ItemText: React.FC<Props> = ({id, name, ellipsis, highlight}) => {
  const {width} = useWindowSize();

  const isVerySmall = width < 540;

  return (
    <span style={{userSelect: 'none'}}>
      <Highlight text={name} query={highlight} />
      {ellipsis ? ' …' : null}
      {!isVerySmall && (
        <span style={{visibility: id ? undefined : 'hidden'}}>
          &nbsp;&nbsp;—&nbsp;&nbsp;
          <Code alt size={-1}>
            {id || '.'}
          </Code>
        </span>
      )}
    </span>
  );
};
