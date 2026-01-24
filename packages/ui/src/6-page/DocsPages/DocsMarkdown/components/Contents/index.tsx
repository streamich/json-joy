import {rule, theme} from 'nano-theme';
import * as React from 'react';
import {useT} from 'use-t';
import useWindowSize from 'react-use/lib/useWindowSize';
import ContentItem from './ContentItem';
import type {Renderers} from '../../../../../markdown/types';
import AsideContainer from '../Aside/AsideContainer';
import InlineCard from '../InlineCard';
import {NiceUiSizes} from '../../../../../constants';
import type {Flat} from 'mdast-flat/lib/types';

const blockClass = rule({
  bd: `1px solid ${theme.g(0.98)}`,
  bdrad: '8px',
  mar: '0 0 32px',
  pad: '32px',
  '&:hover': {
    bd: `1px solid ${theme.g(0.9)}`,
  },
  [`@media(max-width: ${NiceUiSizes.SiteWidth}px)`]: {
    bd: `1px solid ${theme.g(0.9)}`,
  },
});

const blockClassRight = rule({
  pad: '8px',
  bd: 0,
  '&:hover': {
    bd: 0,
  },
  [`@media(max-width: ${NiceUiSizes.SiteWidth}px)`]: {
    bd: 0,
  },
});

const contentsClass = rule({
  ...theme.font.ui2.mid,
  col: theme.g(0.5),
  fz: '10px',
  // ta: 'right',
  textTransform: 'uppercase',
  marb: '8px',
  bdb: `1px solid ${theme.g(0.92)}`,
  [`@media(min-width: ${NiceUiSizes.SiteWidth}px)`]: {
    op: 0.4,
    [`.${blockClass.trim()}:hover &`]: {
      op: 1,
    },
  },
});

export interface Props {
  ast: Flat;
  renderers?: Renderers;
  right?: boolean;
}

const Contents: React.FC<Props> = ({ast, renderers, right}) => {
  const [t] = useT();
  const wndSize = useWindowSize();
  const contents = ast.contents;

  if (!contents || contents.length < 2) return null;

  const headings: React.ReactNode[] = [];

  for (let i = 0; i < contents.length; i++) {
    const headingId = contents[i];
    const node = ast.nodes[headingId];
    headings.push(<ContentItem key={i} node={node} ast={ast} renderers={renderers} />);
  }

  const isLargeScreen = wndSize.width >= 1600;

  if (isLargeScreen) {
    return (
      <AsideContainer left={!right}>
        <div className={blockClass + (right ? blockClassRight : '')}>
          {!right && <div className={contentsClass}>{t('Contents')}</div>}
          {headings}
        </div>
      </AsideContainer>
    );
  }

  return <InlineCard title={t('Contents')}>{headings}</InlineCard>;
};

export default Contents;
