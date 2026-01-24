import * as React from 'react';
import type {ICode} from 'very-small-parser/lib/markdown/block/types';
import useWindowSize from 'react-use/lib/useWindowSize';
import useSize from 'react-use/lib/useSize';
import DocsMd from '../DocsMd';
import {NiceUiSizes} from '../../../../constants';

interface Options {
  rightOnly?: boolean;
}

export interface Props {
  node: ICode;
}

const Wide: React.FC<Props> = ({node}) => {
  // tslint:disable-next-line: no-eval ban
  const options: Options = node.meta ? eval('(' + (node.meta || '') + ')') : {};
  const wndSize = useWindowSize();
  const [element] = useSize((state) => {
    let width = NiceUiSizes.SiteWidth;
    width = Math.min(width, wndSize.width - 32);
    if (width < state.width) width = state.width;
    let marginLeft = width > state.width ? -((width - state.width) / 2) : 0;
    if (options.rightOnly) {
      width += marginLeft;
      marginLeft = 0;
    }
    return (
      <div>
        <div style={{width, marginLeft}}>
          <DocsMd md={node.value} />
        </div>
      </div>
    );
  });
  return element;
};

export default Wide;
