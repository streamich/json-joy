import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {highlight, highlightFuzzy, normalize} from './util';

const highlightClass = drule({
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
  const styles = useStyles();
  const cls = highlightClass({
    bg: styles.light ? 'rgba(235, 213, 52,.5)' : 'rgba(255, 230, 80,.4)',
  });
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
        <span key={i} className={cls}>
          {preserveSpaces(part[0])}
        </span>
      ),
    );
  }, [text, query, cls]);

  return React.createElement(React.Fragment, {}, ...parts);
};
