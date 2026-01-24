import * as React from 'react';
import {MdastFlat} from './MdastFlat';
import {md, mdi} from './parser';
import type {MdastProps} from './types';

const {useMemo} = React;

export interface Props
  extends Pick<
    MdastProps,
    | 'to'
    | 'isCompact'
    | 'isFullWidth'
    | 'hideFootnotes'
    | 'isExpandable'
    | 'expand'
    | 'fontSize'
    | 'onDoubleClick'
    | 'scaleUpEmojiSrc'
    | 'placeholdersAfter'
    | 'placeholdersAfterLength'
    | 'maxPlaceholders'
    | 'LoadingBlock'
  > {
  src?: string | null;

  /**
   * Parse Markdown source only to inline elements and render
   * only inline elements.
   */
  inline?: boolean;
}

export const Markdown: React.FC<Props> = ({src, inline, ...mdastFLatProps}) => {
  const ast = useMemo(() => (inline ? mdi : md)(src || ''), [inline, src]);

  return <MdastFlat {...mdastFLatProps} inline={inline} ast={ast} />;
};
