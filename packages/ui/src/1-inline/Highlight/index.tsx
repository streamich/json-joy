import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {highlight, highlightFuzzy, normalize} from './util';

const highlightClass = drule({
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
  bold?: boolean;
  query?: string[];
}

export const Highlight: React.FC<Props> = ({text, bold, query}) => {
  const styles = useStyles();
  const cls = highlightClass({
    fw: bold ? 'bold' : undefined,
    // bg: styles.light ? 'rgba(235, 213, 52,.5)' : 'rgba(255, 230, 80,.4)',
    // bg: styles.positive.fg.pct(0, .2, .1, -.7) + '',
    // bg: styles.warning.fg.pct(0, .2, .1, -.7) + '',
    bg: styles.brand2.fg.pct(0, 0.2, 0.1, -0.7) + '',
    // bg: styles.ai.fg.pct(0, .2, .1, -.7) + '',
    // bg: styles.positive.fg.pct(0, .3, 0, -.7) + '',
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
