import * as React from 'react';
import {useDemos} from '../context';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {FixedColumn} from 'nice-ui/lib/3-list-item/FixedColumn';
import useWindowSize from 'react-use/lib/useWindowSize';
import {Title} from './Title';
import {Display} from './Display';
import {PreviewSideNav} from './PreviewSideNav';

export interface PreviewProps {
  id: string;
}

export const Preview: React.FC<PreviewProps> = ({id}) => {
  const state = useDemos();
  const file = useBehaviorSubject(state.file$);
  const {width} = useWindowSize();

  const isSmall = width < 1000;

  if (!file) return null;

  return (
    <div>
      <Title file={file} />
      <FixedColumn right={320} stack={isSmall}>
        <div>
          <Display file={file} />
        </div>
        <div style={{paddingLeft: isSmall ? 0 : 64, width: '100%', boxSizing: 'border-box'}}>
          <PreviewSideNav id={id} />
        </div>
      </FixedColumn>
    </div>
  );
};
