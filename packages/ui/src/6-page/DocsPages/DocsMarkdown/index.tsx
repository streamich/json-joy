import * as React from 'react';
import type {Flat} from 'mdast-flat/lib/types';
import {rule, theme} from 'nano-theme';
import {renderers as defaultRenderers} from '../../../markdown/renderers';
import renderParagraph from './renderers/renderParagraph';
import renderHeading from './renderers/renderHeading';
import renderCode, {introClass} from './renderers/renderCode';
import renderLink from './renderers/renderLink';
import Contents from './components/Contents';
import {context} from './context';
import {MdastFlat} from '../../../markdown/MdastFlat';

const renderers: typeof defaultRenderers = {
  ...defaultRenderers,
  paragraph: renderParagraph,
  heading: renderHeading,
  code: renderCode,
  link: renderLink,
};

const blockClass = rule({
  ...theme.font.sans.mid,
  fw: 400,
  p: {
    ...theme.font.ui3,
    // maxW: '700px',
    lh: '1.76em',
  },
  '.ff-note p': {
    lh: '1.5em',
  },
  [`& .${introClass.trim()} p`]: {
    ...theme.font.ui1.mid,
    lh: '1.5em',
  },
  '& p+p, & pre+p, & pre+ul, & pre+div, & ul+p, & div:not(.invisible)+p, & ul+div:not(.invisible)': {
    padt: '2em',
  },
  '& p+pre, & p+div, & div+div': {
    mart: '2em',
  },
  'h1+p,h2+p,h3+p,h4+p,h5+p,h6+p': {
    padt: '1em',
  },
  'h1+div,h2+div,h3+div,h4+div,h5+div,h6+div': {
    mart: '1em',
  },
  'h1+ul,h2+ul,h3+ul,h4+ul,h5+ul,h6+ul': {
    mart: '1em',
  },
  'h1+pre,h2+pre,h3+pre,h4+pre,h5+pre,h6+pre': {
    mart: '1em',
  },
  'p+ul': {
    padt: '1em',
  },
  'ul p+ul': {
    padt: 0,
  },
  'h1,h2,h3,h4,h5,h6': {
    ...theme.font.ui1.mid,
    fw: 500,
    padt: '1.5em',
    mar: 0,
    lh: 1.2,
  },
  'h1:first-child,h2:first-child,h3:first-child,h4:first-child,h5:first-child,h6:first-child': {
    padt: 0,
  },
  h1: {
    fz: 36 / 16 + 'em',
  },
  h2: {
    fz: 26 / 16 + 'em',
  },
  h3: {
    fz: 22 / 16 + 'em',
    col: theme.g(0.1),
  },
  h4: {
    fz: 20 / 16 + 'em',
    col: theme.g(0.2),
  },
  h5: {
    fz: 18 / 16 + 'em',
    col: theme.g(0.3),
  },
  h6: {
    fz: 16 / 16 + 'em',
    col: theme.g(0.4),
  },
});

const blockDisplayClass = rule({
  h1: {
    fz: 40 / 16 + 'em',
  },
  h2: {
    fz: 30 / 16 + 'em',
  },
  h3: {
    fz: 22 / 16 + 'em',
  },
  h4: {
    fz: 20 / 16 + 'em',
  },
  h5: {
    fz: 18 / 16 + 'em',
  },
  h6: {
    fz: 16 / 16 + 'em',
  },
});

const blockFont1Class = rule({
  ...theme.font.sans,
  p: {
    ...theme.font.sans,
    lh: '1.76em',
  },
});

export interface Props {
  ast: Flat | (() => Promise<Flat>);
  fontSize?: number;
  font1?: boolean;
  contents?: boolean;
  contentsRight?: boolean;
  contentWidth?: number;
  display?: boolean;
}

const DocsMarkdown: React.FC<Props> = ({
  ast,
  fontSize = 17.8,
  font1,
  contents,
  contentsRight,
  contentWidth,
  display,
}) => {
  const [resolvedAst, setResolvedAst] = React.useState(typeof ast === 'function' ? null : ast);

  React.useEffect(() => {
    if (typeof ast === 'function') {
      ast().then(setResolvedAst);
    }
  }, [ast]);

  return (
    <context.Provider value={{contentWidth}}>
      {!!contents && !!resolvedAst && <Contents right={contentsRight} ast={resolvedAst} renderers={renderers} />}
      <div className={'invisible' + blockClass + (font1 ? blockFont1Class : '') + (display ? blockDisplayClass : '')}>
        {!!resolvedAst && <MdastFlat ast={resolvedAst} renderers={renderers} fontSize={fontSize} />}
      </div>
    </context.Provider>
  );
};

export default DocsMarkdown;
