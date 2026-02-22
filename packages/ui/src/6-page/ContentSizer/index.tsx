import * as React from 'react';
import {rule} from 'nano-theme';
import {useContentSize} from './context';
import {NiceUiSizes} from '../../constants';

const blockClass = rule({
  bxz: 'border-box',
  mar: 'auto',
  trs: 'padding-left .2s',
});

const paddingClass = rule({
  maxW: NiceUiSizes.SiteWidth + 'px',
});

export interface Props {
  scroll?: boolean;
  padding?: boolean;
  children: React.ReactNode;
}

export const ContentSizer: React.FC<Props> = ({scroll, padding, children}) => {
  const {paddingLeft} = useContentSize();

  const style: React.CSSProperties = {
    paddingLeft,
  };

  if (scroll) {
    style.paddingBottom = '0 0 calc(100vh - 150px)';
  }

  return (
    <div className={blockClass + (padding ? paddingClass : '')} style={style}>
      {children}
    </div>
  );
};
