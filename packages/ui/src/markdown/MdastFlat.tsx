import * as React from 'react';
import type {MdastProps, MdastContextValue} from './types';
import {renderers as defaultRenderers} from './renderers';
import {rule, theme, useTheme} from 'nano-theme';
import MarkdownFullWidthBlock from './util/MarkdownFullWidthBlock';
import {context} from './context';
import {md} from './parser';
import {replace} from 'mdast-flat';
import type {Flat} from 'mdast-flat/lib/types';
import useMountedState from 'react-use/lib/useMountedState';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect';

const {useState, useCallback, useMemo} = React;

const resetClass = rule({
  'h1,h2,h3,h4,h5,h6,p,blockquote,code,pre,table': {
    mar: 0,
    pad: 0,
  },
});
const markdownClass = rule({
  ...theme.font.sans,
  lh: 1.6,
  ww: 'break-word',
  'overflow-wrap': 'break-word',
  'word-break': 'break-word',
  '-webkit-hyphens': 'auto',
  hyphens: 'auto',
  mark: {
    bdrad: '.25em',
    bg: '#ff0',
    // bg: '#ff6',
    pad: '0 .125em',
    mar: '0 -.125em',
  },
  a: {
    col: '#006dff',
    bdb: '1px solid rgba(0,137,255,.3)',
    td: 'none',
    '&:hover': {
      color: '#ec1020',
      bdb: '1px solid rgba(244,18,36,.3)',
    },
    '&:has(img)': {
      bdb: 0,
    },
  },
  ul: {
    mar: 0,
    pad: '0 0 0 24px',
  },
});

export const MdastFlat: React.FC<MdastProps> = ({...props}) => {
  const {placeholdersAfter, placeholdersAfterLength} = props;
  props.renderers ??= defaultRenderers;
  props.maxPlaceholders ??= Infinity;
  props.LoadingBlock ??= () => null;
  const theme = useTheme();
  const isMounted = useMountedState();
  const [ast, setAst] = useState<Flat>(props.ast);
  useIsomorphicLayoutEffect(() => {
    setAst(props.ast);
  }, [props.ast]);
  const expandBlock: MdastContextValue['expandBlock'] = useCallback(async (idx, url) => {
    if (!props.expand) return;
    const res = await props.expand(url);
    if (!isMounted) return;
    setAst((oldAst) => {
      const newAst = md(res.src || '');
      return replace(oldAst, idx, newAst);
    });
  }, []);
  const computedPlaceholdersAfter = useMemo(() => {
    if (typeof placeholdersAfterLength !== 'number') return 0;
    const root = ast.nodes[0];
    let computedLength = 0;
    let result = 0;
    for (const idx of root.children as any as number[]) {
      const node = ast.nodes[idx];
      computedLength += node.len || 0;
      result++;
      if (computedLength > placeholdersAfterLength) {
        break;
      }
    }
    return result ? Math.min(result, placeholdersAfter || result) : placeholdersAfter;
  }, [ast, placeholdersAfterLength]);

  const {renderers, isFullWidth, hideFootnotes, fontSize} = props;

  if (!renderers) return null;

  const contextValue: MdastContextValue = {
    ast,
    props,
    expandBlock,
    placeholdersAfter: computedPlaceholdersAfter || 0,
  };

  let footnotes = hideFootnotes ? null : renderers.footnotes(renderers, props.ast, 0, props, contextValue);

  if (isFullWidth && footnotes) {
    footnotes = <MarkdownFullWidthBlock>{footnotes}</MarkdownFullWidthBlock>;
  }

  const style: React.CSSProperties = {
    color: theme.g(0.1, 0.9),
  };
  if (fontSize) {
    style.fontSize = fontSize + 'px';
  }

  const Component = props.inline ? 'span' : 'div';

  return (
    <context.Provider value={contextValue}>
      <Component
        className={props.inline ? undefined : resetClass + markdownClass}
        style={props.inline ? undefined : style}
        data-testid="Markdown"
        onDoubleClick={props.onDoubleClick}
      >
        {props.inlineChildren
          ? renderers.children(renderers, ast, props.nodeId || 0, props, contextValue)
          : renderers.node(renderers, ast, props.nodeId || 0, props, contextValue)}
        {footnotes}
      </Component>
    </context.Provider>
  );
};
