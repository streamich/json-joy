import * as React from 'react';
import {rule} from 'nano-theme';
import {highlight, highlightFuzzy, normalize} from './util';

const highlightClass = rule({
  bg: 'rgba(235, 213, 52,.5)',
  fw: 'bold',
  bdrad: '3px',
  pad: '1px 3px',
  mar: '-1px -3px',
});

const preserveSpaces = (text: string): React.ReactNode => {
  const leading = text[0] === ' ';
  const trailing = text[text.length - 1] === ' ';
  if (!leading && !trailing) return text;
  return (
    <>
      {leading ? <>&nbsp;</> : null}
      {text.trim()}
      {trailing ? <>&nbsp;</> : null}
    </>
  );
};

export interface Props {
  text: string;
  query?: string[];
}

export const Highlight: React.FC<Props> = ({text, query}) => {
  const parts = React.useMemo(() => {
    if (!query) return [text];
    let highlighted = highlight(text, query);
    if (highlighted.length === 1 && typeof highlighted[0] === 'string')
      highlighted = highlightFuzzy(text, query.join(''));
    else highlighted = normalize(highlighted);
    return highlighted.map((part, i) =>
      typeof part === 'string' ? (
        preserveSpaces(part)
      ) : (
        // biome-ignore lint/suspicious/noArrayIndexKey: index is positionally stable
        <span key={i} className={highlightClass}>
          {preserveSpaces(part[0])}
        </span>
      ),
    );
  }, [text, query]);

  return React.createElement(React.Fragment, {}, ...parts);
};
